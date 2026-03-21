/**
 * Public site URL for links in emails (welcome, digest). Set SITE_URL or VITE_SITE_URL
 * on the API host (e.g. Render) to https://your-domain.com — not the Render API URL.
 */
export function getSiteUrl(): string {
  const raw = (
    process.env.SITE_URL?.trim() ||
    process.env.VITE_SITE_URL?.trim() ||
    ""
  ).replace(/\/$/, "");

  if (!raw) {
    return "http://localhost:5173";
  }

  if (!/^https?:\/\//i.test(raw)) {
    return `https://${raw}`;
  }

  return raw;
}
