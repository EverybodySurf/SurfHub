'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Play, Heart, Quote, Sparkles, Loader2 } from 'lucide-react';
import { useFeed, type FeedItem } from '@/hooks/use-feed';
import { YouTubePlayer } from '@/components/feeds/YouTubePlayer';
import { InstagramCard } from '@/components/feeds/InstagramCard';
import { extractYoutubeId, isYoutubeItem, toYoutubePlayerProps } from '@/lib/youtube-utils';

interface VibesItem {
  id: string;
  type: 'video' | 'photo' | 'quote' | 'story';
  title: string;
  content: string;
  source?: string;
  url?: string;
  image?: string;
}

// Fallback data — used when the API fails
const fallbackData: VibesItem[] = [
  {
    id: 'fb-1',
    type: 'quote',
    title: 'Wave Wisdom',
    content: '"The ocean heals everything. It whispers to those who listen, and carries those who surrender."',
    source: 'Surfer\'s Journal',
    image: 'https://images.pexels.com/photos/1458271/pexels-photo-1458271.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-2',
    type: 'video',
    title: 'Morning Glass',
    content: 'Watch the sunrise paint the waves gold. A reminder that every day is a gift.',
    source: 'YouTube',
    url: 'https://youtube.com',
    image: 'https://images.pexels.com/photos/165992/pexels-photo-165992.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-3',
    type: 'photo',
    title: 'Empty Lineup',
    content: 'Sometimes the best session is alone. Just you, the board, and the swell.',
    source: 'Instagram',
    image: 'https://images.pexels.com/photos/3648754/pexels-photo-3648754.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-4',
    type: 'quote',
    title: 'Ocean Philosophy',
    content: '"You can\'t stop the waves, but you can learn how to swim."',
    source: 'Jon Kabat-Zinn',
    image: 'https://images.pexels.com/photos/1006985/pexels-photo-1006985.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-5',
    type: 'story',
    title: 'The First Wave',
    content: 'Remember your first wave? That feeling never leaves. It just deepens with time.',
    source: 'Community Story',
    image: 'https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-6',
    type: 'photo',
    title: 'Golden Hour',
    content: 'When the light hits the water just right, everything makes sense.',
    image: 'https://images.pexels.com/photos/1171515/pexels-photo-1171515.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

// Map API FeedItem → VibesItem
function mapApiToVibesItem(api: FeedItem): VibesItem {
  let type: VibesItem['type'] = 'photo';
  if (api.type === 'quote') type = 'quote';
  else if (api.type === 'video') type = 'video';
  else if (api.type === 'reel') type = 'video';
  else if (api.type === 'tweet') type = 'story';
  else if (api.type === 'story') type = 'story';

  return {
    id: api.id,
    type,
    title: api.title || '',
    content: api.content || '',
    source: api.source,
    url: api.videoUrl,
    image: api.image,
  };
}

/** Simple loading skeleton matching the card grid layout */
function LoadingSkeleton() {
  return (
    <div className="w-full max-w-full mx-auto">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl min-h-[280px] bg-card/60 border border-border/40 animate-pulse col-span-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-900/40" />
            <div className="relative z-10 p-6 flex flex-col gap-3">
              <div className="h-4 w-16 rounded bg-muted/30" />
              <div className="h-5 w-3/4 rounded bg-muted/20" />
              <div className="h-3 w-full rounded bg-muted/20" />
              <div className="h-3 w-2/3 rounded bg-muted/20" />
              <div className="mt-auto h-3 w-20 rounded bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VibesCard({ item }: { item: VibesItem }) {
  return (
    <Card className="relative overflow-hidden p-6 bg-card border-border hover:border-primary/40 transition-all duration-500 group min-h-[280px] col-span-1">
      {/* Background image */}
      {item.image && (
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-500">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10">
        {/* Type indicator */}
        <div className="flex items-center gap-2 mb-3">
          {item.type === 'quote' && <Quote className="h-4 w-4 text-primary" />}
          {item.type === 'video' && <Play className="h-4 w-4 text-primary" />}
          {item.type === 'photo' && <Sparkles className="h-4 w-4 text-primary" />}
          {item.type === 'story' && <Heart className="h-4 w-4 text-primary" />}
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {item.type}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-foreground font-medium mb-2">{item.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
          {item.content}
        </p>

        {/* Source / Action */}
        <div className="flex items-center justify-between text-xs">
          {item.source && (
            <span className="text-primary/60">{item.source}</span>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Watch →
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

export function GoodVibesFeed() {
  const { items: apiItems, loading, error } = useFeed('feelgood');

  // Graceful degradation: fallback to mock data when API fails
  const displayItems: VibesItem[] = (apiItems.length > 0)
    ? apiItems.map(mapApiToVibesItem)
    : (error ? fallbackData : []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  // If zero items after load, use fallback
  const finalItems = displayItems.length > 0 ? displayItems : fallbackData;

  // Always [landscape → short] per row, not alternating.
  // Extra shorts → packed into full rows of 4.
  const youtubeItems = apiItems.filter(isYoutubeItem);
  const landscapes = youtubeItems.filter(i => !i.isShort);
  const shorts = youtubeItems.filter(i => i.isShort);

  // Build ordered items: always [landscape, short] [landscape, short]...
  // then remaining landscapes, then remaining shorts (4 per row)
  const orderedItems = [];
  let li = 0, si = 0;
  while (li < landscapes.length && si < shorts.length) {
    orderedItems.push(landscapes[li++]);
    orderedItems.push(shorts[si++]);
  }
  // Remaining landscapes (no short to pair)
  while (li < landscapes.length) orderedItems.push(landscapes[li++]);
  // Remaining shorts — packed into rows of 4 naturally by col-span-1
  while (si < shorts.length) orderedItems.push(shorts[si++]);

  // Non-YouTube items — Instagram gets InstagramCard, others get VibesCard
  const instagramItems = apiItems.filter(i => (i as any).instagram || i.platform === 'instagram');
  const otherNonYoutube = apiItems
    .filter(i => !isYoutubeItem(i) && !((i as any).instagram || i.platform === 'instagram'))
    .map(mapApiToVibesItem);

  return (
    <div className="w-full max-w-full mx-auto">
      {/* Instagram grid — image-full cards, newest first */}
      {instagramItems.length > 0 && (
        <div className="grid grid-cols-4 gap-4 auto-rows-auto mb-8">
          {instagramItems.map((item) => (
            <InstagramCard
              key={item.id}
              title={item.title || item.content || ''}
              content={item.content || ''}
              image={item.image || ''}
              source={(item as any).source}
              postUrl={(item as any).postUrl}
            />
          ))}
        </div>
      )}

      {/* Other curated content grid — newest first */}
      {otherNonYoutube.length > 0 && (
        <div className="grid grid-cols-4 gap-4 auto-rows-auto mb-8">
          {otherNonYoutube.map((item) => (
            <VibesCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* YouTube video grid */}
      {orderedItems.length > 0 && (
        <div className="grid grid-cols-4 gap-4 auto-rows-auto">
          {orderedItems.map((item) => {
            const props = toYoutubePlayerProps(item);
            if (!props) return null;
            return <YouTubePlayer key={item.id} {...props} />;
          })}
        </div>
      )}

      {/* Fallback when neither YouTube, Instagram, nor curated items exist */}
      {orderedItems.length === 0 && instagramItems.length === 0 && otherNonYoutube.length === 0 && (
        <div className="grid grid-cols-4 gap-4 auto-rows-auto">
          {finalItems.map((item) => (
            <VibesCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Refresh hint */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Content refreshes daily • Curated for soul & nature
        </p>
      </div>
    </div>
  );
}
