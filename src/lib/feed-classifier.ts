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
  'wsl', 'world surf league', 'championship tour',
  'competition', 'tournament', 'championship',
  'olympic', 'qualifying series',
];

// Patterns that need word-boundary matching to avoid false positives
// e.g. 'ct ' matches 'contact', 'ct' matches 'act'
const GLOBAL_WORD_PATTERNS = [
  ' ct ', ' ct,', ' ct.', ' ct-',
  ' pro ', ' pro,', ' pro.', ' pro-',
];

/**
 * Check if text contains a word from wordPatterns safely (word-boundary).
 */
function matchesWordPattern(text: string, patterns: string[]): boolean {
  const normalized = ` ${text.toLowerCase()} `;
  return patterns.some(p => normalized.includes(p));
}

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

  const isGlobalWord = matchesWordPattern(text, GLOBAL_WORD_PATTERNS);
  if (isGlobalWord) return 'global';

  return 'feelgood';
}
