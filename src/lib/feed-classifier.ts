/**
 * Feed Classifier — shared service for determining which feed a post belongs to
 *
 * Rules: local (Guadeloupe/Caribbean), global (WSL/pro competitions), feelgood (everything else)
 * Extracted from duplicated inline logic across 4 route handlers.
 */

export type FeedCategory = 'local' | 'global' | 'feelgood';

const LOCAL_PATTERNS = [
  'guadeloupe', 'gwada', '971', 'pointe-à-pitre', 'basse-terre',
  'grande-terre', 'anse', 'deshaies', 'bouillante', 'sainte-anne',
  'saint-françois', 'le moule', 'petite terre', 'caribbean',
  'guadeloupean',
];

const GLOBAL_PATTERNS = [
  'wsl', 'world surf league', 'championship tour', 'ct ',
  'pro ', 'competition', 'tournament', 'championship',
  'olympic', 'qualifying series',
];

/**
 * Classify a content item into a feed category based on its title/content/source.
 */
export function classifyFeed(
  content: string = '',
  source: string = '',
  title: string = '',
): FeedCategory {
  const text = `${title} ${content} ${source}`.toLowerCase();

  const isLocal = LOCAL_PATTERNS.some(p => text.includes(p));
  if (isLocal) return 'local';

  const isGlobal = GLOBAL_PATTERNS.some(p => text.includes(p));
  if (isGlobal) return 'global';

  return 'feelgood';
}
