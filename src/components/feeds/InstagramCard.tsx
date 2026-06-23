'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface InstagramCardProps {
  title: string;
  content: string;
  image: string;
  feed?: string;
  source?: string;
}

export function InstagramCard({ title, content, image, source }: InstagramCardProps) {
  const [hover, setHover] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimer();
    hoverTimer.current = setTimeout(() => setHover(true), 300);
  }, [clearTimer]);

  const handleMouseLeave = useCallback(() => {
    clearTimer();
    setHover(false);
  }, [clearTimer]);

  const handleClick = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <>
      <div
        className="relative overflow-hidden rounded-xl bg-card border border-border/50 group cursor-pointer col-span-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className="relative aspect-[9/16] w-full">
          <Image
            src={image}
            alt={title || 'Instagram post'}
            fill
            className={cn(
              'object-cover transition-all duration-500',
              hover ? 'scale-110 brightness-75' : 'scale-100'
            )}
            sizes="(max-width: 768px) 100vw, 33vw"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Creator — top left */}
          {source && source !== '@instagram' && (
            <span className="absolute top-3 left-3 text-xs text-white/70 font-medium">
              {source}
            </span>
          )}

          {/* Hover overlay — play button feel */}
          {hover && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="h-7 w-7 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Caption — bottom left */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className={cn(
              'text-xs text-white/90 leading-tight drop-shadow-sm transition-opacity duration-300',
              hover ? 'line-clamp-5 opacity-100' : 'line-clamp-2 opacity-80'
            )}>
              {content || title}
            </p>
          </div>

          {/* Instagram indicator — bottom right */}
          <div className="absolute bottom-3 right-3">
            <span className="text-[10px] text-white/50 font-medium">📸</span>
          </div>
        </div>
      </div>

      {/* Image modal — full-screen view */}
      {showModal && (
        <div
          className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-lg flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-3xl max-h-[90vh] m-8" onClick={e => e.stopPropagation()}>
            <Image
              src={image}
              alt={title || 'Instagram post'}
              width={1200}
              height={1600}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-white/80">
              <p className="text-sm">{content || title}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
