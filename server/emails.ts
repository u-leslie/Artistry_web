import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPublicSiteUrlForEmail } from "./site-url.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Must match `content_id` on the inline attachment in `sendResendEmail`. */
export const EMAIL_INLINE_LOGO_CID = "artistry-logo";

const LOGO_FILE = path.resolve(__dirname, "../public/artistry-email-logo.gif");

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Shared palette — light, restrained */
const E = {
  bg: "#fafaf9",
  card: "#ffffff",
  ink: "#1c1917",
  inkSoft: "#44403c",
  muted: "#78716c",
  accent: "#8a7a62",
  rule: "rgba(28,25,23,0.1)",
  /** Soft wash behind poetry block */
  wash: "#f6f4f1",
};

/**
 * Logo + title: GIF on top (inline via Resend CID — no public URL needed), then centered text.
 * Regenerate GIF: `npm run build:email-gif`
 */
function logoImgSrc(): string {
  const explicit = process.env.EMAIL_LOGO_URL?.trim();
  if (explicit) return explicit;
  return `cid:${EMAIL_INLINE_LOGO_CID}`;
}

function logoBlock(siteUrl: string) {
  const src = logoImgSrc();
  const isCid = src.startsWith("cid:");

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
  <tr>
    <td align="center" style="padding:0 0 28px 0;border-bottom:1px solid ${E.rule};">
      <a href="${escapeHtml(siteUrl)}" style="text-decoration:none;display:inline-block;margin:0 auto 16px auto;line-height:0;">
        <img src="${isCid ? `cid:${EMAIL_INLINE_LOGO_CID}` : escapeHtml(src)}" alt="Artistry" width="64" height="64" style="display:block;border:0;width:64px;max-width:64px;height:auto;mso-line-height-rule:exactly;" />
      </a>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.42em;text-transform:uppercase;color:${E.ink};font-weight:400;text-align:center;line-height:1.35;">
        Artistry
      </div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-style:italic;color:${E.muted};margin-top:8px;text-align:center;line-height:1.45;">
        by Leslie
      </div>
    </td>
  </tr>
</table>
  `;
}

export function readEmailLogoAttachment():
  | {
      filename: string;
      content: string;
      content_id: string;
      content_type: string;
    }
  | undefined {
  if (process.env.EMAIL_LOGO_URL?.trim()) {
    return undefined;
  }
  try {
    const buf = fs.readFileSync(LOGO_FILE);
    return {
      filename: "artistry-email-logo.gif",
      content: buf.toString("base64"),
      content_id: EMAIL_INLINE_LOGO_CID,
      content_type: "image/gif",
    };
  } catch {
    console.warn(
      `[emails] Missing ${LOGO_FILE} — logo image may not appear. Run: npm run build:email-gif`,
    );
    return undefined;
  }
}

function emailShell(inner: string, pageTitle: string) {
  const safeTitle = escapeHtml(pageTitle);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Source+Sans+3:wght@400;500&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:${E.bg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${E.bg};">
    <tr>
      <td align="center" style="padding:48px 20px 56px 20px;background:${E.bg};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;background:${E.card};border:1px solid ${E.rule};border-radius:2px;">
          <tr>
            <td style="padding:40px 36px 44px 36px;background:${E.card};font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;color:${E.ink};font-size:18px;line-height:1.62;font-weight:400;">
              ${inner}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function footerLink(siteUrl: string) {
  return `
  <p style="margin:36px 0 0 0;padding:24px 0 0 0;border-top:1px solid ${E.rule};font-family:'Source Sans 3',ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${E.muted};">
    <a href="${escapeHtml(siteUrl)}" style="color:${E.accent};text-decoration:none;border-bottom:1px solid ${E.accent};padding-bottom:2px;">Visit Artistry</a>
  </p>`;
}

function sectionEyebrow(text: string) {
  return `<p style="margin:0 0 10px 0;font-family:'Source Sans 3',sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${E.muted};">${escapeHtml(text)}</p>`;
}

function digestDivider() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 28px 0;"><tr><td style="height:1px;background:${E.rule};line-height:1px;font-size:1px;">&nbsp;</td></tr></table>`;
}

