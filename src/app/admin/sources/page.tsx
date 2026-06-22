'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/admin-header';
import { Plus, Trash2, Youtube, Instagram, Globe, Hash } from 'lucide-react';

interface ContentSource {
  id: string;
  type: 'youtube-channel' | 'instagram-account' | 'tiktok-account' | 'rss-feed' | 'hashtag';
  label: string;
  url: string;
  feed: 'feelgood' | 'local' | 'global';
  active: boolean;
  addedAt: string;
  lastFetchedAt?: string;
}

const SOURCE_ICONS = {
  'youtube-channel': Youtube,
  'instagram-account': Instagram,
  'tiktok-account': Globe,
  'rss-feed': Hash,
  'hashtag': Hash,
} as const;

const SOURCE_LABELS = {
  'youtube-channel': 'YouTube Channel',
  'instagram-account': 'Instagram Account',
  'tiktok-account': 'TikTok Account',
  'rss-feed': 'RSS Feed',
  'hashtag': 'Hashtag / Search Term',
} as const;

export default function SourcesPage() {
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'youtube-channel' as ContentSource['type'],
    label: '',
    url: '',
    feed: 'feelgood' as ContentSource['feed'],
  });

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      setSources(data.sources || []);
    } catch (e) {
      console.error('Failed to fetch sources:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSources(); }, []);

  const addSource = async () => {
    if (!form.label || !form.url) return;
    try {
      await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ type: 'youtube-channel', label: '', url: '', feed: 'feelgood' });
      setShowForm(false);
      await fetchSources();
    } catch (e) {
      console.error('Failed to add source:', e);
    }
  };

  const removeSource = async (id: string) => {
    try {
      await fetch(`/api/sources?id=${id}`, { method: 'DELETE' });
      await fetchSources();
    } catch (e) {
      console.error('Failed to remove source:', e);
    }
  };

  const feedColors = {
    feelgood: 'text-emerald-500 bg-emerald-500/10',
    local: 'text-cyan-500 bg-cyan-500/10',
    global: 'text-purple-500 bg-purple-500/10',
  };

  return (
    <div className="min-h-screen bg-background px-8 pt-24 pb-8">
      <div className="max-w-4xl mx-auto">
        <AdminHeader />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Content Sources</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage channels, accounts, and search terms that feed content into SurfHub.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="gradient" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Source
          </Button>
        </div>

        {/* Add form */}
        {showForm && (
          <Card className="p-6 mb-6 border-2 border-cyan-400/20">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({...form, type: e.target.value as ContentSource['type']})}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  <option value="youtube-channel">YouTube Channel</option>
                  <option value="instagram-account">Instagram Account</option>
                  <option value="tiktok-account">TikTok Account</option>
                  <option value="rss-feed">RSS Feed</option>
                  <option value="hashtag">Hashtag / Search Term</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Feed</label>
                <select
                  value={form.feed}
                  onChange={(e) => setForm({...form, feed: e.target.value as ContentSource['feed']})}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                >
                  <option value="feelgood">Feel Good</option>
                  <option value="local">Local (Guadeloupe)</option>
                  <option value="global">Global</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Label</label>
                <input
                  type="text"
                  placeholder="e.g. WSL, GwadaSurf, #surfing"
                  value={form.label}
                  onChange={(e) => setForm({...form, label: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">URL / Handle</label>
                <input
                  type="text"
                  placeholder="e.g. https://youtube.com/@wsl or @gwadasurf"
                  value={form.url}
                  onChange={(e) => setForm({...form, url: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="gradient" size="sm" onClick={addSource}>Add Source</Button>
            </div>
          </Card>
        )}

        {/* Sources list */}
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading sources...</p>
        ) : sources.length === 0 ? (
          <Card className="p-12 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No sources yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add YouTube channels, Instagram accounts, or hashtags to start building your content pipeline.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {sources.map((source) => {
              const Icon = SOURCE_ICONS[source.type];
              return (
                <Card key={source.id} className="p-4 flex items-center gap-4 hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm truncate">{source.label}</span>
                      <span className="text-[10px] text-muted-foreground/60 px-1.5 py-0.5 rounded bg-muted">
                        {SOURCE_LABELS[source.type]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{source.url}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${feedColors[source.feed]}`}>
                      {source.feed}
                    </span>
                    <button
                      onClick={() => removeSource(source.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
