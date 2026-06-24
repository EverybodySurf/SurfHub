'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface InstagramCardProps {
  title: string;
  content: string;
  image: string;
  source?: string;
  postUrl?: string;
  type?: string;
}

/** Extract Instagram shortcode from postUrl or id */
function extractShortcode(image: string, postUrl?: string): string | null {
  if (postUrl) {
    const match = postUrl.match(/\/(p|reel)\/([^/?#]+)/);
    return match ? match[2] : null;
  }
  // Fallback: try to extract from CDN URL
  return null;
}

const EMBED_BASE = 'https://www.instagram.com/p';

export function InstagramCard({ title, content, image, source, postUrl, type }: InstagramCardProps) {
  const [hover, setHover] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shortcode = extractShortcode(image, postUrl);


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
          <img
            src={imgError ? '' : image}
            alt={title || 'Instagram post'}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-500',
              hover ? 'scale-110 brightness-75' : 'scale-100'
            )}
            onError={() => setImgError(true)}
          />
          {imgError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-white/40 text-sm">📸 Instagram</span>
            </div>
          )}

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

          {/* Instagram + video indicator — bottom right */}
          <div className="absolute bottom-3 right-3 flex gap-1.5 items-center">
            {type === 'video' && (
              <span className="text-[10px] text-white/90 font-medium bg-black/60 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                ▶ Reel
              </span>
            )}
            <span className="text-[10px] text-white/50 font-medium">📸</span>
          </div>
        </div>
      </div>

      {/* Modal — full-viewport Instagram embed */}
      {showModal && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 flex flex-col items-center justify-center p-2"
          onClick={() => setShowModal(false)}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-20 right-6 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {shortcode ? (
              <>
                {/* Instagram embed — fills viewport height/width, caption overlays on bottom */}
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <iframe
                    src={`${EMBED_BASE}/${shortcode}/embed/`}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '100vw',
                      maxHeight: '100vh',
                      border: 'none',
                    }}
                    allow="autoplay; encrypted-media"
                    title={title}
                  />
                </div>
                {/* Caption overlay — slides over the bottom of content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                  <p className="text-sm text-white leading-tight drop-shadow-md">{content || title}</p>
                </div>
              </>
            ) : (
              <>
                <img
                  src={image}
                  alt={title || 'Instagram post'}
                  className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                  <p className="text-sm text-white leading-tight drop-shadow-md">{content || title}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
