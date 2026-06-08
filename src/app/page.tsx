'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

import { GoodVibesFeed } from '@/components/feeds/GoodVibesFeed';
import { GuadeloupeFeed } from '@/components/feeds/GuadeloupeFeed';
import { GlobalSurfFeed } from '@/components/feeds/GlobalSurfFeed';

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

// Only hero collage and text items — removed all pure-feed content
const allItems: GridItem[] = [
  // HERO COLLAGE IMAGES
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

  // FEEL GOOD — Quotes & photos used by hero collage
  { id: 'fg1', feed: 'feelgood', size: 'tall', type: 'quote', title: 'Wave Wisdom', content: '"The ocean heals everything. It whispers to those who listen."', source: 'Surfer\'s Journal', image: 'https://images.unsplash.com/photo-1505142468610-359797ca27ae?w=600&auto=format' },
  { id: 'fg3', feed: 'feelgood', size: 'wide', type: 'photo', title: 'Empty Lineup', content: 'Just you, the board, and the swell.', image: 'https://images.unsplash.com/photo-1468581264422-2543c2b0e77e?w=800&auto=format' },
  { id: 'fg4', feed: 'feelgood', size: 'small', type: 'quote', title: '', content: '"You can\'t stop the waves, but you can learn how to swim."', source: 'Jon Kabat-Zinn' },
  { id: 'fg6', feed: 'feelgood', size: 'tall', type: 'photo', title: 'Golden Hour', content: 'When light hits water just right.', image: 'https://images.unsplash.com/photo-1500462918059-1e51d7e1e0cc?w=600&auto=format' },
  { id: 'fg7', feed: 'feelgood', size: 'square', type: 'photo', title: 'Drift Days', content: 'Days where time slows down.', image: 'https://images.unsplash.com/photo-1534190760962-754642a4dc2e?w=400&auto=format' },

  // TEXT TWEETS (pure text, no images)
  { id: 'tweet1', feed: 'feelgood', size: 'small', type: 'tweet', title: '', content: 'Nothing beats the feeling of catching your first wave. Pure joy. 🌊', source: '@SurferDaily' },
  { id: 'tweet2', feed: 'feelgood', size: 'small', type: 'tweet', title: '', content: 'Every surf session is a reset button for the soul.', source: '@WaveRider' },
  { id: 'tweet7', feed: 'feelgood', size: 'small', type: 'tweet', title: '', content: 'Paddle out. Catch waves. Reset mind. Repeat.', source: '@ZenSurfer' },
];

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
  if (url.includes('i.ytimg.com')) {
    const match = url.match(/\/vi\/([a-zA-Z0-9_-]+)\/(?:hqdefault|maxresdefault|mqdefault|default|sddefault)/);
    if (match) {
      const videoId = match[1];
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
  
  return url;
}

// Collage layout generator — full coverage, subtle size variations
function generateCollageLayout() {
  return {
    opacities: Array(20).fill(1.0),
    scaleVariations: [
      1.02, 1.01, 1.0, 1.01, 1.0,
      0.99, 0.98, 0.97, 0.96, 0.95,
      0.94, 0.92, 0.90, 0.88, 0.86,
      0.84, 0.80, 0.80, 0.82, 0.85,
    ],
  };
}

// Hero collage items — EXCLUDE video/reel items (only photos, quotes, text)
// 20 slots for coverage
const heroCollageItemsStatic = [
  ...allItems.filter(item => item.id.startsWith('hero') && item.image && item.type !== 'video' && item.type !== 'reel'),
  ...allItems.filter(item => item.type === 'photo' && !item.id.startsWith('hero') && item.image),
  ...allItems.filter(item => item.type === 'quote' && !item.id.startsWith('hero')),
  ...allItems.filter(item => item.type === 'tweet' && !item.image).slice(0, 2),
].slice(0, 20);

// Shuffle function for randomizing hero pool
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function HomePage() {
  const [activeFeed, setActiveFeed] = useState<FeedType>('feelgood');
  const [scrollY, setScrollY] = useState(0);
  const [layout, setLayout] = useState(generateCollageLayout());
  const [isHovered, setIsHovered] = useState<number | null>(null);
  
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

  // Fetch hero pool photography
  useEffect(() => {
    const fetchHeroPool = async () => {
      try {
        const res = await fetch('/api/hero/fetch');
        const data = await res.json();
        if (data.success && data.images && data.images.length > 0) {
          setHeroPoolImages(shuffleArray(data.images));
        }
      } catch (e) {
        console.log('Hero pool API not ready, using static fallback');
      }
    };
    fetchHeroPool();
  }, []);
  
  // Hero collage items — use hero pool photography when available, fallback to static
  // 20 slots for coverage (no gaps)
  const heroCollageItems = heroPoolImages.length > 0 
    ? heroPoolImages.slice(0, 20).map(img => ({
        id: img.id,
        image: img.url,
        title: img.photographerName,
        content: img.altDescription,
        type: 'photo',
        feed: 'feelgood' as FeedType,
        size: img.orientation === 'landscape' ? 'horizontal' as CardSize : img.orientation === 'portrait' ? 'tall' as CardSize : 'square' as CardSize,
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
      <section className="relative h-[120dvh] md:min-h-screen overflow-hidden bg-black">
        
        {/* Base background gradient layer */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
        
        {/* Collage grid — EXPLICIT placement, full coverage, NO gaps */}
        <div 
          className="absolute inset-0 z-1 grid grid-cols-12 grid-rows-10 gap-0 h-[120dvh] md:h-full"
          style={{ transform: `translateY(${collageOffset}px)` }}
        >
          {/* COLUMN 1-4 — Left side anchors */}
          
          {/* SLOT 1 — Full left (cols 1-4, rows 1-10) */}
          <div className="col-[1_/_5] row-[1_/_11] h-full w-full">
            {renderCollageSlot(0, 'relative overflow-hidden h-full w-full', { zIndex: 5 })}
          </div>
          
          {/* SLOT 2 — Left top accent (cols 1-2, rows 1-5) */}
          <div className="col-[1_/_3] row-[1_/_6] h-full w-full">
            {renderCollageSlot(1, 'relative overflow-hidden h-full w-full', { zIndex: 10 })}
          </div>
          
          {/* COLUMN 5-8 — Center coverage */}
          
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
          
          {/* COLUMN 9-12 — Right side, full coverage */}
          
          {/* SLOT 6 — Right edge tall (cols 11-12, rows 1-10) */}
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
          
          {/* SLOT 9 — Lower-right (cols 9-11, rows 7-10) */}
          <div className="col-[9_/_12] row-[7_/_11] h-full w-full">
            {renderCollageSlot(8, 'relative overflow-hidden h-full w-full', { zIndex: 22 })}
          </div>
          
          {/* SLOT 10 — Top-right corner (cols 9-12, rows 1-3) */}
          <div className="col-[9_/_13] row-[1_/_4] h-full w-full">
            {renderCollageSlot(9, 'relative overflow-hidden h-full w-full', { zIndex: 28 })}
          </div>
          
          {/* FILLER SLOTS (10) — tiny accents, full coverage */}
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
        <div className="relative z-30 h-[120dvh] md:h-screen flex flex-col items-center justify-center px-8 md:px-12">
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
          FEED GRID — Live-fetching components from /api/feed
          ═══════════════════════════════════════════════════════════════ */}
      <section id="feed-section" className="pb-20 px-4 md:px-8 lg:px-12 bg-background">
        <div className="max-w-6xl mx-auto">
          {activeFeed === 'feelgood' && <GoodVibesFeed />}
          {activeFeed === 'local' && <GuadeloupeFeed />}
          {activeFeed === 'global' && <GlobalSurfFeed />}
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
