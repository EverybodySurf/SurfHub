'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'surfhub-amenity-ratings';

interface RatingData {
  ratings: number[];     // individual ratings 1-5
  verified: boolean;     // user verification
  verifiedCount: number; // total verifications
}

interface Props {
  amenityId: string;
  amenityName: string;
}

export function AmenityRating({ amenityId, amenityName }: Props) {
  const [data, setData] = useState<RatingData>({ ratings: [], verified: false, verifiedCount: 0 });
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userVerified, setUserVerified] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        if (all[amenityId]) {
          setData(all[amenityId]);
        }
      }
    } catch {}
  }, [amenityId]);

  // Save to localStorage
  const save = useCallback((newData: RatingData) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const all = stored ? JSON.parse(stored) : {};
      all[amenityId] = newData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }, [amenityId]);

  const handleRate = (rating: number) => {
    const newRatings = [...data.ratings, rating];
    const newData = { ...data, ratings: newRatings };
    setData(newData);
    setUserRating(rating);
    save(newData);
  };

  const handleVerify = () => {
    const newVerified = !userVerified;
    const newData = {
      ...data,
      verified: newVerified,
      verifiedCount: data.verifiedCount + (newVerified ? 1 : -1),
    };
    setData(newData);
    setUserVerified(newVerified);
    save(newData);
  };

  const avgRating = data.ratings.length > 0
    ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length
    : 0;

  return (
    <div className="p-3 rounded-xl bg-muted/70">
      {/* Stars */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Rating</span>
        {data.ratings.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {data.ratings.length} vote{data.ratings.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = userRating > 0
            ? star <= (hoverRating || userRating)
            : star <= Math.round(avgRating);
          return (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110 active:scale-95"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'h-4 w-4 transition-colors',
                  filled ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
                )}
              />
            </button>
          );
        })}
        {data.ratings.length > 0 && (
          <span className="text-xs font-medium ml-1">{avgRating.toFixed(1)}</span>
        )}
      </div>

      {/* Verification */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Still here?</span>
        <div className="flex items-center gap-2">
          {data.verifiedCount > 0 && (
            <span className="text-[10px] text-muted-foreground">{data.verifiedCount} confirmed</span>
          )}
          <button
            onClick={handleVerify}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all',
              userVerified
                ? 'bg-green-500/10 text-green-600 border border-green-300/50'
                : 'bg-muted-foreground/5 text-muted-foreground/60 border border-transparent hover:border-green-300/30 hover:text-green-600/60'
            )}
          >
            <ThumbsUp className={cn('h-3 w-3', userVerified && 'fill-green-500')} />
            {userVerified ? 'Verified' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}
