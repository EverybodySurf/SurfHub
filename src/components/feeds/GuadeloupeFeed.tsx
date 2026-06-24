'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { MapPin, Users, Calendar, Waves, Play, Loader2 } from 'lucide-react';
import { useFeed, type FeedItem } from '@/hooks/use-feed';
import { YouTubePlayer } from '@/components/feeds/YouTubePlayer';
import { InstagramCard } from '@/components/feeds/InstagramCard';
import { VideoModal } from '@/components/feeds/VideoModal';
import { isYoutubeItem, toYoutubePlayerProps, extractYoutubeId } from '@/lib/youtube-utils';

interface GuadeloupeItem {
  id: string;
  type: 'spot' | 'event' | 'surfer' | 'news';
  title: string;
  content: string;
  location?: string;
  date?: string;
  image?: string;
  url?: string;
  videoType?: 'youtube' | 'instagram' | 'tiktok';
}

// Fallback local content — shown when no API data
const fallbackData: GuadeloupeItem[] = [
  {
    id: 'fb-spot-1', type: 'spot', title: 'Caravelle',
    content: 'East coast gem. Works best with north swells. Beginner-friendly on small days.',
    location: 'Sainte-Anne',
    image: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-spot-2', type: 'spot', title: 'Anse Bertrand',
    content: 'North coast powerhouse. Fast, hollow waves when conditions align.',
    location: 'Anse-Bertrand',
    image: 'https://images.pexels.com/photos/1556663/pexels-photo-1556663.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-event-1', type: 'event', title: 'Surf Contest Gwada',
    content: 'Local competition at Caravelle. Register by Friday.',
    location: 'Caravelle, Sainte-Anne', date: 'June 15',
    image: 'https://images.pexels.com/photos/165992/pexels-photo-165992.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-news-1', type: 'news', title: 'New Surf School Opens',
    content: 'Fresh surf school in Le Moule. Local instructors, local vibes.',
    location: 'Le Moule',
    image: 'https://images.pexels.com/photos/3648754/pexels-photo-3648754.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-spot-3', type: 'spot', title: 'Port Louis',
    content: 'Northwest break. Good for afternoon sessions with offshore winds.',
    location: 'Port-Louis',
    image: 'https://images.pexels.com/photos/1458271/pexels-photo-1458271.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-spot-4', type: 'spot', title: 'La Chapelle',
    content: 'Powerful reef break. For experienced surfers only. Respect the locals.',
    location: 'Deshaies',
    image: 'https://images.pexels.com/photos/1006985/pexels-photo-1006985.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-news-2', type: 'news', title: 'Bonnes Conditions ce Matin',
    content: 'Bonnes conditions ce matin, esperons que cela dure toute la journee! Big up a mes deux champions.',
    location: 'Guadeloupe',
    image: 'https://images.pexels.com/photos/165992/pexels-photo-165992.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-creator-1', type: 'news', title: 'GwadaShots',
    content: 'Local surf photographer capturing Guadeloupe waves and surf culture.',
    location: 'Guadeloupe',
    image: 'https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'fb-creator-2', type: 'news', title: 'Romain Alexis',
    content: 'Local videographer documenting surf competitions and sessions.',
    location: 'Guadeloupe',
    image: 'https://images.pexels.com/photos/1171515/pexels-photo-1171515.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

// Map API FeedItem -> GuadeloupeItem
function mapApiToGuadeloupeItem(api: FeedItem): GuadeloupeItem {
  let type: GuadeloupeItem['type'] = 'news';
  if (api.type === 'spot') type = 'spot';
  else if (api.type === 'event') type = 'event';
  else if (api.type === 'surfer') type = 'surfer';
  if (api.videoUrl) type = 'news';

  return {
    id: api.id, type, title: api.title || '',
    content: api.content || '', location: api.location,
    image: api.image, url: api.videoUrl, videoType: api.videoType,
  };
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="w-full max-w-full mx-auto">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl min-h-[200px] bg-card/60 border border-border/40 animate-pulse col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-900/40" />
            <div className="relative z-10 p-5 flex flex-col gap-2">
              <div className="h-3 w-12 rounded bg-muted/30" />
              <div className="h-4 w-3/4 rounded bg-muted/20" />
              <div className="h-3 w-full rounded bg-muted/20" />
              <div className="h-3 w-1/2 rounded bg-muted/20" />
              <div className="mt-auto h-3 w-16 rounded bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuadeloupeCard({ item, onPlay }: { item: GuadeloupeItem; onPlay: (item: GuadeloupeItem) => void }) {
  return (
    <Card className="relative overflow-hidden bg-card border-border hover:border-primary/40 hover:shadow-md transition-all duration-500 group min-h-[200px] p-5 col-span-1">
      {/* Background image */}
      {item.image && (
        <div className="absolute inset-0 z-0 opacity-15 dark:opacity-25 group-hover:opacity-25 dark:group-hover:opacity-35 transition-all duration-500">
          <Image
            src={item.image} alt={item.title} fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Type badge */}
        <div className="inline-flex items-center gap-1.5 mb-2 bg-background/50 backdrop-blur-sm rounded-full px-2.5 py-0.5 w-fit text-[10px] text-muted-foreground border border-border/50">
          {item.type === 'spot' && <Waves className="h-3 w-3 text-primary" />}
          {item.type === 'event' && <Calendar className="h-3 w-3 text-primary" />}
          {item.type === 'surfer' && <Users className="h-3 w-3 text-primary" />}
          {item.type === 'news' && <MapPin className="h-3 w-3 text-primary" />}
          {item.type}
        </div>

        <h3 className="text-foreground font-medium text-sm mb-1.5">{item.title}</h3>
        <p className="text-muted-foreground text-xs leading-relaxed mb-auto">{item.content}</p>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2 text-[10px] text-primary/60">
            {item.location && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
            )}
            {item.date && <span>{item.date}</span>}
          </div>

          {item.url && item.videoType ? (
            <button onClick={() => onPlay(item)}
              className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium">
              <Play className="h-3 w-3" /> Watch
            </button>
          ) : item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-primary hover:text-primary/80 transition-colors font-medium">
              Visit →
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function GuadeloupeFeed() {
  const [modalVideo, setModalVideo] = useState<{videoId: string; title: string; isShort?: boolean} | null>(null);
  const { items: apiItems, loading, error } = useFeed('local');

  // Build display items
  const displayItems: GuadeloupeItem[] = (apiItems.length > 0)
    ? apiItems.map(mapApiToGuadeloupeItem)
    : (error ? fallbackData : []);

  if (loading) return <LoadingSkeleton />;
  const finalItems: GuadeloupeItem[] = displayItems.length > 0 ? displayItems : fallbackData;

  // Consistent pairs: always [landscape → short].
  // Extra shorts → packed into rows of 4 naturally by col-span-1.
  const youtubeItems = apiItems.filter(isYoutubeItem);
  const landscapes = youtubeItems.filter(i => !i.isShort);
  const shorts = youtubeItems.filter(i => i.isShort);

  // Build ordered items
  const orderedItems: any[] = [];
  let li = 0, si = 0;
  while (li < landscapes.length && si < shorts.length) {
    orderedItems.push(landscapes[li++]);
    orderedItems.push(shorts[si++]);
  }
  // Remaining landscapes (no short to pair)
  while (li < landscapes.length) orderedItems.push(landscapes[li++]);
  // Remaining shorts — packed into rows of 4 naturally by col-span-1
  while (si < shorts.length) orderedItems.push(shorts[si++]);

  // Instagram items
  const instagramItems = apiItems.filter(i => !i.id.startsWith('curated_') && (i as any).platform === 'instagram');

  return (
    <div className="w-full max-w-full mx-auto">
      {/* Instagram grid */}
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
              type={(item as any).type}
            />
          ))}
        </div>
      )}

      {/* YouTube grid */}
      <div className="grid grid-cols-4 gap-4 auto-rows-auto">
        {orderedItems.map((item) => {
          const props = toYoutubePlayerProps(item);
          if (!props) return null;
          return <YouTubePlayer key={item.id} {...props} />;
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">Want to add your spot, event, or story?</p>
        <a href="/forum" className="text-primary hover:text-primary/80 text-xs transition-colors">
          Join the community →
        </a>
      </div>
    </div>
  );
}
