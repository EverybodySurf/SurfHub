'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

// Feed types
type FeedType = 'feelgood' | 'local' | 'global';

// Card sizes for masonry grid
type CardSize = 'square' | 'tall' | 'wide' | 'small' | 'horizontal';

interface GridItem {
  id: string;
  feed: FeedType;
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

// Expanded content pool for hero collage + feeds
const allItems: GridItem[] = [
  // FEEL GOOD FEED
  { id: 'fg1', feed: 'feelgood', size: 'tall', type: 'quote', title: 'Wave Wisdom', content: '"The ocean heals everything. It whispers to those who listen."', source: 'Surfer\'s Journal', image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=600&auto=format' },
  { id: 'fg2', feed: 'feelgood', size: 'horizontal', type: 'video', title: 'Surfing Guadeloupe 🌊', content: 'DU VRAI NIVEAU — Local surfers showing real skills.', image: 'https://i.ytimg.com/vi/k8VxkPMqYdU/hqdefault.jpg', videoUrl: 'https://youtu.be/k8VxkPMqYdU', videoType: 'youtube' },
  { id: 'fg3', feed: 'feelgood', size: 'wide', type: 'photo', title: 'Empty Lineup', content: 'Just you, the board, and the swell.', image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=800&auto=format' },
  { id: 'fg4', feed: 'feelgood', size: 'small', type: 'quote', title: '', content: '"You can\'t stop the waves, but you can learn how to swim."', source: 'Jon Kabat-Zinn' },
  { id: 'fg5', feed: 'feelgood', size: 'horizontal', type: 'reel', title: 'First Wave Forever', content: 'Remember your first wave? That feeling never leaves. 🎬 TikTok', image: 'https://images.unsplash.com/photo-1518837695005-2081c6f8a49d?w=800&auto=format', videoUrl: 'placeholder' },
  { id: 'fg6', feed: 'feelgood', size: 'tall', type: 'photo', title: 'Golden Hour', content: 'When light hits water just right.', image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=600&auto=format' },
  { id: 'fg7', feed: 'feelgood', size: 'square', type: 'photo', title: 'Drift Days', content: 'Days where time slows down.', image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=400&auto=format' },
  { id: 'fg8', feed: 'feelgood', size: 'horizontal', type: 'video', title: ' Sunset Sessions', content: 'Golden light, glassy waves. Pure magic. 🎬 YouTube', image: 'https://images.unsplash.com/photo-1559827260-dc66d52b21d4?w=800&auto=format', videoUrl: 'placeholder' },
  
  // LOCAL (Guadeloupe) FEED
  { id: 'loc1', feed: 'local', size: 'square', type: 'spot', title: 'Caravelle', content: 'East coast gem. Beginner-friendly. Clean waves when swell hits.', location: 'Sainte-Anne', image: 'https://images.unsplash.com/photo-1506905925346-21b49c82b1dd?w=400&auto=format' },
  { id: 'loc2', feed: 'local', size: 'horizontal', type: 'reel', title: 'Bonnes Conditions ce Matin 🌊', content: 'GwadaShots — Perfect morning conditions in Guadeloupe.', location: 'Guadeloupe', image: 'https://images.pexels.com/photos/1556663/pexels-photo-1556663.jpeg?auto=compress&cs=tinysrgb&w=800', videoUrl: 'https://www.instagram.com/reel/DYCUdqEBCqk/', videoType: 'instagram' },
  { id: 'loc3', feed: 'local', size: 'horizontal', type: 'video', title: 'Compétition de Surf Gwada 🏆', content: 'Annual competition footage. Music, food, waves.', location: 'Guadeloupe', image: 'https://i.ytimg.com/vi/k8VxkPMqYdU/hqdefault.jpg', videoUrl: 'https://youtu.be/k8VxkPMqYdU', videoType: 'youtube' },
  { id: 'loc4', feed: 'local', size: 'small', type: 'spot', title: 'Port Louis', content: 'Northwest break. Afternoon sessions.', location: 'Port-Louis' },
  { id: 'loc5', feed: 'local', size: 'horizontal', type: 'tweet', title: 'New Surf School Opening', content: 'Fresh surf school confirmed in Le Moule! 📍', location: 'Le Moule', image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=800&auto=format' },
  { id: 'loc6', feed: 'local', size: 'tall', type: 'spot', title: 'Pointe des Châteaux', content: 'Scenic point. Epic views when swell hits. Legendary sunrise spot.', location: 'Saint-François', image: 'https://images.unsplash.com/photo-1518837695005-2081c6f8a49d?w=600&auto=format' },
  { id: 'loc7', feed: 'local', size: 'square', type: 'event', title: 'Beach Clean-Up', content: 'Community gathering. Protect our playground.', location: 'Grande Anse', image: 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=400&auto=format' },
  { id: 'loc8', feed: 'local', size: 'horizontal', type: 'reel', title: 'Gwada Dawn Patrol', content: '5AM sessions. Empty waves. Pure bliss. 🎬 TikTok', location: 'Le Moule', image: 'https://images.unsplash.com/photo-1559827260-dc66d52b21d4?w=800&auto=format', videoUrl: 'placeholder' },
  
  // GLOBAL FEED
  { id: 'gl1', feed: 'global', size: 'horizontal', type: 'video', title: 'WSL Championship Highlights', content: 'Best waves from the world tour finals. 🎬 YouTube', source: 'World Surf League', image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=800&auto=format', videoUrl: 'placeholder' },
  { id: 'gl2', feed: 'global', size: 'tall', type: 'travel', title: 'Hidden Gems: Indonesia', content: 'Beyond Bali — discovering uncrowded perfection in Mentawai.', source: 'Surf Travel Mag', image: 'https://images.unsplash.com/photo-1500462918059-1e51d7-e1e0cc?w=600&auto=format' },
  { id: 'gl3', feed: 'global', size: 'square', type: 'culture', title: 'Wave Riding Art', content: 'Traditional Hawaiian to modern performance shaping.', source: 'Surfer\'s Journal', image: 'https://images.unsplash.com/photo-1455729552865-3658e0c677dd?w=400&auto=format' },
  { id: 'gl4', feed: 'global', size: 'small', type: 'tweet', title: '', content: '"Ocean conservation wins — new protected areas announced globally." 🌍', source: '@OceanNews' },
  { id: 'gl5', feed: 'global', size: 'horizontal', type: 'reel', title: 'Sustainable Board Building', content: 'Eco-friendly materials reshaping the industry. 🎬 TikTok', image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=800&auto=format', videoUrl: 'placeholder' },
  { id: 'gl6', feed: 'global', size: 'tall', type: 'travel', title: 'Europe Winter Swells', content: 'Portugal, France, Spain deliver when the Atlantic wakes up.', source: 'Euro Surf Guide', image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=600&auto=format' },
  { id: 'gl7', feed: 'global', size: 'square', type: 'photo', title: 'Tahiti Teahupo\'o', content: 'The heaviest wave on earth.', source: 'Surf Photography', image: 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=400&auto=format' },
  { id: 'gl8', feed: 'global', size: 'horizontal', type: 'video', title: 'Australia East Coast', content: 'Gold Coast to Noosa — endless waves. 🎬 YouTube', image: 'https://images.unsplash.com/photo-1559827260-dc66d52b21d4?w=800&auto=format', videoUrl: 'placeholder' },
  { id: 'gl9', feed: 'global', size: 'horizontal', type: 'video', title: 'Soul Surfer: Bethany Hamilton', content: 'Inspiring story of resilience and return to the waves. 🎬 YouTube', source: 'YouTube', image: 'https://i.ytimg.com/vi/okE2130c4Xw/maxresdefault.jpg', videoUrl: 'https://youtu.be/okE2130c4Xw', videoType: 'youtube' },
  
  // TEXT TWEETS (pure text, no images)
  { id: 'tweet1', feed: 'feelgood', size: 'small', type: 'tweet', title: '', content: 'Nothing beats the feeling of catching your first wave. Pure joy. 🌊', source: '@SurferDaily' },
  { id: 'tweet2', feed: 'feelgood', size: 'small', type: 'tweet', title: '', content: 'Every surf session is a reset button for the soul.', source: '@WaveRider' },
  { id: 'tweet3', feed: 'local', size: 'small', type: 'tweet', title: '', content: 'Caravelle was firing this morning! Clean 3ft sets all day. 📍 Sainte-Anne', source: '@GwadaSurfReport' },
  { id: 'tweet4', feed: 'local', size: 'small', type: 'tweet', title: '', content: 'New surf shop opening in Le Moule next month! Exciting times for the community 🏄', source: '@LocalSurfNews' },
  { id: 'tweet5', feed: 'global', size: 'small', type: 'tweet', title: '', content: 'WSL announces new carbon-neutral tour schedule for 2027 🌍', source: '@WSLUpdates' },
  { id: 'tweet6', feed: 'global', size: 'small', type: 'tweet', title: '', content: 'Teahupo\'o delivered legendary conditions this week. Heaviest waves on Earth.', source: '@SurfPhotography' },
  { id: 'tweet7', feed: 'feelgood', size: 'small', type: 'tweet', title: '', content: 'Paddle out. Catch waves. Reset mind. Repeat.', source: '@ZenSurfer' },
  { id: 'tweet8', feed: 'local', size: 'small', type: 'tweet', title: '', content: 'Pointe des Châteaux sunrise session = spiritual experience', source: '@GwadaLocals' },
  
  // EXTRA HERO IMAGES — expanded pool for full coverage (Unsplash)
  { id: 'hero1', feed: 'feelgood', size: 'small', type: 'photo', title: '', content: 'Peaceful moments.', image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=400&auto=format' },
  { id: 'hero2', feed: 'local', size: 'small', type: 'photo', title: '', content: 'Island vibes.', image: 'https://images.unsplash.com/photo-1506905925346-21b49c82b1dd?w=400&auto=format' },
  { id: 'hero3', feed: 'global', size: 'small', type: 'photo', title: '', content: 'World waves.', image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=400&auto=format' },
  { id: 'hero4', feed: 'feelgood', size: 'small', type: 'quote', title: '', content: '"Saltwater cures all wounds."', source: 'Old Wisdom' },
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
  { id: 'hero16', feed: 'feelgood', size: 'small', type: 'quote', title: '', content: '"The best surfer out there is the one having the most fun."', source: 'Phil Edwards' },
];

const sizeClasses: Record<CardSize, string> = {
  small: 'row-span-1 col-span-1 min-h-[200px]',
  square: 'row-span-2 col-span-1 min-h-[320px]',
  tall: 'row-span-3 col-span-1 min-h-[440px]',
  wide: 'row-span-1 col-span-2 min-h-[200px]',
  horizontal: 'row-span-1 col-span-2 min-h-[180px]',
};

const typeLabels: Record<string, string> = {
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

// Extract video ID from various URL formats
function extractVideoId(url: string, videoType: string): string | null {
  if (videoType === 'youtube') {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
  if (videoType === 'instagram') {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
  if (videoType === 'tiktok') {
    const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

// Add crop params to image URL for full-bleed coverage based on slot dimensions
function addCropParams(url: string, className: string): string {
  // Parse grid spans from className
  const colMatch = className.match(/col-span-(\d+)/);
  const rowMatch = className.match(/row-span-(\d+)/);
  
  if (!colMatch || !rowMatch) return url;
  
  const cols = parseInt(colMatch[1]);
  const rows = parseInt(rowMatch[1]);
  
  // Grid is 12 cols x 10 rows. Approximate pixel dimensions.
  const width = cols * 120;
  const height = rows * 80;
  
  // YouTube thumbnails: swap to maxresdefault (true 16:9, no black bars)
  // hqdefault has baked-in black bars, maxresdefault/mqdefault are clean 16:9
  if (url.includes('i.ytimg.com')) {
    // Extract video ID and use maxresdefault (highest quality, true aspect ratio)
    const match = url.match(/\/vi\/([a-zA-Z0-9_-]+)\/(?:hqdefault|maxresdefault|mqdefault|default|sddefault)/);
    if (match) {
      const videoId = match[1];
      // maxresdefault is true 16:9, highest quality (may not exist for some videos)
      // If it doesn't load, Next.js will fallback to original URL
      return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return url;
  }
  
  // Unsplash: add fit=crop with dimensions
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format`;
  }
  
  // Pexels: similar approach
  if (url.includes('pexels.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=compress&cs=tinysrgb&w=${Math.max(width, 800)}`;
  }
  
  // Other URLs: return unchanged
  return url;
}

// Render inline video embed
function renderVideoEmbed(item: GridItem) {
  const videoId = item.videoUrl && item.videoType ? extractVideoId(item.videoUrl, item.videoType) : null;
  
  if (!videoId) return null;
  
  if (item.videoType === 'youtube') {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={item.title || item.content}
      />
    );
  }
  
  if (item.videoType === 'instagram') {
    return (
      <iframe
        src={`https://www.instagram.com/reel/${videoId}/embed`}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        title={item.title || item.content}
      />
    );
  }
  
  if (item.videoType === 'tiktok') {
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        title={item.title || item.content}
      />
    );
  }
  
  return null;
}

// Collage layout generator — full coverage, subtle size variations
function generateCollageLayout() {
  return {
    // Opacity: all images full visibility
    opacities: Array(20).fill(1.0),
    // Scale: subtle variations for depth (20 slots)
    scaleVariations: [
      1.02, // Slot 1 — Large
      1.01, // Slot 2 — Large
      1.0,  // Slot 3 — Large
      1.01, // Slot 4 — Large
      1.0,  // Slot 5 — Large
      0.99, // Slot 6 — Large
      0.98, // Slot 7 — Large
      0.97, // Slot 8 — Large
      0.96, // Slot 9 — Large
      0.95, // Slot 10 — Large
      0.94, // Slot 11 — Medium
      0.92, // Slot 12 — Medium
      0.90, // Slot 13 — Medium
      0.88, // Slot 14 — Medium
      0.86, // Slot 15 — Medium
      0.84, // Slot 16 — Small
      0.80, // Slot 17 — Small
      0.80, // Slot 18 — Small
      0.82, // Slot 19 — Small
      0.85, // Slot 20 — Medium
    ],
  };
}

// Hero collage items — will be populated from live API data
// Hero collage items — EXCLUDE video/reel items (only photos, quotes, text)
// 20 slots for coverage
const heroCollageItemsStatic = [
  ...allItems.filter(item => item.id.startsWith('hero') && item.image && item.type !== 'video' && item.type !== 'reel'),
  ...allItems.filter(item => item.type === 'photo' && !item.id.startsWith('hero') && item.image),
  ...allItems.filter(item => item.type === 'quote' && !item.id.startsWith('hero')),
  ...allItems.filter(item => item.type === 'tweet' && !item.image).slice(0, 2),
].slice(0, 20);

export default function HomePage() {
  const [activeFeed, setActiveFeed] = useState<FeedType>('feelgood');
  const [scrollY, setScrollY] = useState(0);
  const [layout, setLayout] = useState(generateCollageLayout());
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  // Hero pool images (from curated photography API)
  const [heroPoolImages, setHeroPoolImages] = useState<any[]>([]);
  
  useEffect(() => {
    setLayout(generateCollageLayout());
  }, []);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Shuffle function for randomizing hero pool
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch hero pool photography
  useEffect(() => {
    const fetchHeroPool = async () => {
      try {
        const res = await fetch('/api/hero/fetch');
        const data = await res.json();
        if (data.success && data.images && data.images.length > 0) {
          // Shuffle images so they rotate on each refresh
          setHeroPoolImages(shuffleArray(data.images));
        }
      } catch (e) {
        console.log('Hero pool API not ready, using static fallback');
      }
    };
    fetchHeroPool();
  }, []);
  
  // Fetch live feed content from API
  const [liveItems, setLiveItems] = useState<GridItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/feed');
        const data = await res.json();
        if (data.success && data.items) {
          setLiveItems(data.items);
        }
      } catch (e) {
        console.log('Feed API not ready, using static content');
      }
      setIsLoading(false);
    };
    fetchFeed();
  }, []);
  
  // Merge: use ONLY live items when available (no static fallback for same feed)
  const mergedItems = liveItems.length > 0 
    ? liveItems.filter(item => item.feed === activeFeed)
    : allItems.filter(item => item.feed === activeFeed && !item.id.startsWith('hero'));
  
  const filteredItems = mergedItems;
  
  // Hero collage items — use hero pool photography when available, fallback to static
  // 20 slots for coverage (no gaps)
  const heroCollageItems = heroPoolImages.length > 0 
    ? heroPoolImages.slice(0, 20).map(img => ({
        id: img.id,
        image: img.url,
        title: img.photographerName,
        content: img.altDescription,
        type: 'photo',
        feed: 'feelgood',
        size: img.orientation === 'landscape' ? 'horizontal' : img.orientation === 'portrait' ? 'tall' : 'square',
      }))
    : heroCollageItemsStatic;
  
  const titleOffset = scrollY * 0.3;
  const collageOffset = scrollY * 0.15;
  
  // Collage slot renderer (20 slots for coverage)
  const renderCollageSlot = (index: number, className: string, styleOverrides = {}) => {
    const item = heroCollageItems[index];
    if (!item) return null;
    
    // Apply crop params for full-bleed coverage
    const croppedImage = item.image ? addCropParams(item.image, className) : null;
    
    const baseStyle = {
      opacity: layout.opacities[index],
      zIndex: isHovered === index ? 50 : 10 + index,
      transform: `scale(${layout.scaleVariations[index]})`,
    };
    
    const style = { ...baseStyle, ...styleOverrides };
    
    return (
      <div 
        className={className}
        style={style}
        onMouseEnter={() => setIsHovered(index)}
        onMouseLeave={() => setIsHovered(null)}
      >
        {croppedImage ? (
          <>
            <Image
              src={croppedImage}
              alt={item.title || item.content || ''}
              fill
              className="object-cover transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent" />
          </>
        ) : (
          // Text-only cards (tweets, quotes)
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${
            item.type === 'tweet' 
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-white/10' 
              : 'bg-gradient-to-br from-gray-900 to-black'
          }`}>
            {/* X logo for tweets */}
            {item.type === 'tweet' && (
              <div className="absolute top-3 left-3 text-white/30 font-bold text-lg">𝕏</div>
            )}
            <p className={`text-sm md:text-base text-white/80 text-center leading-relaxed ${
              item.type === 'quote' ? 'italic' : ''
            }`}>
              {item.content}
            </p>
            {item.source && (
              <p className="absolute bottom-3 text-xs text-white/40 flex items-center gap-1">
                {item.type === 'tweet' && <span className="text-white/50">𝕏</span>}
                <span>{item.source}</span>
              </p>
            )}
          </div>
        )}
        
        {/* Video indicator */}
        {item.videoUrl && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
            <span className="text-xs text-white">▶</span>
          </div>
        )}
        
        {/* Content overlay for larger slots */}
        {(item.title || (item.content && item.type !== 'quote')) && (
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs text-white/30">{typeLabels[item.type]}</p>
            {item.title && <p className="text-xs text-white/20 mt-1 line-clamp-1">{item.title}</p>}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO — Dense Overlapping Collage (20 slots, full coverage)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative h-[115dvh] md:min-h-screen overflow-hidden bg-black">
        
        {/* Base background gradient layer */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
        
        {/* Collage grid — EXPLICIT placement, full coverage, NO gaps */}
        <div 
          className="absolute inset-0 z-1 grid grid-cols-12 grid-rows-10 gap-0 h-[115dvh] md:h-full"
          style={{ transform: `translateY(${collageOffset}px)` }}
        >
          {/* ═══════════════════════════════════════════════════════════════
              COLUMN 1-4 — Left side anchors
              ═══════════════════════════════════════════════════════════════ */}
          
          {/* SLOT 1 — Full left (cols 1-4, rows 1-10) */}
          <div className="col-[1_/_5] row-[1_/_11] h-full w-full">
            {renderCollageSlot(0, 'relative overflow-hidden h-full w-full', { zIndex: 5 })}
          </div>
          
          {/* SLOT 2 — Left top accent (cols 1-2, rows 1-5) */}
          <div className="col-[1_/_3] row-[1_/_6] h-full w-full">
            {renderCollageSlot(1, 'relative overflow-hidden h-full w-full', { zIndex: 10 })}
          </div>
          
          {/* ═══════════════════════════════════════════════════════════════
              COLUMN 5-8 — Center coverage
              ═══════════════════════════════════════════════════════════════ */}
          
          {/* SLOT 3 — Center top (cols 5-8, rows 1-5) */}
          <div className="col-[5_/_9] row-[1_/_6] h-full w-full">
            {renderCollageSlot(2, 'relative overflow-hidden h-full w-full', { zIndex: 15 })}
          </div>
          
          {/* SLOT 4 — Center middle (cols 5-8, rows 5-7) — fills behind text */}
          <div className="col-[5_/_9] row-[5_/_8] h-full w-full">
            {renderCollageSlot(3, 'relative overflow-hidden h-full w-full', { zIndex: 20 })}
          </div>
          
          {/* SLOT 5 — Center bottom (cols 5-8, rows 7-10) */}
          <div className="col-[5_/_9] row-[7_/_11] h-full w-full">
            {renderCollageSlot(4, 'relative overflow-hidden h-full w-full', { zIndex: 25 })}
          </div>
          
          {/* ═══════════════════════════════════════════════════════════════
              COLUMN 9-12 — Right side, full coverage (was the gap area)
              ═══════════════════════════════════════════════════════════════ */}
          
          {/* SLOT 6 — Right edge tall (cols 11-12, rows 1-10) — fills top-right strip */}
          <div className="col-[11_/_13] row-[1_/_11] h-full w-full">
            {renderCollageSlot(5, 'relative overflow-hidden h-full w-full', { zIndex: 8 })}
          </div>
          
          {/* SLOT 7 — Upper-right (cols 9-11, rows 1-5) */}
          <div className="col-[9_/_12] row-[1_/_6] h-full w-full">
            {renderCollageSlot(6, 'relative overflow-hidden h-full w-full', { zIndex: 12 })}
          </div>
          
          {/* SLOT 8 — Mid-right (cols 9-11, rows 5-7) */}
          <div className="col-[9_/_12] row-[5_/_8] h-full w-full">
            {renderCollageSlot(7, 'relative overflow-hidden h-full w-full', { zIndex: 18 })}
          </div>
          
          {/* SLOT 9 — Lower-right (cols 9-11, rows 7-10) — fills bottom-right block */}
          <div className="col-[9_/_12] row-[7_/_11] h-full w-full">
            {renderCollageSlot(8, 'relative overflow-hidden h-full w-full', { zIndex: 22 })}
          </div>
          
          {/* SLOT 10 — Top-right corner (cols 9-12, rows 1-3) */}
          <div className="col-[9_/_13] row-[1_/_4] h-full w-full">
            {renderCollageSlot(9, 'relative overflow-hidden h-full w-full', { zIndex: 28 })}
          </div>
          
          {/* ═══════════════════════════════════════════════════════════════
              FILLER SLOTS (10) — tiny accents, full coverage
              ═══════════════════════════════════════════════════════════════ */}
          
          {/* SLOT 11-20 — Small fillers (hidden on mobile, visible md+) */}
          <div className="hidden md:block col-[3_/_5] row-[3_/_5] h-full w-full">{renderCollageSlot(10, 'relative overflow-hidden h-full w-full', { zIndex: 30 })}</div>
          <div className="hidden md:block col-[4_/_6] row-[4_/_6] h-full w-full">{renderCollageSlot(11, 'relative overflow-hidden h-full w-full', { zIndex: 32 })}</div>
          <div className="hidden md:block col-[6_/_8] row-[3_/_4] h-full w-full">{renderCollageSlot(12, 'relative overflow-hidden h-full w-full', { zIndex: 34 })}</div>
          <div className="hidden md:block col-[7_/_9] row-[4_/_5] h-full w-full">{renderCollageSlot(13, 'relative overflow-hidden h-full w-full', { zIndex: 36 })}</div>
          <div className="hidden md:block col-[8_/_10] row-[2_/_4] h-full w-full">{renderCollageSlot(14, 'relative overflow-hidden h-full w-full', { zIndex: 38 })}</div>
          <div className="hidden md:block col-[10_/_12] row-[3_/_5] h-full w-full">{renderCollageSlot(15, 'relative overflow-hidden h-full w-full', { zIndex: 40 })}</div>
          <div className="hidden md:block col-[3_/_4] row-[6_/_8] h-full w-full">{renderCollageSlot(16, 'relative overflow-hidden h-full w-full', { zIndex: 42 })}</div>
          <div className="hidden md:block col-[8_/_9] row-[6_/_8] h-full w-full">{renderCollageSlot(17, 'relative overflow-hidden h-full w-full', { zIndex: 44 })}</div>
          <div className="hidden md:block col-[1_/_3] row-[8_/_10] h-full w-full">{renderCollageSlot(18, 'relative overflow-hidden h-full w-full', { zIndex: 46 })}</div>
          <div className="hidden md:block col-[6_/_7] row-[6_/_7] h-full w-full">{renderCollageSlot(19, 'relative overflow-hidden h-full w-full', { zIndex: 48 })}</div>
        </div>
        
        {/* Light gradient overlay for title readability — 80% transparent */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/20 via-black/10 to-black/25" />
        
        {/* Title overlay */}
        <div className="relative z-30 h-[115dvh] md:h-screen flex flex-col items-center justify-center px-8 md:px-12">
          {/* Two-line brand + location */}
          <div 
            className="relative mb-4"
            style={{ transform: `translateY(${titleOffset}px)` }}
          >
            {/* SurfHub — gradient, top-left */}
            <span 
              className="absolute -top-10 md:-top-14 left-0 text-[1.8rem] md:text-[2.5rem] font-black tracking-[-0.01em] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent"
            >
              SurfHub
            </span>
            {/* Guadeloupe — large, white, tight kerning */}
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-[-0.08em] text-white">
              Guadeloupe
            </h1>
          </div>
          <p 
            className="text-base md:text-lg lg:text-xl text-white/50 max-w-md mx-auto mb-10 md:mb-12 text-center px-8 md:px-12"
            style={{ transform: `translateY(${titleOffset * 0.7}px)` }}
          >
            Surfing is one of the magical treasures this world has to offer. Dive in and be a part of it.
          </p>
          
          <button 
            onClick={() => {
              document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <span className="text-xs uppercase tracking-widest">Explore</span>
            <div className="w-5 h-8 rounded-full border border-white/25 group-hover:border-white/50 flex items-start justify-center p-1.5">
              <div className="w-1 h-2.5 bg-white/40 group-hover:bg-white/70 rounded-full animate-bounce" />
            </div>
          </button>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════
          BREATH + TOGGLE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-center relative px-3 py-1.5 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/15 dark:border-white/8">
            
            <div 
              className="absolute h-5 w-18 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
              style={{
                transform: `translateX(${
                  activeFeed === 'feelgood' ? '-48px' 
                  : activeFeed === 'local' ? '0px' 
                  : '48px'
                })`,
              }}
            />
            
            {(['feelgood', 'local', 'global'] as FeedType[]).map((feed) => (
              <button
                key={feed}
                onClick={() => setActiveFeed(feed)}
                className={`relative z-10 px-5 py-1 rounded-full text-xs tracking-wide uppercase transition-colors ${
                  activeFeed === feed
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {feed === 'feelgood' && 'Feel Good'}
                {feed === 'local' && 'Local'}
                {feed === 'global' && 'Global'}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════
          FEED GRID
          ═══════════════════════════════════════════════════════════════ */}
      <section id="feed-section" className="pb-20 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[180px]">
            
            {filteredItems.map((item) => {
              // Video items with videoType: inline playback
              if (item.videoUrl && item.videoType) {
                const isPlaying = playingId === item.id;
                
                return (
                  <Card 
                    key={item.id}
                    className={`${sizeClasses[item.size]} relative overflow-hidden group cursor-pointer bg-card/80 hover:border-primary/40 transition-all duration-300`}
                    onClick={() => setPlayingId(isPlaying ? null : item.id)}
                  >
                    {isPlaying ? (
                      // VIDEO PLAYING: show embed with close button
                      <div className="absolute inset-0 z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPlayingId(null); }}
                          className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                          aria-label="Close video"
                        >
                          ✕
                        </button>
                        {renderVideoEmbed(item)}
                      </div>
                    ) : (
                      // VIDEO CARD: show thumbnail with play button
                      <>
                        {item.image && (
                          <div className="absolute inset-0 z-0">
                            <Image
                              src={item.image}
                              alt={item.title || item.content}
                              fill
                              className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          </div>
                        )}
                        
                        {/* Play button indicator */}
                        <div className="absolute top-3 right-3 z-20 px-2 py-1.5 rounded bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors">
                          <span className="text-xs text-white/80">▶ Play</span>
                        </div>
                        
                        <div className="relative z-10 h-full flex flex-col justify-end p-4">
                          <div className="mb-auto">
                            <span className="text-xs opacity-50">{typeLabels[item.type]}</span>
                          </div>
                          
                          {item.title && (
                            <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">
                              {item.title}
                            </h3>
                          )}
                          <p className="text-xs text-white/70 line-clamp-2 mb-2">
                            {item.content}
                          </p>
                          
                          {(item.source || item.location) && (
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              {item.source && <span>{item.source}</span>}
                              {item.location && <span>📍 {item.location}</span>}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </Card>
                );
              }
              
              // Regular items: static cards or external links
              return (
                <Card 
                  key={item.id}
                  className={`${sizeClasses[item.size]} relative overflow-hidden group cursor-pointer bg-card/80 hover:border-primary/40 transition-all duration-300`}
                >
                {item.image ? (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={item.image}
                      alt={item.title || item.content}
                      fill
                      className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>
                ) : (
                  // Text-only cards (tweets, quotes) — X-style for tweets
                  <div className={`absolute inset-0 flex flex-col ${
                    item.type === 'tweet' 
                      ? 'bg-black border border-gray-800 p-4' 
                      : 'bg-gradient-to-br from-gray-900/80 to-black/90 items-center justify-center p-6'
                  }`}>
                    {/* X-style tweet layout */}
                    {item.type === 'tweet' && (
                      <>
                        {/* Header: Avatar + Handle */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                            {item.source?.slice(1, 3).toUpperCase() || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-semibold text-sm flex items-center gap-1">
                              {item.source || 'User'}
                              <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.34.23-.48-.94-1.47-1.58-2.59-1.58-1.63 0-2.94 1.35-2.94 3 0 .23.03.45.07.66-.94-.3-1.95-.47-3-.47C4.03 4.84.5 8.37.5 12.5c0 4.13 3.53 7.66 7.88 7.66 1.05 0 2.06-.17 3-.47-.04.21-.07.43-.07.66 0 1.65 1.31 3 2.94 3 1.12 0 2.11-.64 2.59-1.58.42.146.87.23 1.34.23 2.108 0 3.818-1.79 3.818-4 0-.495-.084-.964-.238-1.4 1.273-.65 2.148-2.02 2.148-3.58z"/>
                              </svg>
                            </span>
                            <span className="text-gray-500 text-xs">{item.source?.toLowerCase() || '@user'}</span>
                          </div>
                          {/* X logo */}
                          <div className="ml-auto text-white/80">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Tweet content */}
                        <p className="text-white text-base leading-relaxed mb-2 flex-grow">
                          {item.content}
                        </p>
                        
                        {/* Timestamp */}
                        <div className="text-gray-500 text-xs mt-auto">
                          {item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'}
                        </div>
                      </>
                    )}
                    
                    {/* Quote styling */}
                    {item.type === 'quote' && (
                      <>
                        <p className="text-white/80 text-center leading-relaxed italic">
                          {item.content}
                        </p>
                        {item.source && (
                          <p className="text-xs text-white/40 mt-3">
                            — {item.source}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                <div className="relative z-10 h-full flex flex-col justify-end p-4">
                  <div className="mb-auto">
                    <span className="text-xs opacity-50">{typeLabels[item.type]}</span>
                  </div>
                  
                  {item.title && (
                    <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                  )}
                  <p className="text-xs text-white/70 line-clamp-2 mb-2">
                    {item.content}
                  </p>
                  
                  {(item.source || item.location) && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      {item.source && <span>{item.source}</span>}
                      {item.location && <span>📍 {item.location}</span>}
                    </div>
                  )}
                </div>
              </Card>
              );
            })}
            
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground opacity-40">
            Curated daily • More coming soon
          </p>
        </div>
      </section>
    </div>
  );
}