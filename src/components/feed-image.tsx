'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FeedImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

/**
 * Feed image with fallback chain: primary → fallback → placeholder.
 *
 * Mechanic — used by all feed components. No domain policy here.
 */
const FALLBACK_PLACEHOLDER = '/placeholder.svg';
const UNSPLASH_FALLBACK = 'https://images.unsplash.com/photo-1507525422833-0484b852f5be?w=400&auto=format';

export function FeedImage({ src, alt, fallback, className }: FeedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [imgFallback, setImgFallback] = useState<string>(fallback ?? UNSPLASH_FALLBACK);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={() => {
        // Try fallback, then placeholder
        if (imgSrc !== imgFallback) {
          setImgSrc(imgFallback);
        } else if (imgSrc !== FALLBACK_PLACEHOLDER) {
          setImgSrc(FALLBACK_PLACEHOLDER);
        }
      }}
      unoptimized
    />
  );
}
