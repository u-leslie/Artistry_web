import { DateTime } from "luxon";

/**
 * Next 10-minute boundary in `timeZone` (e.g. …:00, …:10, …:20).
 * Multiple publishes in the same window share the same `sendAt`, so one cron
 * run sends a single batched email with all of them.
 */
export function computeDigestSendAt(
  publishedAt: Date,
  timeZone: string,
): Date {
  const t = DateTime.fromJSDate(publishedAt).setZone(timeZone);
  const minute = t.minute;
  const second = t.second + t.millisecond / 1000;
  const remainder = minute % 10;

  if (remainder === 0 && second === 0) {
    return t.toJSDate();
  }

  const minutesToAdd = remainder === 0 ? 10 : 10 - remainder;
  return t.plus({ minutes: minutesToAdd }).startOf("minute").toJSDate();
}
