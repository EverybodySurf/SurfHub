'use client';

import { useState, useEffect } from 'react';

export interface FeedItem {
  id: string;
  feed: string;
  size: string;
  type: string;
  title: string;
  content: string;
  source?: string;
  location?: string;
  image?: string;
  videoUrl?: string;
  videoType?: 'youtube' | 'instagram' | 'tiktok';
  timestamp?: string;
  hasValidTimestamp?: boolean;
  platform?: string;
  channelId?: string;
  channelTitle?: string;
  isShort?: boolean;
}

interface UseFeedResult {
  items: FeedItem[];
  loading: boolean;
  error: string | null;
  isReal: boolean;
}

/**
 * Fetch content from the unified feed API endpoint.
 * Returns items, loading state, error, and whether data is from real scrapers.
 */
export function useFeed(feedType: 'feelgood' | 'local' | 'global'): UseFeedResult {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReal, setIsReal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchFeed = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/feed?feed=${feedType}`);
        if (!res.ok) {
          throw new Error(`API responded with ${res.status}`);
        }
        const data = await res.json();

        if (cancelled) return;

        if (data.success && Array.isArray(data.items)) {
          setItems(data.items);
          setIsReal(data.real === true);
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : 'Unknown error fetching feed';
        console.warn(`[useFeed] ${feedType} fetch failed:`, message);
        setError(message);
        setItems([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFeed();

    return () => {
      cancelled = true;
    };
  }, [feedType]);

  return { items, loading, error, isReal };
}
