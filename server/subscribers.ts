import { getSanityServer } from "./sanity-server.ts";
import {
  isSanityUnauthorized,
  normalizeSanityApiToken,
} from "./sanity-token.ts";
import {
  listSubscribersSanity,
  upsertSubscriberSanity,
} from "./subscribers-sanity.ts";
import {
  clearSubscribersFromDisk,
  readLegacySubscribersFromDisk,
  type Subscriber,
} from "./store.ts";
import type { SanityClient } from "@sanity/client";

export type { Subscriber };

function getSanitySubscribersClient(): SanityClient {
  const client = getSanityServer();
  const token = normalizeSanityApiToken(process.env.SANITY_API_TOKEN);
  if (!client || !token) {
    throw new Error(
      "Subscribers require SANITY_PROJECT_ID (or VITE_SANITY_PROJECT_ID), SANITY_DATASET or VITE_SANITY_DATASET, and SANITY_API_TOKEN with write access to the dataset.",
    );
  }
  return client;
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const client = getSanitySubscribersClient();
  try {
    return await listSubscribersSanity(client);
  } catch (err) {
    console.error("[subscribers] Sanity list failed:", err);
    throw err instanceof Error
      ? err
      : new Error("Could not load subscribers from Sanity.");
  }
}

/**
 * Upserts by email; existence is determined in Sanity via stable document id (`newsletterDocId`).
 */
export async function upsertSubscriber(
  email: string,
  name: string,
): Promise<{ subscriber: Subscriber; isNew: boolean }> {
  const client = getSanitySubscribersClient();
  try {
    const r = await upsertSubscriberSanity(client, email, name);
    console.log("[subscribers] saved to Sanity:", r.subscriber.email);
    return { subscriber: r.subscriber, isNew: r.isNew };
  } catch (err) {
    console.error("[subscribers] Sanity write failed:", err);
    if (isSanityUnauthorized(err)) {
      console.error(
        "[subscribers] Sanity returned 401 — create a new API token at https://www.sanity.io/manage → API → Tokens (Editor). Paste into SANITY_API_TOKEN with no quotes.",
      );
    }
    throw err instanceof Error
      ? err
      : new Error("Could not save subscriber to Sanity.");
  }
}

/** One-time: copy legacy `subscribers` from store.json into Sanity and remove them from disk. */
export async function migrateLegacySubscribersFromStoreJson(): Promise<void> {
  const client = getSanityServer();
  const token = normalizeSanityApiToken(process.env.SANITY_API_TOKEN);
  if (!client || !token) {
    return;
  }

  const subs = readLegacySubscribersFromDisk();
  if (subs.length === 0) return;

  let migrated = 0;
  for (const s of subs) {
    try {
      await upsertSubscriberSanity(
        client,
        s.email,
        s.name,
        s.subscribedAt,
      );
      migrated += 1;
    } catch (err) {
      console.error("[subscribers] migrate row failed:", s.email, err);
    }
  }

  if (migrated === subs.length) {
    clearSubscribersFromDisk();
    console.log(
      `[subscribers] migrated ${migrated} legacy row(s) from store.json → Sanity (newsletterSubscriber)`,
    );
  } else {
    console.warn(
      `[subscribers] migrated ${migrated}/${subs.length} — store.json subscribers left until all succeed; fix errors and restart`,
    );
  }
}

/** Merge SUBSCRIBERS_JSON into Sanity (e.g. Render env bootstrap). */
export async function seedSubscribersFromEnv(): Promise<void> {
  const raw = process.env.SUBSCRIBERS_JSON?.trim();
  if (!raw) return;
  let rows: { email?: string; name?: string }[];
  try {
    rows = JSON.parse(raw) as { email?: string; name?: string }[];
  } catch {
    console.error("[subscribers] SUBSCRIBERS_JSON is not valid JSON");
    return;
  }
  if (!Array.isArray(rows) || rows.length === 0) return;
  let n = 0;
  for (const r of rows) {
    if (typeof r.email === "string" && r.email.trim()) {
      try {
        await upsertSubscriber(
          r.email.trim(),
          (r.name ?? "there").trim() || "there",
        );
        n += 1;
      } catch (err) {
        console.error("[subscribers] seed row failed:", r.email, err);
      }
    }
  }
  console.log(`[subscribers] merged ${n} row(s) from SUBSCRIBERS_JSON into Sanity`);
}
