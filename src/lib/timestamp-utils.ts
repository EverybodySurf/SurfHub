/**
 * Timestamp Utilities — shared service for normalizing timestamps
 *
 * Extracted from duplicated inline logic across scraper-cdp.ts
 */

const RELATIVE_TIME_RE = /(\d+)([hdm])/;

/**
 * Parse a relative time string like "2h", "1d", "3m" into an absolute timestamp
 */
export function parseRelativeTime(relativeTime: string): string | null {
  const match = relativeTime.match(RELATIVE_TIME_RE);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];
  const now = Date.now();

  switch (unit) {
    case 'h': return new Date(now - value * 60 * 60 * 1000).toISOString();
    case 'd': return new Date(now - value * 24 * 60 * 60 * 1000).toISOString();
    case 'm': return new Date(now - value * 60 * 1000).toISOString();
    default: return null;
  }
}

/**
 * Normalize a raw timestamp value to ISO string.
 * Accepts ISO strings, relative time strings ("2h", "1d"), or null.
 * Falls back to current time if nothing valid is found.
 */
export function normalizeTimestamp(raw: string | null | undefined): string {
  if (!raw) return new Date().toISOString();
  if (raw.includes('T')) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return parseRelativeTime(raw) ?? new Date().toISOString();
}
