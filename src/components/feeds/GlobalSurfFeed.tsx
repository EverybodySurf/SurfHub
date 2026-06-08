'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Globe, Trophy, Plane, Newspaper, Waves } from 'lucide-react';
import { useFeed, type FeedItem } from '@/hooks/use-feed';

interface GlobalItem {
  id: string;
  type: 'news' | 'competition' | 'travel' | 'culture' | 'gear';
  title: string;
  content: string;
  source?: string;
  url?: string;
  region?: string;
  image?: string;
}

// Fallback data — used when the API fails
const fallbackData: GlobalItem[] = [
  {
    id: 'fb-7',
    type: 'culture',
    title: 'Surfers vs. Orcas: Did They See That?! 🐋',
    content: 'Insane encounter — surfers paddle alongside orcas in the wild. A once-in-a-lifetime moment captured on video.',
    source: 'KingZworldTV',
    url: 'https://youtu.be/Qj2bybTl2rQ',
    image: 'https://i.ytimg.com/vi/Qj2bybTl2rQ/hqdefault.jpg',
  },
  {
    id: 'fb-1',
    type: 'competition',
    title: 'WSL Championship Tour',
    content: 'Latest results from the world tour.',
    source: 'World Surf League',
    url: 'https://worldsurfleague.com',
    image: 'https://images.pexels.com/photos/165992/pexels-photo-165992.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'fb-2',
    type: 'travel',
    title: 'Hidden Gems: Indonesia',
    content: 'Beyond Bali — discovering uncrowded perfection.',
    source: 'Surf Travel Mag',
    region: 'Asia-Pacific',
    image: 'https://images.pexels.com/photos/1006985/pexels-photo-1006985.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'fb-3',
    type: 'culture',
    title: 'The Art of Wave Riding',
    content: 'From traditional Hawaiian surfing to modern performance.',
    source: 'Surfer\'s Journal',
    image: 'https://images.pexels.com/photos/547114/pexels-photo-547114.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'fb-4',
    type: 'news',
    title: 'Ocean Conservation Wins',
    content: 'New marine protected areas announced.',
    source: 'Ocean News',
    image: 'https://images.pexels.com/photos/1458271/pexels-photo-1458271.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'fb-5',
    type: 'gear',
    title: 'Sustainable Board Tech',
    content: 'Eco-friendly materials reshaping board building.',
    source: 'Gear Review',
    image: 'https://images.pexels.com/photos/3648754/pexels-photo-3648754.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 'fb-6',
    type: 'travel',
    title: 'Europe\'s Best Winter Spots',
    content: 'Portugal, France, Spain deliver.',
    source: 'Euro Surf Guide',
    region: 'Europe',
    image: 'https://images.pexels.com/photos/1171515/pexels-photo-1171515.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];

// Map API FeedItem → GlobalItem
function mapApiToGlobalItem(api: FeedItem): GlobalItem {
  let type: GlobalItem['type'] = 'news';
  if (api.type === 'competition') type = 'competition';
  else if (api.type === 'travel') type = 'travel';
  else if (api.type === 'culture') type = 'culture';
  else if (api.type === 'gear') type = 'gear';

  return {
    id: api.id,
    type,
    title: api.title || '',
    content: api.content || '',
    source: api.source,
    url: api.videoUrl,
    region: api.location,
    image: api.image,
  };
}

/** Loading skeleton matching the 3-column card grid */
function LoadingSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl min-h-[160px] bg-card/60 border border-border/40 animate-pulse"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-900/40" />
            <div className="relative z-10 p-4 flex flex-col gap-2">
              <div className="h-3 w-12 rounded bg-muted/30" />
              <div className="h-4 w-3/4 rounded bg-muted/20" />
              <div className="h-3 w-full rounded bg-muted/20" />
              <div className="h-3 w-2/3 rounded bg-muted/20" />
              <div className="mt-auto h-3 w-16 rounded bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalCard({ item }: { item: GlobalItem }) {
  return (
    <Card className="relative overflow-hidden p-4 bg-card border-border hover:border-primary/40 transition-all duration-500 group min-h-[160px]">
      {/* Background image */}
      {item.image && (
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-500">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10">
        {/* Type indicator */}
        <div className="flex items-center gap-2 mb-2">
          {item.type === 'news' && <Newspaper className="h-3 w-3 text-primary" />}
          {item.type === 'competition' && <Trophy className="h-3 w-3 text-primary" />}
          {item.type === 'travel' && <Plane className="h-3 w-3 text-primary" />}
          {item.type === 'culture' && <Waves className="h-3 w-3 text-primary" />}
          {item.type === 'gear' && <Globe className="h-3 w-3 text-primary" />}
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {item.type}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-foreground font-medium text-sm mb-1">{item.title}</h3>
        <p className="text-muted-foreground text-xs leading-relaxed mb-2 line-clamp-2">
          {item.content}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-primary/60">{item.source}</span>
          {item.region && (
            <span className="text-muted-foreground">{item.region}</span>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Read →
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

export function GlobalSurfFeed() {
  const { items: apiItems, loading, error } = useFeed('global');

  // Graceful degradation: fallback to mock data when API fails
  const displayItems: GlobalItem[] = (apiItems.length > 0)
    ? apiItems.map(mapApiToGlobalItem)
    : (error ? fallbackData : []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const finalItems = displayItems.length > 0 ? displayItems : fallbackData;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {finalItems.map((item) => (
          <GlobalCard key={item.id} item={item} />
        ))}
      </div>

      {/* Feed source hint */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Aggregated from surf news, WSL, travel blogs, and culture publications
        </p>
      </div>
    </div>
  );
}
