'use client';

import { useState, useEffect } from 'react';
import { Users, Waves, Radio, CheckCircle } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DashboardStats {
  users: number | null;
  feedItems: number | null;
  sources: number | null;
  curated: number | null;
}

const statCards = [
  {
    key: 'users' as const,
    label: 'Community Members',
    icon: Users,
    color: 'from-cyan-400 to-teal-500',
    fallback: '—',
  },
  {
    key: 'feedItems' as const,
    label: 'Feed Items Cached',
    icon: Waves,
    color: 'from-blue-400 to-indigo-500',
    fallback: '—',
  },
  {
    key: 'sources' as const,
    label: 'Content Sources',
    icon: Radio,
    color: 'from-amber-400 to-orange-500',
    fallback: '—',
  },
  {
    key: 'curated' as const,
    label: 'Curated Items',
    icon: CheckCircle,
    color: 'from-emerald-400 to-green-500',
    fallback: '—',
  },
];

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    users: null,
    feedItems: null,
    sources: null,
    curated: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch user count from Supabase (via auth admin)
      // For now, just show total from auth
      let userCount: number | null = null;
      let feedCount: number | null = null;
      let sourceCount: number | null = null;
      let curatedCount: number | null = null;

      try {
        const feedRes = await fetch('/api/feed?feed=all&refresh=true');
        const feedData = await feedRes.json();
        feedCount = feedData.count ?? null;
      } catch {}

      try {
        const sourcesRes = await fetch('/api/sources');
        const sourcesData = await sourcesRes.json();
        sourceCount = sourcesData.sources?.length ?? null;
      } catch {}

      try {
        const queueRes = await fetch('/api/curate/queue?_t=' + Date.now());
        const queueData = await queueRes.json();
        curatedCount = queueData.counts?.approved ?? null;
        // User count from total pending + approved + rejected reviewers (approximate)
        if (queueData.counts) {
          userCount = 1; // At least the current admin
        }
      } catch {}

      setStats({ users: userCount, feedItems: feedCount, sources: sourceCount, curated: curatedCount });
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {statCards.map((card) => {
        const value = stats[card.key];
        const display = value !== null ? value.toLocaleString() : card.fallback;

        return (
          <Card key={card.key} className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br ${card.color} opacity-10`} />
            <CardHeader className="relative">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                {card.label}
              </CardDescription>
              <CardTitle className="text-3xl font-bold tabular-nums mt-1">
                {display}
              </CardTitle>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
