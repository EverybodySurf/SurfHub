import type { Metadata } from 'next';
import { List, MapPin, Utensils, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Surf Directory - SurfHub',
  description: 'Explore surf spots, businesses, and restaurants. Find reviews and ratings from the community.',
};

const directoryCategories = [
  {
    name: 'Surf Spots',
    description: 'Discover iconic and hidden surf breaks around the world.',
    icon: MapPin,
    href: '/directory/surf-spots', // Placeholder link
    image: 'https://placehold.co/600x400.png',
    aiHint: 'surf spot',
  },
  {
    name: 'Surf Businesses',
    description: 'Find surf shops, schools, repair services, and more.',
    icon: Briefcase,
    href: '/directory/businesses', // Placeholder link
    image: 'https://placehold.co/600x400.png',
    aiHint: 'surf shop',
  },
  {
    name: 'Surf Restaurants',
    description: 'Locate the best eateries near surf spots for a post-surf meal.',
    icon: Utensils,
    href: '/directory/restaurants', // Placeholder link
    image: 'https://placehold.co/600x400.png',
    aiHint: 'beach cafe',
  },
];

export default function DirectoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <List className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Surf Directory
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Your guide to the best surf spots, businesses, and restaurants. Explore user-submitted reviews and ratings to plan your next adventure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {directoryCategories.map((category) => (
          <Card key={category.name} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-56 w-full">
               <Image src={category.image} alt={category.name} layout="fill" objectFit="cover" data-ai-hint={category.aiHint} />
            </div>
            <CardHeader>
              <div className="flex items-center mb-2">
                <category.icon className="h-8 w-8 text-primary mr-3" />
                <CardTitle className="text-2xl">{category.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{category.description}</p>
            </CardContent>
            <CardContent className="mt-auto">
              <Button asChild className="w-full">
                <Link href={category.href}>Explore {category.name}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
       <div className="mt-12 text-center">
        <p className="text-lg text-muted-foreground">
          Detailed listings and user reviews coming soon!
        </p>
      </div>
    </div>
  );
}
