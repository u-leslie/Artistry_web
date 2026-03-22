import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { Express } from "express";
import { z } from "zod";
import { subscribersToCsv, subscribersToHtmlPage } from "./admin-view.ts";
import { welcomeEmailHtml, sendResendEmail } from "./emails.ts";
import {
  processDueDigestEmails,
  queueDigestFromSanityEvent,
  scheduleDigestWhenFlushReady,
} from "./process-digest.ts";
import { readStore, upsertSubscriber } from "./store.ts";
import { getSiteUrl } from "./site-url.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(160).optional(),
});

export function createApp(): Express {
  const app = express();
  const corsOrigins = process.env.CORS_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin:
        corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    }),
  );
  app.use(express.json({ limit: "256kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/subscribe", async (req, res) => {
    try {
      const parsed = subscribeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ ok: false, error: "Invalid email or name." });
        return;
      }

      const email = parsed.data.email.trim();
      const rawName = parsed.data.name?.trim();
      const guessed =
        rawName ||
        email
          .split("@")[0]
          ?.replace(/[._-]+/g, " ")
          .trim() ||
        "there";

      const { subscriber: sub, isNew } = upsertSubscriber(email, guessed);

      if (!isNew) {
        res.json({
          ok: true,
          alreadySubscribed: true,
          welcomeSent: false,
        });
        return;
      }

      const ownerBcc = (process.env.SUBSCRIBER_OWNER_EMAIL ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      let welcomeSent = false;
      if (process.env.RESEND_API_KEY) {
        const html = welcomeEmailHtml({ name: sub.name, siteUrl: getSiteUrl() });
        const r = await sendResendEmail({
          to: sub.email,
          subject: "Welcome to Artistry by Leslie",
          html,
          bcc: ownerBcc.length > 0 ? ownerBcc : undefined,
        });
        welcomeSent = r.ok;
        if (!r.ok) {
          console.error("[subscribe] welcome email failed:", r.error);
        }
      } else {
        console.warn(
          "[subscribe] RESEND_API_KEY missing — subscriber saved, no email sent.",
        );
      }

      res.json({ ok: true, alreadySubscribed: false, welcomeSent });
    } catch (err) {
      console.error("[subscribe]", err);
      res.status(500).json({
        ok: false,
        error: "Subscription could not be completed. Please try again.",
      });
    }
  });

  function verifyAdminSecret(req: express.Request): boolean {
    const expected = process.env.ADMIN_SECRET;
    if (!expected) {
      return false;
    }
    const auth = req.headers.authorization;
    if (auth === `Bearer ${expected}`) return true;
    const token =
      typeof req.query.token === "string" ? req.query.token : undefined;
    return token === expected;
  }

  app.get("/api/admin/subscribers", (req, res) => {
    if (!verifyAdminSecret(req)) {
      res.status(401).json({
        ok: false,
        error:
          "Unauthorized. Set ADMIN_SECRET in the server environment and send Authorization: Bearer <ADMIN_SECRET>.",
      });
      return;
    }

    const store = readStore();
    const rows = store.subscribers;
    const format =
      typeof req.query.format === "string" ? req.query.format : "json";

    if (format === "csv") {
      const csv = subscribersToCsv(rows);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="artistry-subscribers.csv"',
      );
      res.send(csv);
      return;
    }

    if (format === "html") {
      res.type("html").send(subscribersToHtmlPage(rows));
      return;
    }

    res.json({
      ok: true,
      count: rows.length,
      subscribers: rows,
    });
  });

  function verifyWebhookSecret(req: express.Request): boolean {
    const expected = process.env.SANITY_WEBHOOK_SECRET;
    if (!expected) {
      console.warn(
        "[webhook] SANITY_WEBHOOK_SECRET is not set — allowing requests (set this in production)",
      );
      return true;
    }
    const header =
      (req.headers["x-artistry-webhook-secret"] as string | undefined) ||
      (typeof req.query.secret === "string" ? req.query.secret : undefined);
    return header === expected;
  }

  function parseSanityWebhook(body: Record<string, unknown>): {
    id: string;
    type: string;
    at: Date;
  } | null {
    const result = body.result as
      | {
          _id?: string;
          _type?: string;
          _createdAt?: string;
          _updatedAt?: string;
        }
      | undefined;
    if (result?._id && result?._type) {
      const raw = result._updatedAt ?? result._createdAt;
      const at = raw ? new Date(raw) : new Date();
      return { id: result._id, type: result._type, at };
    }
    const doc = body.document as
      | {
          _id?: string;
          _type?: string;
          _createdAt?: string;
          _updatedAt?: string;
        }
      | undefined;
    if (doc?._id && doc?._type) {
      const raw = doc._updatedAt ?? doc._createdAt;
      const at = raw ? new Date(raw) : new Date();
      return { id: doc._id, type: doc._type, at };
    }
    const after = body.after as
      | {
          _id?: string;
          _type?: string;
          _createdAt?: string;
          _updatedAt?: string;
        }
      | undefined;
    if (after?._id && after?._type) {
      const raw = after._updatedAt ?? after._createdAt;
      const at = raw ? new Date(raw) : new Date();
      return { id: after._id, type: after._type, at };
    }
    // Empty GROQ projection: Sanity POSTs the whole document at the root.
    const rootId = body._id;
    const rootType = body._type;
    if (typeof rootId === "string" && typeof rootType === "string") {
      const raw = body._updatedAt ?? body._createdAt;
      const at =
        typeof raw === "string" ? new Date(raw) : new Date();
      return { id: rootId, type: rootType, at };
    }
    return null;
  }

  app.post("/api/webhooks/sanity", (req, res) => {
    if (!verifyWebhookSecret(req)) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const item = parseSanityWebhook(body);
    if (!item) {
      const keys = Object.keys(body).slice(0, 25);
      console.warn(
        "[webhook] Unrecognized payload (expected result, document, or root _id/_type). Keys:",
        keys,
      );
      res.status(400).json({ ok: false, error: "Unrecognized payload" });
      return;
    }

    queueDigestFromSanityEvent(item.at, { id: item.id, type: item.type });
    scheduleDigestWhenFlushReady();

    console.log("[webhook] digest queued:", item.type, item.id);

    res.json({ ok: true, queued: { id: item.id, type: item.type } });
  });

  function verifyCronSecret(req: express.Request): boolean {
    const expected = process.env.CRON_SECRET;
    if (!expected) {
      console.warn(
        "[cron] CRON_SECRET is not set — allowing manual digest triggers (set this in production)",
      );
      return true;
    }
    const auth = req.headers.authorization;
    if (auth === `Bearer ${expected}`) return true;
    const q =
      typeof req.query.secret === "string" ? req.query.secret : undefined;
    return q === expected;
  }

  app.post("/api/cron/digest", async (req, res) => {
    if (!verifyCronSecret(req)) {
      res.status(401).json({ ok: false, error: "Unauthorized" });
      return;
    }
    const result = await processDueDigestEmails();
    res.json({ ok: true, ...result });
  });

  return app;
}
