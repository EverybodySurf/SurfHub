'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Globe, Trophy, Plane, Newspaper, Waves } from 'lucide-react';

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

const globalData: GlobalItem[] = [
  {
    id: '7',
    type: 'culture',
    title: 'Surfers vs. Orcas: Did They See That?! 🐋',
    content: 'Insane encounter — surfers paddle alongside orcas in the wild. A once-in-a-lifetime moment captured on video.',
    source: 'KingZworldTV',
    url: 'https://youtu.be/Qj2bybTl2rQ',
    image: 'https://i.ytimg.com/vi/Qj2bybTl2rQ/hqdefault.jpg',
  },
  {
    id: '1',
    type: 'competition',
    title: 'WSL Championship Tour',
    content: 'Latest results from the world tour.',
    source: 'World Surf League',
    url: 'https://worldsurfleague.com',
    image: 'https://images.pexels.com/photos/165992/pexels-photo-165992.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '2',
    type: 'travel',
    title: 'Hidden Gems: Indonesia',
    content: 'Beyond Bali — discovering uncrowded perfection.',
    source: 'Surf Travel Mag',
    region: 'Asia-Pacific',
    image: 'https://images.pexels.com/photos/1006985/pexels-photo-1006985.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '3',
    type: 'culture',
    title: 'The Art of Wave Riding',
    content: 'From traditional Hawaiian surfing to modern performance.',
    source: 'Surfer\'s Journal',
    image: 'https://images.pexels.com/photos/547114/pexels-photo-547114.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '4',
    type: 'news',
    title: 'Ocean Conservation Wins',
    content: 'New marine protected areas announced.',
    source: 'Ocean News',
    image: 'https://images.pexels.com/photos/1458271/pexels-photo-1458271.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '5',
    type: 'gear',
    title: 'Sustainable Board Tech',
    content: 'Eco-friendly materials reshaping board building.',
    source: 'Gear Review',
    image: 'https://images.pexels.com/photos/3648754/pexels-photo-3648754.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '6',
    type: 'travel',
    title: 'Europe\'s Best Winter Spots',
    content: 'Portugal, France, Spain deliver.',
    source: 'Euro Surf Guide',
    region: 'Europe',
    image: 'https://images.pexels.com/photos/1171515/pexels-photo-1171515.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];

export function GlobalSurfFeed() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {globalData.map((item) => (
          <Card 
            key={item.id}
            className="relative overflow-hidden p-4 bg-card border-border hover:border-primary/40 transition-all duration-500 group min-h-[160px]"
          >
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