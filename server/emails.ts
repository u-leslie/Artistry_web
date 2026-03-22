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

/** Shared palette — white canvas; typography and logo unchanged */
const E = {
  bg: "#ffffff",
  ink: "#1c1917",
  inkSoft: "#44403c",
  muted: "#78716c",
  accent: "#a8987a",
  rule: "rgba(28,25,23,0.12)",
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
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px 0;">
  <tr>
    <td align="center" style="padding:0 0 24px 0;border-bottom:1px solid ${E.rule};">
      <a href="${escapeHtml(siteUrl)}" style="text-decoration:none;display:inline-block;margin:0 auto 18px auto;line-height:0;">
        <img src="${isCid ? `cid:${EMAIL_INLINE_LOGO_CID}` : escapeHtml(src)}" alt="Artistry" width="72" height="72" style="display:block;border:0;width:72px;max-width:72px;height:auto;mso-line-height-rule:exactly;line-height:72px;margin:0 auto;" />
      </a>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:0.35em;text-transform:uppercase;color:#1c1917;font-weight:400;text-align:center;line-height:1.35;mso-line-height-rule:exactly;">
        Artistry
      </div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;color:${E.muted};margin-top:10px;letter-spacing:0.03em;text-align:center;line-height:1.4;">
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
      <td align="center" style="padding:52px 24px 64px 24px;background:${E.bg};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;margin:0 auto;background:${E.bg};">
          <tr>
            <td style="background:${E.bg};font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;color:${E.ink};font-size:18px;line-height:1.65;font-weight:400;">
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
  <p style="margin:40px 0 0 0;padding:28px 0 0 0;border-top:1px solid ${E.rule};font-family:'Source Sans 3',ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${E.muted};">
    <a href="${escapeHtml(siteUrl)}" style="color:${E.accent};text-decoration:none;border-bottom:1px solid ${E.accent};padding-bottom:2px;">Visit Artistry</a>
  </p>`;
}

function sectionLabel(text: string) {
  return `<p style="margin:36px 0 12px 0;font-family:'Source Sans 3',sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${E.muted};">${escapeHtml(text)}</p>`;
}

function textLink(href: string, label: string) {
  return `<a href="${escapeHtml(href)}" style="color:${E.accent};text-decoration:none;border-bottom:1px solid ${E.accent};padding-bottom:1px;font-family:'Source Sans 3',sans-serif;font-size:13px;letter-spacing:0.04em;">${escapeHtml(label)}</a>`;
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
  photos: { title: string; imageUrl: string }[];
  poems: { title: string }[];
}) {
  const { name, photos, poems } = opts;
  const siteUrl = getPublicSiteUrlForEmail();
  const galleryUrl = `${siteUrl}/gallery`;
  const poetryHref = `${siteUrl}/#poetry`;
  const safeName = escapeHtml(name);

  const photoRows: string[] = [];
  const chunk = 3;
  for (let i = 0; i < photos.length; i += chunk) {
    const slice = photos.slice(i, i + chunk);
    const cells: string[] = slice.map((p) => {
      const img = p.imageUrl
        ? `<a href="${escapeHtml(galleryUrl)}" style="text-decoration:none;display:block;">
  <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title)}" width="168" height="220" style="display:block;width:100%;max-width:168px;height:220px;border:0;background:${E.bg};box-shadow:0 8px 24px rgba(28,25,23,0.07);" />
</a>`
        : "";
      return `<td width="33.33%" valign="top" style="padding:5px;">${img}<div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:13px;color:${E.muted};margin-top:10px;text-align:left;line-height:1.35;">${escapeHtml(p.title)}</div></td>`;
    });
    while (cells.length < 3) {
      cells.push(`<td width="33.33%" style="padding:6px;">&nbsp;</td>`);
    }
    photoRows.push(`<tr>${cells.join("")}</tr>`);
  }

  const photoSection =
    photos.length > 0
      ? `
              ${sectionLabel("Photographs")}
              <p style="margin:0 0 22px 0;color:${E.inkSoft};">Take a peek at the latest images capturing small moments, thoughts, and colors that speak to the heart.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
    ${photoRows.join("")}
              </table>
              <p style="margin:0 0 8px 0;">${textLink(galleryUrl, "Open the full gallery →")}</p>`
      : "";

  const poemItems = poems
    .map(
      (p) =>
        `<li style="margin:0 0 14px 0;list-style:none;padding:0;">
  <a href="${escapeHtml(poetryHref)}" style="color:${E.ink};text-decoration:none;font-style:italic;font-size:19px;line-height:1.4;border-bottom:1px solid ${E.rule};display:inline;">“${escapeHtml(p.title)}”</a>
</li>`,
    )
    .join("");

  const poemSection =
    poems.length > 0
      ? `
              ${sectionLabel("Poems")}
              <p style="margin:0 0 18px 0;color:${E.inkSoft};">Here are the newest poems — click to read the full poem:</p>
              <ul style="margin:0;padding:0;list-style:none;font-family:'Cormorant Garamond',Georgia,serif;">
    ${poemItems}
              </ul>`
      : "";

  const inner = `
              ${logoBlock(siteUrl)}
              <div style="text-align:left;">
              <p style="margin:0 0 8px 0;font-family:'Source Sans 3',sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${E.muted};">New work</p>
              <p style="margin:0 0 22px 0;font-size:28px;line-height:1.2;font-weight:500;color:${E.ink};">Hi ${safeName},</p>
              <p style="margin:0 0 28px 0;color:${E.inkSoft};">Something new has been added to <strong style="color:${E.ink};font-weight:600;">Artistry by Leslie</strong>! 🥹</p>
              ${photoSection}
              ${poemSection}
              <p style="margin:32px 0 20px 0;color:${E.inkSoft};">I hope these little creations bring a spark of inspiration or a moment of calm to your day.</p>
              <p style="margin:0 0 28px 0;color:${E.inkSoft};">Thank you for being part of this journey.</p>
              <p style="margin:0;font-style:italic;font-size:19px;color:${E.ink};">With love,<br/>Leslie</p>
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
