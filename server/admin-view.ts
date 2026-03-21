import type { Subscriber } from "./store.ts";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function subscribersToCsv(rows: Subscriber[]): string {
  const header = ["email", "name", "subscribedAt"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [r.email, r.name, r.subscribedAt].map(csvEscape).join(","),
    ),
  ];
  return lines.join("\n");
}

export function subscribersToHtmlPage(rows: Subscriber[]): string {
  const rowsHtml = rows
    .map(
      (r) =>
        `<tr>
  <td style="padding:10px 12px;border-bottom:1px solid #e8e2d8;font-family:Georgia,serif;">${escapeHtml(r.email)}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #e8e2d8;font-family:Georgia,serif;">${escapeHtml(r.name)}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #e8e2d8;font-family:ui-monospace,monospace;font-size:13px;color:#555;">${escapeHtml(r.subscribedAt)}</td>
</tr>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Artistry subscribers</title>
  <style>
    body { margin:0; background:#f4f1eb; color:#1a1a1a; font-family: ui-sans-serif, system-ui, sans-serif; }
    .wrap { max-width: 920px; margin: 0 auto; padding: 40px 20px 80px; }
    h1 { font-family: Georgia, serif; font-weight: 300; letter-spacing: -0.02em; margin: 0 0 8px; }
    p { color: #5c5c5c; margin: 0 0 24px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e8e2d8; border-radius: 12px; overflow: hidden; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #7a7268; padding: 14px 12px; background: #faf8f5; border-bottom: 1px solid #e8e2d8; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Artistry subscribers</h1>
    <p>${rows.length} total — also available as JSON or CSV via the API.</p>
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Name</th>
          <th>Subscribed</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || `<tr><td colspan="3" style="padding:20px;color:#888;">No subscribers yet.</td></tr>`}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}
