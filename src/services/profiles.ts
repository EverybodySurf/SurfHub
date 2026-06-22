/**
 * profiles.ts — Profile service (mechanics)
 *
 * Stable CRUD helpers for the profiles table.
 * Policy (auth checks, business rules) stays in calling components/routes.
 */

import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  about: string | null;
  home_break: string | null;
  surf_level: 'beginner' | 'intermediate' | 'advanced' | 'pro' | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = Partial<Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'website' | 'about' | 'home_break' | 'surf_level'>>;

/**
 * Fetch a single profile by user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

/**
 * Create a profile for a newly signed-up user
 */
export async function createProfile(
  user: User,
  profile: ProfileUpdate
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    ...profile,
    updated_at: new Date().toISOString(),
  });
  return { error: error?.message };
}

/**
 * Upsert (create or update) a profile
 */
export async function upsertProfile(
  userId: string,
  profile: ProfileUpdate
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...profile,
    updated_at: new Date().toISOString(),
  });
  return { error: error?.message };
}

/**
 * Search profiles by name or username (for directory feature)
 */
export async function searchProfiles(query: string): Promise<Profile[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(20);
  return data || [];
}
