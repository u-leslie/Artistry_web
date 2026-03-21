import {
  addPendingDigestItem,
  readStore,
  removePendingItems,
  type PendingDigestItem,
} from "./store.ts";
import { computeDigestSendAt } from "./digest-schedule.ts";
import { getSanityServer, photoUrlFor } from "./sanity-server.ts";
import { newContentEmailHtml, sendResendEmail } from "./emails.ts";

function getSiteUrl() {
  return (
    process.env.SITE_URL?.replace(/\/$/, "") ||
    process.env.VITE_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:5173"
  );
}

export function queueDigestFromSanityEvent(
  publishedAt: Date,
  item: { id: string; type: string },
) {
  if (item.type !== "photo" && item.type !== "poem") return;
  const tz = process.env.DIGEST_TIMEZONE ?? "America/New_York";
  const sendAt = computeDigestSendAt(publishedAt, tz);
  addPendingDigestItem({
    id: item.id,
    type: item.type as "photo" | "poem",
    sendAt: sendAt.toISOString(),
  });
}

export async function processDueDigestEmails(): Promise<{
  sent: number;
  skipped: string;
}> {
  const store = readStore();
  const now = Date.now();
  const due = store.pendingDigest.filter(
    (p: PendingDigestItem) => new Date(p.sendAt).getTime() <= now,
  );
  if (due.length === 0) {
    return { sent: 0, skipped: "no due items" };
  }
  if (store.subscribers.length === 0) {
    removePendingItems(due);
    return { sent: 0, skipped: "no subscribers" };
  }

  const client = getSanityServer();
  if (!client) {
    return { sent: 0, skipped: "Sanity not configured" };
  }

  const photoIds = [
    ...new Set(due.filter((d: PendingDigestItem) => d.type === "photo").map((d) => d.id)),
  ];
  const poemIds = [
    ...new Set(due.filter((d: PendingDigestItem) => d.type === "poem").map((d) => d.id)),
  ];

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
    return { sent: 0, skipped: "RESEND_API_KEY is not set" };
  }

  let sent = 0;
  for (const sub of store.subscribers) {
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
