'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { VideoModal } from './VideoModal';

// Card import removed — thumbnail is standalone rounded, channel info below

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  thumbnail: string;
  isShort?: boolean;
}

/**
 * Check if a thumbnail image is portrait (short) by measuring its aspect ratio.
 * YouTube Shorts thumbnails are ~9:16, regular videos are ~16:9.
 */
function isPortraitThumbnail(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img.naturalHeight > img.naturalWidth);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * YouTube video card — clean thumbnail + channel info below, like YouTube.
 *
 * - **Hover**: after a brief delay, loads & plays the video muted
 * - **Click**: opens full-screen modal with sound
 */
export function YouTubePlayer({
  videoId,
  title,
  thumbnail,
  isShort: propIsShort,
}: YouTubePlayerProps) {
  const [hoverPlaying, setHoverPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isShort, setIsShort] = useState(propIsShort ?? false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount, check thumbnail aspect ratio if the prop didn't already flag it
  if (!propIsShort && !hasInteracted && typeof window !== 'undefined') {
    isPortraitThumbnail(thumbnail).then(setIsShort);
  }

  const clearTimer = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimer();
    hoverTimer.current = setTimeout(() => {
      setHoverPlaying(true);
      setHasInteracted(true);
    }, 300);
  }, [clearTimer]);

  const handleMouseLeave = useCallback(() => {
    clearTimer();
    setHoverPlaying(false);
  }, [clearTimer]);

  const handleClick = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <>
      <div
        className={cn('group cursor-pointer', isShort ? 'col-span-1' : 'col-span-3')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* ─── Video / Thumbnail — natural ratio container ─── */}
        {/*
          4-column grid: landscape col-span-3 (16:9), short col-span-1 (9:16).
          Natural ratios kept — heights are within ~5% of each other.
          object-cover handles any minor overflow.
        */}
        <div
          className={cn(
            'relative w-full bg-black rounded-xl overflow-hidden',
            isShort ? 'aspect-[9/16]' : 'aspect-video',
            'ring-1 ring-border/40 group-hover:ring-primary/40 transition-all duration-300'
          )}
        >
          {hoverPlaying ? (
            <>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${soundEnabled ? '0' : '1'}&controls=0&modbranding=1&rel=0&showinfo=0&playsinline=1`}
                className="absolute inset-0 w-full h-full pointer-events-none"
                allow="autoplay; encrypted-media"
                title={title}
              />
              {/* Sound toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); setSoundEnabled(!soundEnabled); }}
                className="absolute bottom-2 right-2 z-10 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors pointer-events-auto"
                aria-label={soundEnabled ? 'Mute' : 'Unmute'}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {soundEnabled ? (
                    <>
                      <path d="M11 5 6 9H2v6h4l5 4V5z" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </>
                  ) : (
                    <>
                      <path d="M11 5 6 9H2v6h4l5 4V5z" />
                      <path d="M22 9l-6 6M16 9l6 6" />
                    </>
                  )}
                </svg>
              </button>
            </>
          ) : (
            <>
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Gradient overlay for title readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Title overlay */}
              <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                <p className="text-sm text-white font-medium line-clamp-2 drop-shadow-lg">
                  {title}
                </p>
              </div>
            </>
          )}
        </div>

      </div>

      {/* ─── Full-screen modal ─── */}
      {showModal && (
        <VideoModal
          videoId={videoId}
          title={title}
          isShort={isShort}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
