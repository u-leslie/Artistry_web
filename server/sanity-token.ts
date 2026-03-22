/**
 * Normalize SANITY_API_TOKEN from .env (quotes, "Bearer " prefix, whitespace).
 * Sanity Content Lake API tokens are typically long strings starting with `sk`.
 */
export function normalizeSanityApiToken(raw: string | undefined): string {
  if (raw == null || raw === "") return "";
  let t = raw.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  if (t.toLowerCase().startsWith("bearer ")) {
    t = t.slice(7).trim();
  }
  return t;
}

/** Sanity client errors include statusCode 401 when the API token is invalid or revoked. */
export function isSanityUnauthorized(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    (err as { statusCode: number }).statusCode === 401
  );
}
