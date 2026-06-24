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

      {/* Modal — no embed for photos (show our own image + caption overlay), embed only for videos */}
      {showModal && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-20 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full h-full max-w-[600px] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            {shortcode ? (
              <>
                {/* Instagram embed — scaled & clipped to show only media (hide header/buttons) */}
                <div className="w-full flex items-center justify-center overflow-hidden relative" style={{ height: '85vh' }}>
                  {/* The iframe is oversized, then scaled down. Chrome gets pushed outside the clip area */}
                  <div className="absolute" style={{
                    width: '200%',
                    height: '200%',
                    top: '-25%',
                    left: '-50%',
                    transform: 'scale(0.55)',
                    transformOrigin: 'center center',
                  }}>
                    <iframe
                      src={`${EMBED_BASE}/${shortcode}/embed/`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        overflow: 'hidden',
                      }}
                      allow="autoplay; encrypted-media"
                      title={title}
                    />
                  </div>
                </div>
                {/* Caption overlay — bottom of modal */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
                  <p className="text-sm text-white leading-tight drop-shadow-md">{content || title}</p>
                </div>
              </>
            ) : (
              <>
                <img
                  src={image}
                  alt={title || 'Instagram post'}
                  className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
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
