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
  const [fullScreen, setFullScreen] = useState(false);
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

      {/* Modal — edge-to-edge Instagram embed, fills viewport */}
      {showModal && (
        <div
          className="fixed inset-0 z-[2000] bg-black"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute top-6 right-6 z-10 flex gap-2">
            <button
              onClick={() => setFullScreen(!fullScreen)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={fullScreen ? 'Exit full screen' : 'Full screen'}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {fullScreen ? (
                  <>
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </>
                ) : (
                  <>
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </>
                )}
              </svg>
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center w-screen h-screen" onClick={e => e.stopPropagation()}>
            {shortcode ? (
              <>
                <div className={`w-full ${fullScreen ? 'h-screen' : 'max-w-[500px] h-screen'} flex items-center justify-center`}>
                  <iframe
                    src={`${EMBED_BASE}/${shortcode}/embed/`}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="autoplay; encrypted-media"
                    title={title}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-14 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                  <p className="text-sm text-white leading-tight drop-shadow-md">{content || title}</p>
                </div>
              </>
            ) : (
              <>
                <img
                  src={image}
                  alt={title || 'Instagram post'}
                  className="absolute inset-0 w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-14 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
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
