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
  status: 'pending' | 'approved' | 'auto';
}

interface Stats {
  total: number;
  pending: number;
  visible: number;
  hidden: number;
  bySource: Record<string, number>;
}

export default function ContentReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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

  const approveItem = async (itemId: string) => {
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', itemId }),
    });
    await fetchContent();
  };

  const rejectItem = async (itemId: string) => {
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', itemId }),
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
    if (filter === 'pending') return i.status === 'pending';
    if (filter === 'instagram') return i.source === 'instagram';
    if (filter === 'twitter') return i.source === 'twitter';
    if (filter === 'curated') return i.source === 'curated';
    if (filter === 'hidden') return i.hidden;
    return true; // 'all'
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
        <h1 className="text-2xl font-bold text-foreground mb-2">Content Manager</h1>
        <p className="text-muted-foreground mb-4">
          Review all content — pending approvals, scraped posts, and curated items. Hide, move, approve, or reject.
        </p>

        {/* Stats */}
        {stats && (
          <div className="flex flex-wrap gap-3 text-sm mb-6">
            <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium">
              {stats.total} total
            </div>
            {stats.pending > 0 && (
              <div className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500 font-medium animate-pulse">
                ⏳ {stats.pending} pending approval
              </div>
            )}
            <div className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500">
              {stats.visible} visible
            </div>
            <div className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500">
              {stats.hidden} hidden
            </div>
            <div className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-500">
              📸 {stats.bySource.instagram || 0} IG
            </div>
            <div className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500">
              🐦 {stats.bySource.twitter || 0} X
            </div>
            <div className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500">
              ⭐ {stats.bySource.curated || 0} curated
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'instagram', 'twitter', 'curated', 'hidden'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f === 'all' ? 'All' :
               f === 'pending' ? '⏳ Pending' :
               f === 'instagram' ? '📸 Instagram' :
               f === 'twitter' ? '🐦 X' :
               f === 'curated' ? '⭐ Curated' :
               '🙈 Hidden'}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="grid gap-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className={`p-4 border transition-opacity ${item.hidden ? 'opacity-40 border-dashed' : ''} ${item.status === 'pending' ? 'border-amber-500/30 ring-1 ring-amber-500/20' : ''}`}>
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
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {item.status === 'pending' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-500">
                        ⏳ PENDING
                      </span>
                    )}
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
                  {item.status === 'pending' ? (
                    <>
                      <Button onClick={() => approveItem(item.id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs h-7 px-3">
                        ✓ Approve
                      </Button>
                      <Button onClick={() => rejectItem(item.id)}
                        variant="destructive" size="sm" className="text-xs h-7">
                        ✕ Reject
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => toggleHide(item.id, item.hidden)}
                        variant={item.hidden ? 'outline' : 'secondary'} size="sm" className="text-xs h-7">
                        {item.hidden ? 'Show' : 'Hide'}
                      </Button>
                      <select value={item.feed} onChange={(e) => moveFeed(item.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded bg-background border border-border">
                        <option value="feelgood">FeelGood</option>
                        <option value="local">Local</option>
                        <option value="global">Global</option>
                      </select>
                    </>
                  )}
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
