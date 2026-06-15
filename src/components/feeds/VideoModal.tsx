'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoModalProps {
  videoId: string;
  title: string;
  isShort?: boolean;
  onClose: () => void;
}

/**
 * Full-screen video modal — opens on click, closes with Escape or close button.
 */
export function VideoModal({ videoId, title, isShort, onClose }: VideoModalProps) {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close video"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Video container */}
      <div
        className={cn(
          'relative w-full max-w-[95vw]',
          isShort ? 'max-w-[420px]' : 'max-w-[1200px]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn(isShort ? 'aspect-[9/16]' : 'aspect-video')}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            className="absolute inset-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
