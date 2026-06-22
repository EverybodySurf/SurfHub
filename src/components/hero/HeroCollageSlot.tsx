'use client';

import Image from 'next/image';
import type { GridItem } from '@/data/hero-collage-data';
import { typeLabels } from '@/data/hero-collage-data';
import { addCropParams } from '@/lib/surf-map/image-utils';

interface Props {
  item?: GridItem;
  index: number;
  className: string;
  opacity: number;
  scale: number;
  isHovered: boolean;
  onHover: (index: number | null) => void;
  styleOverrides?: Record<string, string | number>;
}

/**
 * Renders a single slot in the hero collage grid.
 * Pure mechanics — receives item + layout, renders the card.
 * No business logic, no data fetching, no state.
 */
export function HeroCollageSlot({ item, index, className, opacity, scale, isHovered, onHover, styleOverrides = {} }: Props) {
  if (!item) return null;

  const croppedImage = item.image ? addCropParams(item.image, className) : null;

  const baseStyle = {
    opacity,
    zIndex: isHovered ? 50 : 10 + index,
    transform: `scale(${scale})`,
  };

  return (
    <div
      className={className}
      style={{ ...baseStyle, ...styleOverrides }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
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
}
