/**
 * Hero collage content — images, quotes, tweets for the full-coverage grid.
 * Separated from page.tsx so collage data doesn't clutter layout logic.
 */

export type CardSize = 'square' | 'tall' | 'wide' | 'small' | 'horizontal';

export interface GridItem {
  id: string;
  feed: 'feelgood' | 'local' | 'global';
  size: CardSize;
  type: 'photo' | 'video' | 'quote' | 'story' | 'spot' | 'event' | 'news' | 'travel' | 'culture' | 'gear' | 'reel' | 'tweet';
  title: string;
  content: string;
  source?: string;
  location?: string;
  image?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'instagram' | 'tiktok';
}

export const typeLabels: Record<string, string> = {
  photo: '',
  video: '▶',
  quote: '💬',
  story: '📖',
  spot: '📍',
  event: '📅',
  news: '📰',
  travel: '✈️',
  culture: '🎭',
  gear: '🛹',
  reel: '▶',
  tweet: '',
};

/**
 * Hero collage items only — photos, quotes, tweets.
 * No video/reel items in the collage.
 */
export const allItems: GridItem[] = [
  // HERO COLLAGE IMAGES
  { id: 'hero1', feed: 'feelgood', size: 'small', type: 'photo', title: '', content: 'Peaceful moments.', image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=400&auto=format' },
  { id: 'hero2', feed: 'local', size: 'small', type: 'photo', title: '', content: 'Island vibes.', image: 'https://images.unsplash.com/photo-1506905925346-21b49c82b1dd?w=400&auto=format' },
  { id: 'hero3', feed: 'global', size: 'small', type: 'photo', title: '', content: 'World waves.', image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=400&auto=format' },
  { id: 'hero5', feed: 'feelgood', size: 'small', type: 'photo', title: '', content: 'Coastal calm.', image: 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=400&auto=format' },
  { id: 'hero6', feed: 'local', size: 'small', type: 'photo', title: '', content: 'Tropical dawn.', image: 'https://images.unsplash.com/photo-1518837695005-2081c6f8a49d?w=400&auto=format' },
  { id: 'hero7', feed: 'feelgood', size: 'small', type: 'photo', title: '', content: 'Ocean breath.', image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=400&auto=format' },
  { id: 'hero8', feed: 'local', size: 'small', type: 'photo', title: '', content: 'Gwada sunset.', image: 'https://images.unsplash.com/photo-1455729552865-3658e0c677dd?w=400&auto=format' },
  { id: 'hero9', feed: 'global', size: 'small', type: 'photo', title: '', content: 'Endless swell.', image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=400&auto=format' },
  { id: 'hero10', feed: 'feelgood', size: 'small', type: 'photo', title: '', content: 'Wave dance.', image: 'https://images.unsplash.com/photo-1559827260-dc66d52b21d4?w=400&auto=format' },
  { id: 'hero11', feed: 'local', size: 'small', type: 'photo', title: '', content: 'Caribbean blue.', image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=400&auto=format' },
  { id: 'hero12', feed: 'global', size: 'small', type: 'photo', title: '', content: 'Pacific power.', image: 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=400&auto=format' },
  { id: 'hero13', feed: 'feelgood', size: 'small', type: 'photo', title: '', content: 'Morning mist.', image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=400&auto=format' },
  { id: 'hero14', feed: 'local', size: 'small', type: 'photo', title: '', content: 'Warm waters.', image: 'https://images.unsplash.com/photo-1518837695005-2081c6f8a49d?w=400&auto=format' },
  { id: 'hero15', feed: 'global', size: 'small', type: 'photo', title: '', content: 'Ocean soul.', image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=400&auto=format' },

  // FEEL GOOD — Quotes & photos used by hero collage
  { id: 'fg1', feed: 'feelgood', size: 'tall', type: 'quote', title: 'Wave Wisdom', content: '"The ocean heals everything. It whispers to those who listen."', source: 'Surfer\'s Journal', image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=600&auto=format' },
  { id: 'fg3', feed: 'feelgood', size: 'wide', type: 'photo', title: 'Empty Lineup', content: 'Just you, the board, and the swell.', image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=800&auto=format' },
  { id: 'fg6', feed: 'feelgood', size: 'tall', type: 'photo', title: 'Golden Hour', content: 'When light hits water just right.', image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=600&auto=format' },
  { id: 'fg7', feed: 'feelgood', size: 'square', type: 'photo', title: 'Drift Days', content: 'Days where time slows down.', image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=400&auto=format' },

  // TEXT TWEETS
  { id: 'tweet1', feed: 'feelgood', size: 'small', type: 'tweet', title: '', content: 'Nothing beats the feeling of catching your first wave. Pure joy. 🌊', source: '@SurferDaily' },
  { id: 'tweet2', feed: 'feelgood', size: 'small', type: 'tweet', title: '', content: 'Every surf session is a reset button for the soul.', source: '@WaveRider' },
  { id: 'tweet7', feed: 'feelgood', size: 'small', type: 'tweet', title: '', content: 'Paddle out. Catch waves. Reset mind. Repeat.', source: '@ZenSurfer' },
];

export const heroCollageItemsStatic = [
  ...allItems.filter(item => item.id.startsWith('hero') && item.image && item.type !== 'video' && item.type !== 'reel'),
  ...allItems.filter(item => item.type === 'photo' && !item.id.startsWith('hero') && item.image),
].slice(0, 20);
