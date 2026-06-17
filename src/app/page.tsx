'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

import { GoodVibesFeed } from '@/components/feeds/GoodVibesFeed';
import { GuadeloupeFeed } from '@/components/feeds/GuadeloupeFeed';
import { GlobalSurfFeed } from '@/components/feeds/GlobalSurfFeed';
import SurfMapSection from '@/components/surf-map/SurfMapSection';
import { MapPin } from 'lucide-react';

import type { GridItem, FeedType } from '@/data/hero-collage-data';
import { allItems, typeLabels, heroCollageItemsStatic } from '@/data/hero-collage-data';
import { addCropParams, shuffleArray, generateCollageLayout } from '@/lib/surf-map/image-utils';

export default function HomePage() {
  const [activeFeed, setActiveFeed] = useState<FeedType>('feelgood');
  const [scrollY, setScrollY] = useState(0);
  const [layout, setLayout] = useState(generateCollageLayout());
  const [isHovered, setIsHovered] = useState<number | null>(null);
  
  const mapRef = useRef<HTMLElement>(null);
  const feedRef = useRef<HTMLElement>(null);
  
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
  
  const renderCollageSlot = (index: number, className: string, styleOverrides = {}) => {
    const item = heroCollageItems[index];
    if (!item) return null;
    
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
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${
            item.type === 'tweet' 
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-white/10' 
              : 'bg-gradient-to-br from-gray-900 to-black'
          }`}>
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
        
        {item.videoUrl && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
            <span className="text-xs text-white">▶</span>
          </div>
        )}
        
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
    <div className="min-h-screen bg-background snap-y snap-mandatory overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
      
      {/* ═══════════════════════════════════════════════════════════════
          HERO — Dense Overlapping Collage (20 slots, full coverage)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen overflow-hidden bg-black snap-start">
        
        {/* Base background gradient layer */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
        
        {/* Collage grid — EXPLICIT placement, full coverage, NO gaps */}
        <div 
          className="absolute inset-0 z-1 grid grid-cols-12 grid-rows-10 gap-0 h-full"
          style={{ transform: `translateY(${collageOffset}px)` }}
        >
          {/* COLUMN 1-4 — Left side anchors */}
          <div className="col-[1_/_5] row-[1_/_11] h-full w-full">
            {renderCollageSlot(0, 'relative overflow-hidden h-full w-full', { zIndex: 5 })}
          </div>
          <div className="col-[1_/_3] row-[1_/_6] h-full w-full">
            {renderCollageSlot(1, 'relative overflow-hidden h-full w-full', { zIndex: 10 })}
          </div>
          
          {/* COLUMN 5-8 — Center coverage */}
          <div className="col-[5_/_9] row-[1_/_6] h-full w-full">
            {renderCollageSlot(2, 'relative overflow-hidden h-full w-full', { zIndex: 15 })}
          </div>
          <div className="col-[5_/_9] row-[5_/_8] h-full w-full">
            {renderCollageSlot(3, 'relative overflow-hidden h-full w-full', { zIndex: 20 })}
          </div>
          <div className="col-[5_/_9] row-[7_/_11] h-full w-full">
            {renderCollageSlot(4, 'relative overflow-hidden h-full w-full', { zIndex: 25 })}
          </div>
          
          {/* COLUMN 9-12 — Right side, full coverage */}
          <div className="col-[11_/_13] row-[1_/_11] h-full w-full">
            {renderCollageSlot(5, 'relative overflow-hidden h-full w-full', { zIndex: 8 })}
          </div>
          <div className="col-[9_/_12] row-[1_/_6] h-full w-full">
            {renderCollageSlot(6, 'relative overflow-hidden h-full w-full', { zIndex: 12 })}
          </div>
          <div className="col-[9_/_12] row-[5_/_8] h-full w-full">
            {renderCollageSlot(7, 'relative overflow-hidden h-full w-full', { zIndex: 18 })}
          </div>
          <div className="col-[9_/_12] row-[7_/_11] h-full w-full">
            {renderCollageSlot(8, 'relative overflow-hidden h-full w-full', { zIndex: 22 })}
          </div>
          <div className="col-[9_/_13] row-[1_/_4] h-full w-full">
            {renderCollageSlot(9, 'relative overflow-hidden h-full w-full', { zIndex: 28 })}
          </div>
          
          {/* FILLER SLOTS (10) */}
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
        
        {/* Light gradient overlay for title readability */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/20 via-black/10 to-black/25" />
        
        {/* Title overlay */}
        <div className="relative z-30 h-screen flex flex-col items-center justify-center px-8 md:px-12">
          <div className="flex flex-col items-center -mt-12">
            <div 
              className="flex flex-col items-start mb-4"
              style={{ transform: `translateY(${titleOffset}px)` }}
            >
              <span 
                className="text-[1.8rem] md:text-[2.5rem] font-black tracking-[-0.01em] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent"
              >
                SurfHub
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-[-0.08em] text-white leading-none">
                Guadeloupe
              </h1>
            </div>
            <p 
              className="text-base md:text-lg lg:text-xl text-white/90 max-w-md mx-auto mb-6 text-center px-8 md:px-12 font-medium drop-shadow-lg"
              style={{ transform: `translateY(${titleOffset * 0.7}px)` }}
            >
              Surfing is one of the magical treasures this world has to offer. Dive in and be a part of it.
            </p>
          </div>
          
          {/* Scroll down cue */}
          <button 
            onClick={() => {
              mapRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 group flex flex-col items-center gap-3 text-white/40 hover:text-white/70 transition-colors"
          >
            <span className="text-xs tracking-wider text-white/80 font-medium drop-shadow-lg transition-colors">
              Scroll down to explore the Guadeloupe surf scene
            </span>
            <svg
              className="h-8 w-8 text-white/40 group-hover:text-white/70 animate-bounce transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAP — Full-viewport section, the main attraction
          ═══════════════════════════════════════════════════════════════ */}
      <section 
        ref={mapRef}
        id="surf-map-section" 
        className="relative h-screen overflow-hidden snap-start bg-background"
      >
        {/* Map label floating top-left */}
        <div className="absolute top-4 left-4 z-40 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
            <MapPin className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] uppercase tracking-widest text-white/70 font-medium">Explore Guadeloupe</span>
          </div>
        </div>
        
        {/* Scroll-down arrow to feeds */}
        <button 
          onClick={() => {
            feedRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 group flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
        >
          <span className="text-[10px] tracking-wider text-white/50 font-medium drop-shadow-lg">
            Discover content
          </span>
          <svg
            className="h-6 w-6 text-white/30 group-hover:text-white/60 animate-bounce transition-colors"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div className="h-full w-full pt-0">
          <SurfMapSection />
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════
          SEARCH + TOGGLE
          ═══════════════════════════════════════════════════════════════ */}
      <section ref={feedRef} id="feed-section" className="py-8 px-4 md:px-8 lg:px-12 bg-background snap-start">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* Search bar */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search surf videos..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted/60 border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:bg-muted/80 focus:ring-2 focus:ring-teal-400/50 focus:ring-inset"
            />
          </div>

          {/* Feed toggle pills */}
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
      <section className="min-h-screen pb-20 px-4 md:px-8 lg:px-12 bg-background snap-start">
        <div className="max-w-6xl mx-auto">
          {activeFeed === 'feelgood' && <GoodVibesFeed />}
          {activeFeed === 'local' && <GuadeloupeFeed />}
          {activeFeed === 'global' && <GlobalSurfFeed />}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-xs text-muted-foreground opacity-40">
            Curated daily • More coming soon
          </p>
        </div>
      </section>
    </div>
  );
}
