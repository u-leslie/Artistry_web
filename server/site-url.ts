/**
 * Canonical origin for **all** email links (welcome, digest, logo, footer).
 * Use the apex host your DNS serves (here: no `www`).
 */
export const CANONICAL_PUBLIC_SITE_URL = "https://art.lslie.space";

export function getPublicSiteUrlForEmail(): string {
  return CANONICAL_PUBLIC_SITE_URL;
}

/**
 * Optional base URL from env (previews, local dev). Not used for HTML email hrefs.
 *
 * Env mistakes we fix: extra quotes, `"https://..."` pasted inside another URL,
 * `https//` typo, `https://https://`, and `%22` from bad copy/paste.
 */

/** Decode percent-encoding once; ignore invalid sequences. */
function tryDecodeURIComponent(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * Returns a single absolute http(s) URL with no stray quotes or duplicate schemes.
 * Export for email templates that receive already-built strings.
 */
export function normalizePublicSiteUrl(raw: string): string {
  let s = raw.trim();
  if (!s) return "";

  s = tryDecodeURIComponent(s);
  s = s.replace(/%22/gi, "").replace(/%27/g, "'");
  s = s.replace(/["'`]/g, "");
  s = s.replace(/https\/\//gi, "https://");
  s = s.replace(/http\/\//gi, "http://");

  while (/^https:\/\/https:\/\//i.test(s)) {
    s = s.replace(/^https:\/\/https:\/\//i, "https://");
  }
  while (/^http:\/\/https:\/\//i.test(s)) {
    s = s.replace(/^http:\/\/https:\/\//i, "https://");
  }

  s = s.replace(/\/$/, "");
  if (!s) return "";

  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }

  return s;
}

export function getSiteUrl(): string {
  const raw =
    process.env.SITE_URL?.trim() ||
    process.env.VITE_SITE_URL?.trim() ||
    "";

  if (!raw) {
    return "http://localhost:5173";
  }

  return normalizePublicSiteUrl(raw);
}
