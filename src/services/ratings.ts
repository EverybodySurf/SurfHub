/**
 * ratings.ts — Amenity rating service (mechanics)
 *
 * Stable CRUD + aggregation helpers for the amenity_ratings table.
 * Policy (what happens on rate, verify logic) stays in calling components.
 */

import { createClient } from '@/utils/supabase/client';

export interface AmenityRating {
  id: number;
  amenity_id: string;
  user_id: string;
  rating: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RatingAggregate {
  average: number;
  count: number;
  verifiedCount: number;
  userRating?: number;
  userVerified?: boolean;
}

/**
 * Get aggregate rating for a single amenity
 */
export async function getRatingAggregate(
  amenityId: string,
  userId?: string | null
): Promise<RatingAggregate> {
  const supabase = createClient();

  // Fetch all ratings for this amenity
  const { data: ratings } = await supabase
    .from('amenity_ratings')
    .select('*')
    .eq('amenity_id', amenityId);

  if (!ratings || ratings.length === 0) {
    // Check if current user has rated
    if (userId) {
      const { data: userRating } = await supabase
        .from('amenity_ratings')
        .select('*')
        .eq('amenity_id', amenityId)
        .eq('user_id', userId)
        .single();
      return {
        average: 0,
        count: 0,
        verifiedCount: 0,
        userRating: userRating?.rating,
        userVerified: userRating?.verified,
      };
    }
    return { average: 0, count: 0, verifiedCount: 0 };
  }

  const average = ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
  const verifiedCount = ratings.filter(r => r.verified).length;

  let userRating: number | undefined;
  let userVerified: boolean | undefined;
  if (userId) {
    const mine = ratings.find(r => r.user_id === userId);
    if (mine) {
      userRating = mine.rating;
      userVerified = mine.verified;
    }
  }

  return { average, count: ratings.length, verifiedCount, userRating, userVerified };
}

/**
 * Rate an amenity (insert or update your rating)
 */
export async function rateAmenity(
  amenityId: string,
  userId: string,
  rating: number
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('amenity_ratings').upsert(
    {
      amenity_id: amenityId,
      user_id: userId,
      rating,
    },
    { onConflict: 'amenity_id, user_id' }
  );
  return { error: error?.message };
}

/**
 * Toggle verified status for your rating
 */
export async function toggleVerified(
  amenityId: string,
  userId: string,
  currentVerified: boolean
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('amenity_ratings').upsert(
    {
      amenity_id: amenityId,
      user_id: userId,
      verified: !currentVerified,
    },
    { onConflict: 'amenity_id, user_id' }
  );
  return { error: error?.message };
}

/**
 * Delete your rating for an amenity
 */
export async function deleteRating(
  amenityId: string,
  userId: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('amenity_ratings')
    .delete()
    .eq('amenity_id', amenityId)
    .eq('user_id', userId);
  return { error: error?.message };
}
