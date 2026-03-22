import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type PendingDigestItem = {
  id: string;
  type: "photo" | "poem";
  sendAt: string;
};

export type Subscriber = {
  email: string;
  name: string;
  subscribedAt: string;
};

/** Persisted JSON: digest queue only (subscribers live in Sanity). */
export type StoreData = {
  pendingDigest: PendingDigestItem[];
  /** ISO time — do not send digest until this moment (rolling debounce after each publish). */
  digestFlushAt?: string;
};

const defaultStore: StoreData = {
  pendingDigest: [],
};

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, "../data");
const storePath = path.join(dataDir, "store.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/** One row per email; keeps earliest subscribedAt if duplicates exist (legacy migrate only). */
function dedupeSubscribers(rows: Subscriber[]): Subscriber[] {
  const byEmail = new Map<string, Subscriber>();
  for (const s of rows) {
    const key = s.email.trim().toLowerCase();
    if (!key) continue;
    const prev = byEmail.get(key);
    if (!prev) {
      byEmail.set(key, { ...s, email: key });
      continue;
    }
    const prevT = new Date(prev.subscribedAt).getTime();
    const curT = new Date(s.subscribedAt).getTime();
    byEmail.set(
      key,
      curT < prevT ? { ...s, email: key } : prev,
    );
  }
  return Array.from(byEmail.values());
}

export function readStore(): StoreData {
  ensureDir();
  if (!fs.existsSync(storePath)) {
    return structuredClone(defaultStore);
  }
  try {
    const raw = fs.readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw) as StoreData & { subscribers?: unknown };
    const pendingDigest = Array.isArray(parsed.pendingDigest)
      ? parsed.pendingDigest
      : [];
    const data: StoreData = {
      pendingDigest,
      ...(typeof parsed.digestFlushAt === "string"
        ? { digestFlushAt: parsed.digestFlushAt }
        : {}),
    };
    return migrateLegacyDigest(data);
  } catch {
    return structuredClone(defaultStore);
  }
}

export function writeStore(data: StoreData) {
  ensureDir();
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf8");
}

/** Old stores used per-item sendAt at the next 10-minute boundary with no digestFlushAt — migrate so we wait until that time. */
function migrateLegacyDigest(store: StoreData): StoreData {
  if (store.pendingDigest.length === 0) return store;
  if (store.digestFlushAt) return store;
  const now = Date.now();
  const maxSend = Math.max(
    ...store.pendingDigest.map((p) => new Date(p.sendAt).getTime()),
  );
  if (maxSend > now) {
    store.digestFlushAt = new Date(maxSend).toISOString();
    writeStore(store);
  }
  return store;
}

/**
 * Read legacy `subscribers` rows from store.json (pre–Sanity-only) for one-time migration.
 */
export function readLegacySubscribersFromDisk(): Subscriber[] {
  ensureDir();
  if (!fs.existsSync(storePath)) return [];
  try {
    const raw = fs.readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw) as { subscribers?: Subscriber[] };
    const rawSubs = Array.isArray(parsed.subscribers)
      ? parsed.subscribers
      : [];
    return rawSubs.length > 0 ? dedupeSubscribers(rawSubs) : [];
  } catch {
    return [];
  }
}

/** Remove `subscribers` key from store.json after migrating to Sanity. */
export function clearSubscribersFromDisk(): void {
  ensureDir();
  if (!fs.existsSync(storePath)) return;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(fs.readFileSync(storePath, "utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return;
  }
  if (!("subscribers" in parsed) || parsed.subscribers == null) return;
  delete parsed.subscribers;
  const next: StoreData = {
    pendingDigest: Array.isArray(parsed.pendingDigest)
      ? (parsed.pendingDigest as PendingDigestItem[])
      : [],
    ...(typeof parsed.digestFlushAt === "string"
      ? { digestFlushAt: parsed.digestFlushAt }
      : {}),
  };
  writeStore(next);
}

/**
 * Queue or refresh an item. Extends `digestFlushAt` by `debounceMs` from now so rapid
 * publishes batch into one send after publishing stops.
 */
export function addPendingDigestItem(
  item: PendingDigestItem,
  debounceMs: number,
) {
  const store = readStore();
  const key = `${item.type}:${item.id}`;
  store.pendingDigest = store.pendingDigest.filter(
    (p) => `${p.type}:${p.id}` !== key,
  );
  store.pendingDigest.push(item);
  const ms = Number.isFinite(debounceMs) && debounceMs >= 0 ? debounceMs : 60_000;
  store.digestFlushAt = new Date(Date.now() + ms).toISOString();
  writeStore(store);
}

export function removePendingItems(items: PendingDigestItem[]) {
  if (items.length === 0) return;
  const store = readStore();
  const drop = new Set(items.map((i) => `${i.type}:${i.id}`));
  store.pendingDigest = store.pendingDigest.filter(
    (p) => !drop.has(`${p.type}:${p.id}`),
  );
  if (store.pendingDigest.length === 0) {
    store.digestFlushAt = undefined;
  }
  writeStore(store);
}
