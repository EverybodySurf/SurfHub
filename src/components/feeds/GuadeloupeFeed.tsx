'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { MapPin, Users, Calendar, Waves, Play, X } from 'lucide-react';

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

// Extract video ID from various URL formats
function extractVideoId(url: string, videoType: string): string | null {
  if (videoType === 'youtube') {
    // YouTube: youtu.be/ID or youtube.com/watch?v=ID or youtube.com/embed/ID
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
  if (videoType === 'instagram') {
    // Instagram: instagram.com/p/ID or instagram.com/reel/ID
    const match = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
  if (videoType === 'tiktok') {
    // TikTok: tiktok.com/@user/video/ID
    const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    return match ? match[1] : null;
  }
  return null;
}

const guadeloupeData: GuadeloupeItem[] = [
  // === KNOWN CONTENT CREATORS ===
  {
    id: 'creator-1',
    type: 'news',
    title: 'GwadaShots 📸',
    content: 'Local surf photographer capturing Guadeloupe waves and surf culture. Follow for daily conditions and epic shots.',
    location: 'Guadeloupe',
    image: 'https://images.pexels.com/photos/1556663/pexels-photo-1556663.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: 'https://www.instagram.com/gwadashots/',
  },
  {
    id: 'creator-2',
    type: 'news',
    title: 'Romain Alexis 🎬',
    content: 'Local videographer documenting surf competitions and sessions. DU VRAI NIVEAU.',
    location: 'Guadeloupe',
    image: 'https://i.ytimg.com/vi/k8VxkPMqYdU/hqdefault.jpg',
    url: 'https://www.youtube.com/@Romain_Alexis',
  },
  {
    id: 'creator-3',
    type: 'news',
    title: 'Gwada Surf Report 🌊',
    content: 'Daily surf conditions, spot reports, and local wave wisdom for Guadeloupe surfers.',
    location: 'Guadeloupe',
    image: 'https://images.pexels.com/photos-189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: 'https://www.instagram.com/gwadasurfreport/',
  },
  // === RECENT CONTENT ===
  {
    id: '8',
    type: 'news',
    title: 'Bonnes Conditions ce Matin 🌊',
    content: 'Bonnes conditions ce matin, espérons que cela dure toute la journée ! Big up à mes deux champions.',
    location: 'Guadeloupe',
    image: 'https://images.pexels.com/photos/1556663/pexels-photo-1556663.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: 'https://www.instagram.com/reel/DYCUdqEBCqk/',
    videoType: 'instagram',
  },
  {
    id: '7',
    type: 'event',
    title: 'Compétition de Surf Gwada 🏆',
    content: 'DU VRAI NIVEAU — Local surfers showing real skills in Guadeloupe competition. Raw talent, powerful waves.',
    location: 'Guadeloupe',
    image: 'https://i.ytimg.com/vi/k8VxkPMqYdU/hqdefault.jpg',
    url: 'https://youtu.be/k8VxkPMqYdU',
    videoType: 'youtube',
  },
  // === SPOTS ===
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
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  const handlePlayClick = (item: GuadeloupeItem) => {
    if (playingId === item.id) {
      setPlayingId(null); // Close if already playing
    } else {
      setPlayingId(item.id); // Open this video
    }
  };
  
  const renderVideoEmbed = (item: GuadeloupeItem) => {
    const videoId = item.url && item.videoType ? extractVideoId(item.url, item.videoType) : null;
    
    if (!videoId) return null;
    
    if (item.videoType === 'youtube') {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={item.title}
        />
      );
    }
    
    if (item.videoType === 'instagram') {
      return (
        <iframe
          src={`https://www.instagram.com/reel/${videoId}/embed`}
          className="w-full h-full"
          allowFullScreen
          title={item.title}
        />
      );
    }
    
    if (item.videoType === 'tiktok') {
      return (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${videoId}`}
          className="w-full h-full"
          allowFullScreen
          title={item.title}
        />
      );
    }
    
    return null;
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guadeloupeData.map((item) => (
          <Card 
            key={item.id}
            className={`relative overflow-hidden bg-card border-border hover:border-primary/40 transition-all duration-500 group ${
              playingId === item.id && item.videoType 
                ? 'min-h-[300px] md:min-h-[350px]' 
                : 'min-h-[200px] p-5'
            }`}
          >
            {/* VIDEO PLAYING STATE */}
            {playingId === item.id && item.videoType ? (
              <div className="absolute inset-0 z-20">
                {/* Close button */}
                <button 
                  onClick={() => setPlayingId(null)}
                  className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                  aria-label="Close video"
                >
                  <X className="h-4 w-4" />
                </button>
                {renderVideoEmbed(item)}
              </div>
            ) : (
              <>
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
                    
                    {/* Play button for video items */}
                    {item.url && item.videoType && (
                      <button 
                        onClick={() => handlePlayClick(item)}
                        className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        Play
                      </button>
                    )}
                    
                    {/* External link for non-video items */}
                    {item.url && !item.videoType && (
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
              </>
            )}
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