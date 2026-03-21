import { DateTime } from "luxon";

/**
 * Next 10:00 digest send time in `timeZone`:
 * - If published before local noon and before 10:00 → same day 10:00.
 * - If published after 10:00 but before noon → next day 10:00.
 * - If published at or after noon → next day 10:00.
 */
export function computeDigestSendAt(
  publishedAt: Date,
  timeZone: string,
): Date {
  const t = DateTime.fromJSDate(publishedAt).setZone(timeZone);
  const minutes = t.hour * 60 + t.minute;
  const tenAm = 10 * 60;
  const noon = 12 * 60;

  if (minutes < noon) {
    if (minutes < tenAm) {
      return t.set({ hour: 10, minute: 0, second: 0, millisecond: 0 }).toJSDate();
    }
    return t
      .plus({ days: 1 })
      .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })
      .toJSDate();
  }

  return t
    .plus({ days: 1 })
    .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })
    .toJSDate();
}
