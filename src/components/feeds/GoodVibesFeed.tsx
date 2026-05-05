'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Play, Heart, Quote, Sparkles } from 'lucide-react';

interface VibesItem {
  id: string;
  type: 'video' | 'photo' | 'quote' | 'story';
  title: string;
  content: string;
  source?: string;
  url?: string;
  image?: string;
}

const vibesData: VibesItem[] = [
  {
    id: '1',
    type: 'quote',
    title: 'Wave Wisdom',
    content: '"The ocean heals everything. It whispers to those who listen, and carries those who surrender."',
    source: 'Surfer\'s Journal',
    image: 'https://images.pexels.com/photos/1458271/pexels-photo-1458271.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    type: 'video',
    title: 'Morning Glass',
    content: 'Watch the sunrise paint the waves gold. A reminder that every day is a gift.',
    source: 'YouTube',
    url: 'https://youtube.com',
    image: 'https://images.pexels.com/photos/165992/pexels-photo-165992.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    type: 'photo',
    title: 'Empty Lineup',
    content: 'Sometimes the best session is alone. Just you, the board, and the swell.',
    source: 'Instagram',
    image: 'https://images.pexels.com/photos/3648754/pexels-photo-3648754.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '4',
    type: 'quote',
    title: 'Ocean Philosophy',
    content: '"You can\'t stop the waves, but you can learn how to swim."',
    source: 'Jon Kabat-Zinn',
    image: 'https://images.pexels.com/photos/1006985/pexels-photo-1006985.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '5',
    type: 'story',
    title: 'The First Wave',
    content: 'Remember your first wave? That feeling never leaves. It just deepens with time.',
    source: 'Community Story',
    image: 'https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '6',
    type: 'photo',
    title: 'Golden Hour',
    content: 'When the light hits the water just right, everything makes sense.',
    image: 'https://images.pexels.com/photos/1171515/pexels-photo-1171515.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export function GoodVibesFeed() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vibesData.map((item) => (
          <Card 
            key={item.id}
            className="relative overflow-hidden p-6 bg-card border-border hover:border-primary/40 transition-all duration-500 group min-h-[280px]"
          >
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
        ))}
      </div>
      
      {/* Refresh hint */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Content refreshes daily • Curated for soul & nature
        </p>
      </div>
    </div>
  );
}