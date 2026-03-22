import { createHash } from "node:crypto";
import type { SanityClient } from "@sanity/client";
import type { Subscriber } from "./store.ts";

const DOC_TYPE = "newsletterSubscriber";

/** Stable id from email (Sanity id: letters, digits, underscore, dash). */
export function newsletterDocId(email: string): string {
  const normalized = email.trim().toLowerCase();
  const hash = createHash("sha256")
    .update(normalized)
    .digest("hex")
    .slice(0, 40);
  return `ns.${hash}`;
}

export async function listSubscribersSanity(
  client: SanityClient,
): Promise<Subscriber[]> {
  const rows = await client.fetch<
    { email?: string; name?: string; subscribedAt?: string }[]
  >(
    `*[_type == "newsletterSubscriber"] | order(subscribedAt asc) { email, name, "subscribedAt": subscribedAt }`,
  );
  return rows
    .filter((r) => typeof r.email === "string" && r.email.trim())
    .map((r) => ({
      email: r.email!.trim().toLowerCase(),
      name: (r.name ?? "there").trim() || "there",
      subscribedAt:
        typeof r.subscribedAt === "string"
          ? r.subscribedAt
          : new Date().toISOString(),
    }));
}

export async function upsertSubscriberSanity(
  client: SanityClient,
  email: string,
  name: string,
  preserveSubscribedAt?: string,
): Promise<{ subscriber: Subscriber; isNew: boolean }> {
  const normalized = email.trim().toLowerCase();
  const id = newsletterDocId(normalized);
  const existing = await client.getDocument(id).catch(() => null);
  const isNew = !existing;
  const prevAt = existing
    ? (existing as unknown as { subscribedAt?: string }).subscribedAt
    : undefined;
  const subscribedAt =
    (typeof prevAt === "string" ? prevAt : undefined) ??
    preserveSubscribedAt ??
    new Date().toISOString();

  const row: Subscriber = {
    email: normalized,
    name: name.trim() || "there",
    subscribedAt,
  };

  await client.createOrReplace({
    _id: id,
    _type: DOC_TYPE,
    email: normalized,
    name: row.name,
    subscribedAt,
  });

  return { subscriber: row, isNew };
}
