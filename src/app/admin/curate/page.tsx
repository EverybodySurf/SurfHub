'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PendingItem, FeedType, scoreContent } from '@/lib/curate/criteria';

// Feed options for form
const FEED_OPTIONS: FeedType[] = ['feelgood', 'local', 'global'];
const TYPE_OPTIONS = ['photo', 'video', 'reel', 'quote', 'spot', 'event', 'news', 'tweet'];
const SOURCE_OPTIONS = ['instagram', 'youtube', 'tiktok', 'twitter'];

interface QueueResponse {
  pending: PendingItem[];
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function CuratePage() {
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [formData, setFormData] = useState({
    source: 'instagram',
    url: '',
    title: '',
    content: '',
    creator: '',
    location: '',
    feed: 'local',
    type: 'reel',
    image: '',
    videoUrl: '',
    videoType: '',
    originalPublishedAt: '',
  });
  
  // Auto-fetch metadata from URL
  const autoFetchMeta = async (url: string) => {
    if (!url) return;
    setFetchingMeta(true);
    try {
      const res = await fetch(`/api/curate/fetch-meta?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.platform) {
        setFormData(prev => ({
          ...prev,
          source: data.platform,
          title: data.title || prev.title,
          image: data.image || prev.image,
          creator: data.creator || prev.creator,
          videoUrl: data.videoUrl || prev.videoUrl,
          type: data.platform === 'youtube' ? 'video' : data.platform === 'instagram' ? 'photo' : prev.type,
          videoType: data.platform === 'youtube' ? 'youtube' : data.platform === 'instagram' ? 'instagram' : prev.videoType,
        }));
      }
    } catch {
      // Auto-fetch failed silently
    } finally {
      setFetchingMeta(false);
    }
  };

  // Fetch pending items
  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/curate/queue?_t=' + Date.now());
      const data = await res.json();
      setQueue(data);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchQueue();
  }, []);
  
  // Approve item
  const approveItem = async (itemId: string) => {
    setProcessingId(itemId);
    try {
      await fetch('/api/curate/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, reviewer: 'admin' }),
      });
      await fetchQueue(); // Refresh queue
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  // Reject item
  const rejectItem = async (itemId: string, reason?: string) => {
    setProcessingId(itemId);
    try {
      await fetch('/api/curate/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, reason: reason || 'Not suitable', reviewer: 'admin' }),
      });
      await fetchQueue(); // Refresh queue
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  // Submit new item
  const submitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Determine videoType from URL
      let videoType: 'youtube' | 'instagram' | 'tiktok' | undefined;
      const url = formData.videoUrl || formData.url;
      if (url.includes('youtube') || url.includes('youtu.be')) videoType = 'youtube';
      else if (url.includes('instagram')) videoType = 'instagram';
      else if (url.includes('tiktok')) videoType = 'tiktok';
      
      // Calculate auto score
      const pendingItem = {
        title: formData.title,
        content: formData.content,
        source: formData.source,
        creator: formData.creator,
        location: formData.location,
      };
      const autoScore = scoreContent(pendingItem as any, formData.feed as FeedType);
      
      await fetch('/api/curate/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: formData.source,
          url: formData.url,
          title: formData.title,
          content: formData.content,
          creator: formData.creator,
          location: formData.location,
          feed: formData.feed,
          type: formData.type,
          image: formData.image,
          videoUrl: formData.videoUrl || formData.url,
          videoType: videoType,
          originalPublishedAt: formData.originalPublishedAt || undefined,
          autoScore,
        }),
      });
      
      // Reset form and refresh queue
      setFormData({
        source: 'instagram',
        url: '',
        title: '',
        content: '',
        creator: '',
        location: '',
        feed: 'local',
        type: 'reel',
        image: '',
        videoUrl: '',
        videoType: '',
        originalPublishedAt: '',
      });
      setShowForm(false);
      await fetchQueue();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Loading queue...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background px-8 pt-24 pb-8">
      <div className="max-w-6xl mx-auto">
        <AdminHeader />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Content Curation
        </h1>
        <p className="text-muted-foreground mb-4">
          Review and approve content for SurfHub feeds
        </p>
        
        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary">
            Pending: {queue?.counts.pending || 0}
          </div>
          <div className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500">
            Approved: {queue?.counts.approved || 0}
          </div>
          <div className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500">
            Rejected: {queue?.counts.rejected || 0}
          </div>
        </div>
      </div>
      
      {/* Pending Items */}
      <div className="max-w-6xl mx-auto">
        {queue?.pending.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No items pending review</p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Add items via the API or submit form
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {queue?.pending.map((item) => (
              <Card 
                key={item.id}
                className="p-6 border-border hover:border-primary/40 transition-colors"
              >
                <div className="flex gap-6">
                  {/* Image/Preview */}
                  {item.image && (
                    <div className="w-32 h-24 rounded overflow-hidden bg-muted">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">
                        {item.feed}
                      </span>
                      <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
                        {item.type}
                      </span>
                      <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
                        {item.source}
                      </span>
                      {item.videoUrl && (
                        <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-xs">
                          ▶ Video
                        </span>
                      )}
                    </div>
                    
                    {/* Score */}
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground">
                        Auto-score: {(item.autoScore * 100).toFixed(0)}%
                      </span>
                      <div className="w-16 h-1 bg-muted rounded mt-1">
                        <div 
                          className={`h-full rounded ${
                            item.autoScore > 0.7 ? 'bg-green-500' : 
                            item.autoScore > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.autoScore * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Title & Content */}
                    <h3 className="font-medium text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.content}
                    </p>
                    
                    {/* Meta */}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {item.creator && (
                        <span>Creator: {item.creator}</span>
                      )}
                      {item.location && (
                        <span>📍 {item.location}</span>
                      )}
                      <span>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* URL */}
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 block"
                    >
                      View source →
                    </a>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => approveItem(item.id)}
                      disabled={processingId === item.id}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      onClick={() => rejectItem(item.id)}
                      disabled={processingId === item.id}
                      variant="destructive"
                    >
                      ✕ Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Submit New Item */}
      <div className="max-w-6xl mx-auto mt-8">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="mb-4"
        >
          {showForm ? '✕ Close Form' : '+ Add New Content'}
        </Button>
        
        {showForm && (
          <Card className="p-6">
            <h2 className="text-lg font-medium text-foreground mb-4">
              Submit New Content
            </h2>
            
            <form onSubmit={submitItem} className="grid gap-4">
              {/* Row 1: Source, URL, Creator */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  >
                    {SOURCE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">URL *</label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      onBlur={(e) => autoFetchMeta(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... or Instagram/X URL"
                      className="w-full px-3 py-2 rounded bg-background border border-border text-foreground pr-8"
                    />
                    {fetchingMeta && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
                        ↻
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Creator</label>
                  <input
                    type="text"
                    value={formData.creator}
                    onChange={(e) => setFormData({...formData, creator: e.target.value})}
                    placeholder="@username"
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  />
                </div>
              </div>
              
              {/* Row 2: Title, Content */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Sunrise Session"
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Content *</label>
                  <input
                    type="text"
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Perfect glassy waves this morning..."
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  />
                </div>
              </div>
              
              {/* Row 3: Feed, Type, Location */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Feed *</label>
                  <select
                    value={formData.feed}
                    onChange={(e) => setFormData({...formData, feed: e.target.value})}
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  >
                    {FEED_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  >
                    {TYPE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Guadeloupe"
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  />
                </div>
              </div>
              
              {/* Row 4: Image, Video URL (optional) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Image URL{' '}
                    <span className="text-xs text-muted-foreground/60">(auto-filled from URL)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Video URL (optional, auto-detected)</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    placeholder="Same as URL if video content"
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  />
                </div>
              </div>
              
              {/* Row 5: Original publish date */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Original publish date{' '}
                    <span className="text-xs text-muted-foreground/60">(leave blank for today)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.originalPublishedAt}
                    onChange={(e) => setFormData({...formData, originalPublishedAt: e.target.value})}
                    className="w-full px-3 py-2 rounded bg-background border border-border text-foreground"
                  />
                </div>
              </div>
              
              {/* Submit button */}
              <div className="flex justify-end gap-4 mt-4">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {submitting ? 'Submitting...' : 'Add to Queue'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}