function textLink(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="color:${E.accent};text-decoration:none;border-bottom:1px solid ${E.accent};padding-bottom:1px;font-family:'Source Sans 3',sans-serif;font-size:14px;">${escapeHtml(label)}</a>`;
}

/** Solid CTA — table for Outlook-friendly padding */
function primaryCtaButton(href: string, label: string) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0 0;">
  <tr>
    <td align="left" bgcolor="${E.accent}" style="border-radius:2px;">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:'Source Sans 3',sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#ffffff;text-decoration:none;font-weight:500;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
}

/** Lighter second CTA for poetry */
function outlineCtaButton(href: string, label: string) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0 0;">
  <tr>
    <td align="left" style="border:1px solid ${E.accent};border-radius:2px;">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;font-family:'Source Sans 3',sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${E.accent};text-decoration:none;font-weight:500;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
}

export function welcomeEmailHtml(opts: { name: string }) {
  const { name } = opts;
  const siteUrl = getPublicSiteUrlForEmail();
  const safeName = escapeHtml(name);
  const inner = `
              ${logoBlock(siteUrl)}
              <div style="text-align:left;">
              <p style="margin:0 0 8px 0;font-family:'Source Sans 3',sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${E.muted};">Welcome</p>
              <p style="margin:0 0 26px 0;font-size:28px;line-height:1.2;font-weight:500;color:${E.ink};">Hi ${safeName},</p>
              <p style="margin:0 0 20px 0;color:${E.inkSoft};">Thank you for subscribing to <strong style="color:${E.ink};font-weight:600;">Artistry by Leslie</strong>. 🥹</p>
              <p style="margin:0 0 20px 0;color:${E.inkSoft};">This is a small corner of the internet where a curious mind shares poems, photographs, and moments of growth. Your presence here means more than you know.</p>
              <p style="margin:0 0 20px 0;color:${E.inkSoft};">You’ll be the first to know whenever something new is added.</p>
              <p style="margin:0 0 32px 0;color:${E.inkSoft};">Thank you for being part of this little journey.</p>
              <p style="margin:0;font-style:italic;font-size:19px;color:${E.ink};">— Leslie</p>
              ${footerLink(siteUrl)}
              </div>
  `;
  return emailShell(inner, "Welcome to Artistry");
}

export function newContentEmailHtml(opts: {
  name: string;
  /** Whether the digest includes new photos (no thumbnails or titles in email). */
  hasNewPhotos: boolean;
  /** Optional count for copy only; omit or 0 to use generic wording. */
  newPhotoCount?: number;
  poems: { title: string }[];
}) {
  const { name, hasNewPhotos, newPhotoCount, poems } = opts;
  const siteUrl = getPublicSiteUrlForEmail();
  const galleryUrl = `${siteUrl}/gallery`;
  const poetryHref = `${siteUrl}/#poetry`;
  const safeName = escapeHtml(name);
  const galleryLinkLabel = galleryUrl.replace(/^https?:\/\//, "");
  const hasPoems = poems.length > 0;

  let leadParagraph = "";
  if (hasNewPhotos && hasPoems) {
    leadParagraph = `<p style="margin:0 0 22px 0;color:${E.inkSoft};">I've been tending to the site again — <strong style="color:${E.ink};font-weight:600;">new photographs</strong> and <strong style="color:${E.ink};font-weight:600;">new poems</strong>, little pieces I couldn't quite keep to myself. I thought of you when I pressed publish, and I hope something here lands softly with you today.</p>`;
  } else if (hasNewPhotos) {
    leadParagraph = `<p style="margin:0 0 22px 0;color:${E.inkSoft};">I've added new work to the gallery — images that gathered meaning while I wasn't looking. I'd love for you to visit when you have a quiet moment; they're meant to be seen slowly, in their full light.</p>`;
  } else {
    leadParagraph = `<p style="margin:0 0 22px 0;color:${E.inkSoft};">There's new writing on the site — lines that took shape word by word. I thought of you while I set them live, and I hope one of them finds the corner of your heart it was written for.</p>`;
  }

  const photoBlurb =
    hasNewPhotos && typeof newPhotoCount === "number" && newPhotoCount > 1
      ? `<p style="margin:0 0 14px 0;color:${E.inkSoft};line-height:1.65;">A handful of <strong style="color:${E.ink};font-weight:600;">${newPhotoCount} new photographs</strong> are waiting for you. Color and detail breathe more freely on the site than in any inbox — I'd be honored if you'd wander through when you can.</p>`
      : hasNewPhotos
        ? `<p style="margin:0 0 14px 0;color:${E.inkSoft};line-height:1.65;">A <strong style="color:${E.ink};font-weight:600;">new photograph</strong> has found its place in the gallery. I made it hoping it might rest your eyes for a breath or two — I'd love for you to see it there.</p>`
        : "";

  const photoSection = hasNewPhotos
    ? `
              ${digestDivider()}
              ${sectionEyebrow("The gallery")}
              ${photoBlurb}
              <p style="margin:0 0 2px 0;color:${E.muted};font-family:'Source Sans 3',sans-serif;font-size:12px;line-height:1.55;letter-spacing:0.02em;font-style:italic;">Take your time. Nothing here is in a hurry.</p>
              ${primaryCtaButton(galleryUrl, "Step into the gallery")}
              <p style="margin:16px 0 0 0;font-size:13px;color:${E.muted};">${textLink(galleryUrl, galleryLinkLabel)}</p>`
    : "";

  const poemItems = poems
    .map(
      (p) =>
        `<li style="margin:0 0 14px 0;list-style:none;padding:0;">
  <a href="${escapeHtml(poetryHref)}" style="color:${E.ink};text-decoration:none;font-style:italic;font-size:19px;line-height:1.5;border-bottom:1px solid ${E.rule};display:inline;">${escapeHtml(p.title)}</a>
</li>`,
    )
    .join("");

  const poemSection = hasPoems
    ? `
              ${digestDivider()}
              ${sectionEyebrow("Poetry")}
              <p style="margin:0 0 16px 0;color:${E.inkSoft};line-height:1.65;">If words feel like home, there is fresh poetry too — small letters to the world. Tap a title below; each opens in place, where the lines can stretch out properly.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 4px 0;background:${E.wash};border:1px solid ${E.rule};border-radius:2px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <ul style="margin:0;padding:0;list-style:none;font-family:'Cormorant Garamond',Georgia,serif;">
    ${poemItems}
                    </ul>
                  </td>
                </tr>
              </table>
              ${outlineCtaButton(poetryHref, "Read on the site")}`
    : "";

  const inner = `
              ${logoBlock(siteUrl)}
              <div style="text-align:left;">
              <p style="margin:0 0 10px 0;font-family:'Source Sans 3',sans-serif;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${E.muted};">For you</p>
              <p style="margin:0 0 18px 0;font-size:32px;line-height:1.15;font-weight:500;color:${E.ink};letter-spacing:-0.025em;">Hi ${safeName},</p>
              ${leadParagraph}
              ${photoSection}
              ${poemSection}
              <p style="margin:${hasNewPhotos || hasPoems ? "34px" : "8px"} 0 16px 0;color:${E.inkSoft};line-height:1.65;">Wherever you are today, thank you for letting me visit your inbox. It means more than a short note can say.</p>
              <p style="margin:0;font-style:italic;font-size:19px;color:${E.ink};line-height:1.45;">With love,<br/><span style="font-size:17px;color:${E.inkSoft};">Leslie</span></p>
              ${footerLink(siteUrl)}
              </div>
  `;

  return emailShell(inner, "New on Artistry");
}

const RESEND_FALLBACK_FROM = "Artistry by Leslie <u.leslie@art.lslie.space>";

/**
 * Resend only sends from addresses on domains you verify at resend.com/domains.
 * Personal inboxes (@gmail.com, etc.) cannot be used as "From" — the API returns 403.
 */
function getResendFromAddress(): string {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw) return RESEND_FALLBACK_FROM;

  const angle = raw.match(/<([^>]+)>/);
  const bare = raw.match(/\b[^\s<>]+@[^\s<>]+\b/);
  const addr = (angle?.[1] ?? bare?.[0] ?? raw).trim().toLowerCase();
  const domain = addr.split("@")[1] ?? "";

  const personalDomains = new Set([
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.uk",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "icloud.com",
    "me.com",
    "msn.com",
  ]);
  if (personalDomains.has(domain)) {
    console.warn(
      `[emails] EMAIL_FROM (${raw}) uses ${domain}, which Resend does not allow as a sender until you add a verified domain. ` +
        `Using ${RESEND_FALLBACK_FROM} instead. For production, verify a domain at https://resend.com/domains and set EMAIL_FROM to e.g. Artistry <newsletter@yourdomain.com>.`,
    );
    return RESEND_FALLBACK_FROM;
  }

  return raw;
}

export async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  bcc?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }
  const from = getResendFromAddress();
  const logoAtt = readEmailLogoAttachment();
  const payload: Record<string, unknown> = {
    from,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.bcc && opts.bcc.length > 0) {
    payload.bcc = opts.bcc;
  }
  if (logoAtt) {
    payload.attachments = [logoAtt];
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text || res.statusText };
  }
  return { ok: true };
}
