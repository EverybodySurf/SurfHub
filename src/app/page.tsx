
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, BarChart3, MapPin, List, Users, ShoppingBag, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'AI Swell Forecaster',
    description: 'Get AI-powered swell forecasts to know exactly when and where to catch the best waves.',
    href: '/swell-forecaster',
    imgSrc: 'https://placehold.co/600x400.png',
    imgAlt: 'Swell forecast chart',
    aiHint: 'wave chart',
  },
  {
    icon: MapPin,
    title: 'Interactive Surf Map',
    description: 'Explore surf spots, check current conditions, and plan your next surf trip with ease.',
    href: '/surf-map',
    imgSrc: 'https://placehold.co/600x400.png',
    imgAlt: 'Surf map',
    aiHint: 'surf map',
  },
  {
    icon: List,
    title: 'Surf Directory',
    description: 'Discover surf spots, businesses, and restaurants with user reviews and ratings.',
    href: '/directory',
    imgSrc: 'https://placehold.co/600x400.png',
    imgAlt: 'Directory listing',
    aiHint: 'surf beach',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Waves className="mx-auto h-16 w-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            Welcome to SurfHub
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
            Your ultimate companion for swell forecasts, surf spot discovery, and connecting with the surfing community. Catch the perfect wave, every time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild className="bg-primary" size="lg">
              <Link href="/swell-forecaster">
                Get Forecast <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/directory">Explore Spots</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-center text-foreground sm:text-4xl mb-12">
            Discover What SurfHub Offers
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-56 w-full">
                  <Image
                    src={feature.imgSrc}
                    alt={feature.imgAlt}
                    fill
                    className="object-cover"
                    data-ai-hint={feature.aiHint}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <feature.icon className="h-8 w-8 text-primary mr-3" />
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button asChild variant="link" className="px-0 text-primary">
                    <Link href={feature.href}>
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Marketplace Teaser */}
      <section className="w-full py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="text-center md:text-left">
              <Users className="mx-auto md:mx-0 h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-3">Join the Community</h3>
              <p className="text-muted-foreground mb-4">
                Share tips, report conditions, and connect with fellow surfers in our vibrant forum.
              </p>
              <Button asChild>
                <Link href="/forum">Visit Forum</Link>
              </Button>
            </div>
            <div className="text-center md:text-left">
              <ShoppingBag className="mx-auto md:mx-0 h-12 w-12 text-primary mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-3">Surf Marketplace</h3>
              <p className="text-muted-foreground mb-4">
                Buy, sell, and promote surf gear, lessons, and services within the community.
              </p>
              <Button asChild>
                <Link href="/marketplace">Explore Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
