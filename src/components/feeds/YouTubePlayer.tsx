'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  thumbnail: string;
  isShort?: boolean;
}

export function YouTubePlayer({
  videoId,
  title,
  channelTitle,
  channelId,
  thumbnail,
  isShort = false,
}: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <Card
      className={cn(
        'relative overflow-hidden bg-card border-border hover:border-primary/40 transition-all duration-500 group min-h-[280px] flex flex-col',
        isShort && 'max-w-[280px] mx-auto'
      )}
    >
      {/* ─── Playing State ─── */}
      {playing ? (
        <>
          {/* Video embed */}
          <div
            className={cn(
              'relative w-full bg-black',
              isShort ? 'aspect-[9/16]' : 'aspect-video'
            )}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />

            {/* Close button */}
            <button
              onClick={() => setPlaying(false)}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
              aria-label="Close video"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Channel name only — no actions */}
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {channelTitle.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {channelTitle}
            </span>
          </div>
        </>
      ) : (
        /* ─── Thumbnail State — no play overlay, just clean image ─── */
        <>
          {/* Clickable thumbnail */}
          <div
            className={cn(
              'relative w-full cursor-pointer',
              isShort ? 'aspect-[9/16]' : 'aspect-video'
            )}
            onClick={() => setPlaying(true)}
          >
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Gradient overlay for title readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Title overlay */}
            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
              <p className="text-sm text-white font-medium line-clamp-2 drop-shadow-lg">
                {title}
              </p>
            </div>
          </div>

          {/* Channel info below thumbnail */}
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {channelTitle.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {channelTitle}
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
