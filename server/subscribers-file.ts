import { readStore, writeStore, type Subscriber } from "./store.ts";

export function listSubscribersFromFile(): Subscriber[] {
  const store = readStore();
  return store.subscribers ?? [];
}

export function upsertSubscriberInFile(
  email: string,
  name: string,
): { subscriber: Subscriber; isNew: boolean } {
  const store = readStore();
  const normalized = email.trim().toLowerCase();
  const subs = [...(store.subscribers ?? [])];
  const idx = subs.findIndex((s) => s.email === normalized);
  const isNew = idx < 0;
  const row: Subscriber = {
    email: normalized,
    name: name.trim() || "there",
    subscribedAt:
      idx >= 0
        ? subs[idx]!.subscribedAt
        : new Date().toISOString(),
  };
  if (idx >= 0) {
    subs[idx] = row;
  } else {
    subs.push(row);
  }
  writeStore({ ...store, subscribers: subs });
  return { subscriber: row, isNew };
}
