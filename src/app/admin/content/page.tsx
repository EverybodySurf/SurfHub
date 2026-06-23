'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReviewItem {
  id: string;
  title: string;
  content: string;
  image: string;
  feed: string;
  platform: string;
  source: string;
  timestamp: string;
  hidden: boolean;
}

interface Stats {
  total: number;
  visible: number;
  hidden: number;
  bySource: Record<string, number>;
}

export default function ContentReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'instagram' | 'twitter' | 'curated'>('all');
  const [feedFilter, setFeedFilter] = useState<string>('all');

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/content?_t=' + Date.now());
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to fetch content:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, []);

  const toggleHide = async (itemId: string, currentlyHidden: boolean) => {
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: currentlyHidden ? 'unhide' : 'hide', itemId }),
    });
    await fetchContent();
  };

  const moveFeed = async (itemId: string, newFeed: string) => {
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'move-feed', itemId, newFeed }),
    });
    await fetchContent();
  };

  const filteredItems = items.filter(i => {
    if (filter !== 'all' && i.source !== filter) return false;
    if (feedFilter !== 'all' && i.feed !== feedFilter) return false;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen bg-background p-8">
      <p className="text-muted-foreground">Loading content...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-8 pt-24 pb-8">
      <div className="max-w-7xl mx-auto">
        <AdminHeader />
        <h1 className="text-2xl font-bold text-foreground mb-2">Content Review</h1>
        <p className="text-muted-foreground mb-4">
          Review scraped content across all platforms. Hide what doesn't fit, move between feeds.
        </p>

        {/* Stats */}
        {stats && (
          <div className="flex gap-4 text-sm mb-6">
            <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary">
              Total: {stats.total}
            </div>
            <div className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500">
              Visible: {stats.visible}
            </div>
            <div className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500">
              Hidden: {stats.hidden}
            </div>
            <div className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              IG: {stats.bySource.instagram || 0}
            </div>
            <div className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500">
              X: {stats.bySource.twitter || 0}
            </div>
            <div className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500">
              Curated: {stats.bySource.curated || 0}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {(['all', 'instagram', 'twitter', 'curated'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f === 'all' ? 'All' : f === 'instagram' ? '📸 Instagram' : f === 'twitter' ? '🐦 X' : '⭐ Curated'}
            </button>
          ))}
          <div className="w-px bg-border mx-2" />
          {(['all', 'feelgood', 'local', 'global']).map((f) => (
            <button key={f} onClick={() => setFeedFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                feedFilter === f
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f === 'all' ? 'All feeds' : f}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="grid gap-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className={`p-4 border ${item.hidden ? 'opacity-40 border-dashed' : ''}`}>
              <div className="flex gap-4 items-start">
                {/* Thumbnail */}
                {item.image && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img src={item.image} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      item.source === 'instagram' ? 'bg-cyan-500/10 text-cyan-500' :
                      item.source === 'twitter' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {item.source}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{item.feed}</span>
                    {item.hidden && <span className="text-[10px] text-red-500">hidden</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.content}</p>
                  {item.timestamp && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button
                    onClick={() => toggleHide(item.id, item.hidden)}
                    variant={item.hidden ? 'outline' : 'secondary'}
                    size="sm"
                    className="text-xs h-7"
                  >
                    {item.hidden ? 'Show' : 'Hide'}
                  </Button>
                  <select
                    value={item.feed}
                    onChange={(e) => moveFeed(item.id, e.target.value)}
                    className="text-xs px-2 py-1 rounded bg-background border border-border"
                  >
                    <option value="feelgood">FeelGood</option>
                    <option value="local">Local</option>
                    <option value="global">Global</option>
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No items match the current filters</p>
          </Card>
        )}
      </div>
    </div>
  );
}
