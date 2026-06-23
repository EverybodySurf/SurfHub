'use client';

import Image from 'next/image';

interface InstagramCardProps {
  title: string;
  content: string;
  image: string;
  feed?: string;
  source?: string;
}

/** Feed badge colors */
const feedBadge: Record<string, string> = {
  feelgood: 'bg-pink-500/80 text-white',
  local: 'bg-cyan-500/80 text-white',
  global: 'bg-amber-500/80 text-white',
};

export function InstagramCard({ title, content, image, feed, source }: InstagramCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border/50 group col-span-1">
      {/* Full-bleed image */}
      <div className="relative aspect-[9/16] w-full">
        <Image
          src={image}
          alt={title || 'Instagram post'}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Feed badge — top left */}
        {feed && (
          <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${feedBadge[feed] || 'bg-muted/80'}`}>
            {feed}
          </span>
        )}

        {/* Creator — below feed badge */}
        {source && source !== '@instagram' && (
          <span className="absolute top-8 left-3 text-[10px] text-white/70 font-medium">
            {source}
          </span>
        )}

        {/* Caption — bottom left */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xs text-white/90 leading-tight line-clamp-3 drop-shadow-sm">
            {content || title}
          </p>
        </div>

        {/* Instagram logo indicator — bottom right */}
        <div className="absolute bottom-3 right-3">
          <span className="text-[10px] text-white/50 font-medium">📸</span>
        </div>
      </div>
    </div>
  );
}
