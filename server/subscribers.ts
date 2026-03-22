import { getSanityServer } from "./sanity-server.ts";
import {
  listSubscribersSanity,
  upsertSubscriberSanity,
} from "./subscribers-sanity.ts";
import {
  listSubscribersFromFile,
  upsertSubscriberInFile,
} from "./subscribers-file.ts";
import { readStore, writeStore, type Subscriber } from "./store.ts";

export type { Subscriber };

/**
 * `sanity` — durable (Content Lake); needs SANITY_API_TOKEN with write access.
 * `file` — data/store.json only (fragile on Render free).
 * Default: `sanity` when SANITY_API_TOKEN is set, else `file`.
 */
export function subscriberStorageMode(): "sanity" | "file" {
  const raw = process.env.SUBSCRIBER_STORAGE?.trim().toLowerCase();
  if (raw === "file") return "file";
  if (raw === "sanity") return "sanity";
  return process.env.SANITY_API_TOKEN?.trim() ? "sanity" : "file";
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const mode = subscriberStorageMode();
  if (mode === "sanity") {
    const client = getSanityServer();
    if (!client || !process.env.SANITY_API_TOKEN?.trim()) {
      console.warn(
        "[subscribers] Sanity storage selected but token missing — using file store.",
      );
      return listSubscribersFromFile();
    }
    try {
      return await listSubscribersSanity(client);
    } catch (err) {
      console.error("[subscribers] Sanity list failed, using file:", err);
      return listSubscribersFromFile();
    }
  }
  return listSubscribersFromFile();
}

export async function upsertSubscriber(
  email: string,
  name: string,
): Promise<{ subscriber: Subscriber; isNew: boolean }> {
  const mode = subscriberStorageMode();
  if (mode === "sanity") {
    const client = getSanityServer();
    if (!client || !process.env.SANITY_API_TOKEN?.trim()) {
      return upsertSubscriberInFile(email, name);
    }
    try {
      return await upsertSubscriberSanity(client, email, name);
    } catch (err) {
      console.error("[subscribers] Sanity upsert failed, using file:", err);
      return upsertSubscriberInFile(email, name);
    }
  }
  return upsertSubscriberInFile(email, name);
}

/** One-time: copy legacy store.json subscribers into Sanity and clear them from the file. */
export async function migrateSubscribersFromFileToSanity(): Promise<void> {
  if (subscriberStorageMode() !== "sanity") return;
  const client = getSanityServer();
  if (!client || !process.env.SANITY_API_TOKEN?.trim()) return;

  const store = readStore();
  const subs = store.subscribers ?? [];
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
    writeStore({ ...store, subscribers: [] });
    console.log(
      `[subscribers] migrated ${migrated} subscriber(s) from store.json → Sanity (newsletterSubscriber documents)`,
    );
  } else {
    console.warn(
      `[subscribers] migrated ${migrated}/${subs.length} — store.json left unchanged; fix errors and restart`,
    );
  }
}

/** Merge SUBSCRIBERS_JSON into the active backend (Render env). */
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
      await upsertSubscriber(
        r.email.trim(),
        (r.name ?? "there").trim() || "there",
      );
      n += 1;
    }
  }
  console.log(`[subscribers] merged ${n} row(s) from SUBSCRIBERS_JSON`);
}
