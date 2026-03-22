import {
  addPendingDigestItem,
  readStore,
  removePendingItems,
  type PendingDigestItem,
} from "./store.ts";
import { listSubscribers } from "./subscribers.ts";
import { getSanityServer, photoUrlFor } from "./sanity-server.ts";
import { newContentEmailHtml, sendResendEmail } from "./emails.ts";
import { getSiteUrl } from "./site-url.ts";

let digestFlushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * After queueing, call this so we process when the debounce elapses without relying on cron.
 * If the process restarts or the host sleeps, POST /api/cron/digest is still the backup.
 */
export function scheduleDigestWhenFlushReady(): void {
  const store = readStore();
  if (store.pendingDigest.length === 0) return;

  const flushAt = store.digestFlushAt
    ? new Date(store.digestFlushAt).getTime()
    : 0;
  const now = Date.now();

  if (digestFlushTimer) {
    clearTimeout(digestFlushTimer);
    digestFlushTimer = null;
  }

  if (flushAt <= now) {
    void processDueDigestEmails().catch((err) => {
      console.error("[digest] flush failed:", err);
    });
    return;
  }

  const delay = Math.max(0, flushAt - now) + 10;
  digestFlushTimer = setTimeout(() => {
    digestFlushTimer = null;
    void processDueDigestEmails().catch((err) => {
      console.error("[digest] scheduled flush failed:", err);
    });
  }, delay);
}

function digestDebounceMs(): number {
  /** Default 45s — batches draft+publish pairs; low enough that many hosts flush before sleep. */
  const raw = process.env.DIGEST_DEBOUNCE_MS ?? "45000";
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 45_000;
}

/** Draft webhooks use `drafts.<uuid>`; published docs use `<uuid>`. Digest fetch targets published ids. */
function publishedDocumentId(id: string): string {
  return id.startsWith("drafts.") ? id.slice("drafts.".length) : id;
}

export function queueDigestFromSanityEvent(
  _publishedAt: Date,
  item: { id: string; type: string },
) {
  if (item.type !== "photo" && item.type !== "poem") return;
  addPendingDigestItem(
    {
      id: publishedDocumentId(item.id),
      type: item.type as "photo" | "poem",
      sendAt: new Date().toISOString(),
    },
    digestDebounceMs(),
  );
}

export async function processDueDigestEmails(): Promise<{
  sent: number;
  skipped: string;
}> {
  const result = await processDueDigestEmailsImpl();
  console.log("[digest]", result);
  return result;
}

async function processDueDigestEmailsImpl(): Promise<{
  sent: number;
  skipped: string;
}> {
  const store = readStore();
  const now = Date.now();

  if (store.pendingDigest.length === 0) {
    return { sent: 0, skipped: "no due items" };
  }

  const flushAtMs = store.digestFlushAt
    ? new Date(store.digestFlushAt).getTime()
    : 0;
  if (flushAtMs > now) {
    return {
      sent: 0,
      skipped: `digest debounce window (flush in ~${Math.ceil((flushAtMs - now) / 1000)}s)`,
    };
  }

  const due = store.pendingDigest.filter(
    (p: PendingDigestItem) => new Date(p.sendAt).getTime() <= now,
  );
  if (due.length === 0) {
    return { sent: 0, skipped: "no due items" };
  }

  const subscribers = await listSubscribers();
  console.log(`[digest] ${subscribers.length} recipient(s) from Sanity`);
  if (subscribers.length === 0) {
    console.warn(
      "[digest] skip: no newsletterSubscriber docs in Sanity. Pending items kept.",
    );
    return { sent: 0, skipped: "no subscribers" };
  }

  const client = getSanityServer();
  if (!client) {
    console.warn(
      "[digest] skip: Sanity client missing — set SANITY_PROJECT_ID (and SANITY_DATASET) on the server.",
    );
    return { sent: 0, skipped: "Sanity not configured" };
  }

  const photoIds = Array.from(
    new Set(due.filter((d: PendingDigestItem) => d.type === "photo").map((d) => d.id)),
  );
  const poemIds = Array.from(
    new Set(due.filter((d: PendingDigestItem) => d.type === "poem").map((d) => d.id)),
  );

  const photos =
    photoIds.length > 0
      ? await client.fetch<
          { _id: string; title: string; image: unknown }[]
        >(
          `*[_type == "photo" && _id in $ids] | order(order asc) { _id, title, image }`,
          { ids: photoIds },
        )
      : [];

  const poems =
    poemIds.length > 0
      ? await client.fetch<{ _id: string; title: string }[]>(
          `*[_type == "poem" && _id in $ids] | order(order asc) { _id, title }`,
          { ids: poemIds },
        )
      : [];

  const siteUrl = getSiteUrl();
  const galleryUrl = `${siteUrl}/gallery`;
  const poetryHref = `${siteUrl}/#poetry`;

  const photoPayload = photos.map((p) => ({
    title: p.title || "Untitled",
    imageUrl: photoUrlFor(p.image, 640),
    href: galleryUrl,
  }));

  const poemPayload = poems.map((p) => ({
    title: p.title || "Untitled",
    href: poetryHref,
  }));

  if (photoPayload.length === 0 && poemPayload.length === 0) {
    removePendingItems(due);
    return { sent: 0, skipped: "nothing to include (content may have been removed)" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("[digest] skip: RESEND_API_KEY is not set");
    return { sent: 0, skipped: "RESEND_API_KEY is not set" };
  }

  let sent = 0;
  for (const sub of subscribers) {
    const html = newContentEmailHtml({
      name: sub.name,
      siteUrl,
      galleryUrl,
      photos: photoPayload,
      poems: poemPayload,
    });
    const r = await sendResendEmail({
      to: sub.email,
      subject: "New Creations Just for You 🌿",
      html,
    });
    if (r.ok) sent += 1;
  }

  if (sent > 0) {
    removePendingItems(due);
  }

  return {
    sent,
    skipped:
      sent === 0 ? "no successful sends (check Resend logs)" : "",
  };
}
