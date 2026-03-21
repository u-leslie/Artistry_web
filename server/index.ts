import cron from "node-cron";
import { createApp } from "./app.ts";
import { processDueDigestEmails } from "./process-digest.ts";

const app = createApp();
const port = Number(process.env.PORT ?? 8787);

app.listen(port, () => {
  console.log(`[artistry-api] listening on http://localhost:${port}`);
});

/**
 * In-process sweep every 10 minutes — only runs while this Node process is awake.
 * On Render free (and similar), the instance sleeps when idle, so this schedule often
 * does not fire on time. Use an external scheduler (e.g. cron-job.org) POSTing to
 * /api/cron/digest with CRON_SECRET so something wakes the service and sends due digests.
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
