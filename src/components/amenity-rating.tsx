'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { getRatingAggregate, rateAmenity, toggleVerified } from '@/services/ratings';
import type { RatingAggregate } from '@/services/ratings';

interface Props {
  amenityId: string;
  amenityName: string;
}

export function AmenityRating({ amenityId, amenityName }: Props) {
  const supabase = createClient();
  const [data, setData] = useState<RatingAggregate>({
    average: 0, count: 0, verifiedCount: 0,
  });
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userVerified, setUserVerified] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data and get current user
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id || null;
      if (!mounted) return;
      setUserId(uid);

      const agg = await getRatingAggregate(amenityId, uid);
      if (!mounted) return;
      setData(agg);
      setUserRating(agg.userRating || 0);
      setUserVerified(agg.userVerified || false);
      setLoading(false);
    };

    load();

    // Subscribe to realtime changes for this amenity's ratings
    const channel = supabase
      .channel(`amenity-ratings-${amenityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'amenity_ratings',
          filter: `amenity_id=eq.${amenityId}`,
        },
        async () => {
          const agg = await getRatingAggregate(amenityId, userId);
          if (mounted) {
            setData(agg);
            setUserRating(agg.userRating || 0);
            setUserVerified(agg.userVerified || false);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [amenityId, supabase, userId]);

  const handleRate = useCallback(async (rating: number) => {
    if (!userId) return;
    setUserRating(rating);
    // Optimistic update
    setData(prev => ({
      ...prev,
      average: prev.count === 0
        ? rating
        : (prev.average * prev.count + rating) / (prev.count + 1),
      count: prev.count + 1,
      userRating: rating,
    }));
    await rateAmenity(amenityId, userId, rating);
  }, [amenityId, userId]);

  const handleVerify = useCallback(async () => {
    if (!userId) return;
    const newVerified = !userVerified;
    setUserVerified(newVerified);
    // Optimistic update
    setData(prev => ({
      ...prev,
      verifiedCount: prev.verifiedCount + (newVerified ? 1 : -1),
      userVerified: newVerified,
    }));
    await toggleVerified(amenityId, userId, userVerified);
  }, [amenityId, userId, userVerified]);

  if (loading) {
    return (
      <div className="p-3 rounded-xl bg-muted/70 animate-pulse">
        <div className="h-4 w-16 bg-muted-foreground/10 rounded mb-2" />
        <div className="h-6 w-32 bg-muted-foreground/10 rounded" />
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-muted/70">
      {/* Stars */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Rating</span>
        {data.count > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {data.count} vote{data.count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = userRating > 0
            ? star <= (hoverRating || userRating)
            : star <= Math.round(data.average);
          return (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={!userId}
              className="p-0.5 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
        {data.count > 0 && (
          <span className="text-xs font-medium ml-1">{data.average.toFixed(1)}</span>
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
            disabled={!userId}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
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
