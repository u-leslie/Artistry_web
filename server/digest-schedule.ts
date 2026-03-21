/**
 * When content is published, the digest is marked due immediately. The server
 * runs `processDueDigestEmails` every 10 minutes and sends one email to
 * subscribers with all queued photo/poem updates since the last successful send.
 */
export function computeDigestSendAt(
  _publishedAt: Date,
  _timeZone: string,
): Date {
  return new Date();
}
