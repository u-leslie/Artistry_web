import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cron from "node-cron";
import express from "express";
import { createApp } from "./app.ts";
import { processDueDigestEmails } from "./process-digest.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = createApp();
const distPath = path.resolve(__dirname, "../dist");

if (
  fs.existsSync(path.join(distPath, "index.html")) &&
  process.env.SERVE_STATIC !== "0"
) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) next(err);
    });
  });
  console.log(`[artistry-api] serving static from ${distPath}`);
}

const port = Number(process.env.PORT ?? 8787);

app.listen(port, () => {
  console.log(`[artistry-api] listening on http://localhost:${port}`);
});

/**
 * Backup sweep every 10 minutes (when the process is awake). Digests primarily send
 * after DIGEST_DEBOUNCE_MS quiet time following a publish (webhook calls processDueDigestEmails).
 * On Render free, use an external POST to /api/cron/digest with CRON_SECRET if the instance slept.
 */
const tz = process.env.DIGEST_TIMEZONE ?? "America/New_York";
cron.schedule(
  "*/10 * * * *",
  async () => {
    try {
      const result = await processDueDigestEmails();
      console.log("[digest cron]", result);
    } catch (err) {
      console.error("[digest cron]", err);
    }
  },
  { timezone: tz },
);
