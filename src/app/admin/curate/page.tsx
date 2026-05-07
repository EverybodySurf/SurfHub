'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PendingItem } from '@/lib/curate/criteria';

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
  
  // Fetch pending items
  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/curate/queue');
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Loading queue...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
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
      
      {/* Submit New Item (placeholder) */}
      <div className="max-w-6xl mx-auto mt-8">
        <Card className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Submit New Content
          </h2>
          <p className="text-sm text-muted-foreground">
            Use the API to submit items programmatically, or add items directly to 
            <code className="px-1 py-0.5 rounded bg-muted">data/queue.json</code>
          </p>
          <div className="mt-4 text-xs text-muted-foreground/60">
            POST to /api/curate/queue with: source, url, title, content, feed, type, creator, location, image, videoUrl, videoType
          </div>
        </Card>
      </div>
    </div>
  );
}