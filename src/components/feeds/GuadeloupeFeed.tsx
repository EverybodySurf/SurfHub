'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { MapPin, Users, Calendar, Waves } from 'lucide-react';

interface GuadeloupeItem {
  id: string;
  type: 'spot' | 'event' | 'surfer' | 'news';
  title: string;
  content: string;
  location?: string;
  date?: string;
  image?: string;
  url?: string;
}

const guadeloupeData: GuadeloupeItem[] = [
  {
    id: '8',
    type: 'news',
    title: 'Bonnes Conditions ce Matin 🌊',
    content: 'Bonnes conditions ce matin, espérons que cela dure toute la journée ! Big up à mes deux champions.',
    location: 'Guadeloupe',
    image: 'https://images.pexels.com/photos/1556663/pexels-photo-1556663.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: 'https://www.instagram.com/reel/DYCUdqEBCqk/',
  },
  {
    id: '7',
    type: 'event',
    title: 'Compétition de Surf Gwada 🏆',
    content: 'DU VRAI NIVEAU — Local surfers showing real skills in Guadeloupe competition. Raw talent, powerful waves.',
    location: 'Guadeloupe',
    image: 'https://i.ytimg.com/vi/k8VxkPMqYdU/hqdefault.jpg',
    url: 'https://youtu.be/k8VxkPMqYdU',
  },
  {
    id: '1',
    type: 'spot',
    title: 'Caravelle',
    content: 'East coast gem. Works best with north swells. Beginner-friendly on small days.',
    location: 'Sainte-Anne',
    image: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '2',
    type: 'spot',
    title: 'Anse Bertrand',
    content: 'North coast powerhouse. Fast, hollow waves when conditions align.',
    location: 'Anse-Bertrand',
    image: 'https://images.pexels.com/photos/1556663/pexels-photo-1556663.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '3',
    type: 'surfer',
    title: 'Local Spotlight',
    content: 'Meet the surfers shaping Guadeloupe\'s wave culture.',
    location: 'Community',
    image: 'https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '4',
    type: 'event',
    title: 'Surf Contest Gwada',
    content: 'Annual competition. Music, food, waves.',
    date: 'Coming Soon',
    image: 'https://images.pexels.com/photos/165992/pexels-photo-165992.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '5',
    type: 'news',
    title: 'New Surf School Opens',
    content: 'Fresh surf school in Le Moule. Local instructors, local vibes.',
    location: 'Le Moule',
    image: 'https://images.pexels.com/photos/3648754/pexels-photo-3648754.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '6',
    type: 'spot',
    title: 'Port Louis',
    content: 'Northwest break. Good for afternoon sessions.',
    location: 'Port-Louis',
    image: 'https://images.pexels.com/photos/1458271/pexels-photo-1458271.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];

export function GuadeloupeFeed() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guadeloupeData.map((item) => (
          <Card 
            key={item.id}
            className="relative overflow-hidden p-5 bg-card border-border hover:border-primary/40 transition-all duration-500 group min-h-[200px]"
          >
            {/* Background image */}
            {item.image && (
              <div className="absolute inset-0 z-0 opacity-15 dark:opacity-25 group-hover:opacity-25 dark:group-hover:opacity-35 transition-opacity duration-500">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
              </div>
            )}
            
            {/* Content overlay */}
            <div className="relative z-10">
              {/* Type indicator */}
              <div className="flex items-center gap-2 mb-2">
                {item.type === 'spot' && <Waves className="h-4 w-4 text-primary" />}
                {item.type === 'event' && <Calendar className="h-4 w-4 text-primary" />}
                {item.type === 'surfer' && <Users className="h-4 w-4 text-primary" />}
                {item.type === 'news' && <MapPin className="h-4 w-4 text-primary" />}
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {item.type}
                </span>
              </div>
              
              {/* Content */}
              <h3 className="text-foreground font-medium text-sm mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-2">
                {item.content}
              </p>
              
              {/* Meta */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-primary/60">
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </span>
                  )}
                  {item.date && (
                    <span>{item.date}</span>
                  )}
                </div>
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
      
      {/* Community call */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Want to add your spot, event, or story?
        </p>
        <a href="/forum" className="text-primary hover:text-primary/80 text-xs transition-colors">
          Join the community →
        </a>
      </div>
    </div>
  );
}