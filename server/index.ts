import cron from "node-cron";
import { createApp } from "./app.ts";
import { processDueDigestEmails } from "./process-digest.ts";

const app = createApp();
const port = Number(process.env.PORT ?? 8787);

app.listen(port, () => {
  console.log(`[artistry-api] listening on http://localhost:${port}`);
});

/**
 * Backup sweep every 10 minutes (when the process is awake). Digests primarily send
 * after DIGEST_DEBOUNCE_MS quiet time following a publish (webhook calls processDueDigestEmails).
 * On Render free, use an external POST to /api/cron/digest with CRON_SECRET if the instance slept.
 */
const tz = process.env.DIGEST_TIMEZONE ?? "America/New_York";
cron.schedule(
  "*/10 * * * *",
  async () => {
    try {
      const result = await processDueDigestEmails();
      console.log("[digest cron]", result);
    } catch (err) {
      console.error("[digest cron]", err);
    }
  },
  { timezone: tz },
);
