import cron from "node-cron";
import { createApp } from "./app.ts";
import { processDueDigestEmails } from "./process-digest.ts";

const app = createApp();
const port = Number(process.env.PORT ?? 8787);

app.listen(port, () => {
  console.log(`[artistry-api] listening on http://localhost:${port}`);
});

const tz = process.env.DIGEST_TIMEZONE ?? "America/New_York";
cron.schedule(
  "0 10 * * *",
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
