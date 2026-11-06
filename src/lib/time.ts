const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const UTC_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\s*UTC)?$/;

export function parseUtcTimestamp(value: string): Date | null {
  const match = UTC_PATTERN.exec(value.trim());
  if (!match) return null;
  const [, year, month, day, hours, minutes, seconds] = match;
  const parts = [year, month, day, hours, minutes, seconds].map(Number);
  const date = new Date(
    Date.UTC(
      parts[0],
      parts[1] - 1,
      parts[2],
      parts[3],
      parts[4],
      parts[5]
    )
  );
  if (Number.isNaN(date.getTime())) return null;
  const roundTrips =
    date.getUTCFullYear() === parts[0] &&
    date.getUTCMonth() === parts[1] - 1 &&
    date.getUTCDate() === parts[2] &&
    date.getUTCHours() === parts[3] &&
    date.getUTCMinutes() === parts[4] &&
    date.getUTCSeconds() === parts[5];
  return roundTrips ? date : null;
}

export function relativeTime(value: string, now: Date = new Date()): string {
  const then = parseUtcTimestamp(value);
  if (!then) return value;

  const elapsed = now.getTime() - then.getTime();
  if (elapsed < MINUTE_MS) return "just now";
  if (elapsed < HOUR_MS) {
    return `${Math.floor(elapsed / MINUTE_MS)} min ago`;
  }
  if (elapsed < DAY_MS) {
    return `${Math.floor(elapsed / HOUR_MS)} h ago`;
  }
  return `${Math.floor(elapsed / DAY_MS)} d ago`;
}
