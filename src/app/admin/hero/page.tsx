'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HeroImage {
  id: string;
  source: 'unsplash' | 'pexels';
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait' | 'square';
  photographerName: string;
  photographerUsername?: string;
  photographerProfileUrl?: string;
  photoUrl?: string;
  altDescription?: string;
  addedAt: string;
}

interface HeroPoolResponse {
  success: boolean;
  images: HeroImage[];
  total: number;
  lastFetch: string | null;
  stats: {
    totalAdded: number;
    totalRemoved: number;
    sources: { unsplash: number; pexels: number };
  };
}

export default function HeroCuratePage() {
  const [pool, setPool] = useState<HeroPoolResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showRemoved, setShowRemoved] = useState(false);

  const fetchPool = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/hero/fetch');
      const data = await res.json();
      setPool(data);
    } catch (error) {
      console.error('Failed to fetch hero pool:', error);
    }
    setIsLoading(false);
  };

  const fetchNewImages = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/hero/fetch', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPool();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to fetch new images:', error);
    }
    setIsFetching(false);
  };

  const removeImage = async (imageId: string) => {
    const reason = prompt('Reason for removal? (optional, helps us learn criteria)');
    setRemovingId(imageId);
    try {
      const res = await fetch('/api/hero/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPool();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to remove image:', error);
    }
    setRemovingId(null);
  };

  useEffect(() => {
    fetchPool();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading hero pool...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hero Image Pool</h1>
          <p className="text-muted-foreground">
            Curate surfing photography for the hero collage. Photos from Unsplash & Pexels.
          </p>
        </div>

        {/* Stats & Actions */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-semibold">{pool?.total || 0}</span> approved images
              </p>
              <p className="text-xs text-muted-foreground">
                Last fetch: {pool?.lastFetch ? new Date(pool.lastFetch).toLocaleString() : 'Never'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Removed: {pool?.stats.totalRemoved || 0} | Unsplash: {pool?.stats.sources.unsplash || 0} | Pexels: {pool?.stats.sources.pexels || 0}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchNewImages} disabled={isFetching}>
                {isFetching ? 'Fetching...' : 'Fetch New Photos'}
              </Button>
              <Button variant="outline" onClick={() => setShowRemoved(!showRemoved)}>
                {showRemoved ? 'Hide Removed Log' : 'View Removed Log'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Note about API keys */}
        {pool?.total === 0 && (
          <Card className="p-4 mb-4 border-yellow-500/50 bg-yellow-500/10">
            <p className="text-sm text-yellow-200">
              ⚠️ No images loaded. Make sure <code>UNSPLASH_ACCESS_KEY</code> and <code>PEXELS_API_KEY</code> are set in <code>.env.local</code>
            </p>
          </Card>
        )}

        {/* Image Grid */}
        {!showRemoved && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pool?.images.map((image) => (
              <Card key={image.id} className="relative overflow-hidden group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={image.thumbnailUrl}
                    alt={image.altDescription || 'Surfing photo'}
                    fill
                    className="object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                    <p className="text-xs text-white/80 text-center mb-1">
                      {image.altDescription}
                    </p>
                    <p className="text-xs text-white/60">
                      📷 {image.photographerName}
                    </p>
                    <p className="text-xs text-white/40">
                      {image.orientation} • {image.width}×{image.height}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeImage(image.id)}
                      disabled={removingId === image.id}
                    >
                      {removingId === image.id ? 'Removing...' : 'Remove'}
                    </Button>
                  </div>
                </div>
                {/* Source badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 text-xs text-white/70">
                  {image.source}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Removed Log */}
        {showRemoved && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Removed Images Log</h2>
            <p className="text-sm text-muted-foreground mb-4">
              These images were removed from the pool. Helps us learn criteria.
            </p>
            <div className="space-y-2">
              {pool?.images.filter(i => i.status === 'removed').length === 0 && (
                <p className="text-muted-foreground">No removed images yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}