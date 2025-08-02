
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
  {
    icon: List,
    title: 'Join the Community',
    description: 'Share tips, report conditions, and connect with fellow surfers in our vibrant forum.',
    href: '/forum',
    imgSrc: 'https://placehold.co/600x400.png',
    imgAlt: 'Community forum',
    aiHint: 'forum',
  },
  {
    icon: List,
    title: 'Marketplace',
    description: 'Buy, sell, and promote surf gear, lessons, and services within the community.',
    href: '/marketplace',
    imgSrc: 'https://placehold.co/600x400.png',
    imgAlt: 'Marketplace',
    aiHint: 'Market',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section id="hero" className="w-full py-12 md:py-20 bg-gradient-to-t from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Waves className="mx-auto h-16 w-16 text-primary mb-6" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            Welcome to SurfHub
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
            Your ultimate companion for swell forecasts, local business discovery, and connecting with the surfing community.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild className="bg-primary" size="lg">
              <Link href="/swell-forecaster">
                Get Surf Reports
              </Link>
            </Button>
            <Button asChild variant="outlineGlow" size="lg">
              <Link href="/directory">Explore Local Biz</Link>
            </Button>
          </div>
          <div className="mt-10">
             <p className="text-muted-extra text-md mt-2 max-w-xs mx-auto block">
                To offer your own local reports, use the marketplace & more,
            </p>
            <Link href="/login" className="mt-2 text-primary text-md underline hover:text-foreground">
              Sign up here
            </Link> 
            <p className="text-muted-extra text-md mt-1">
              It's free!
            </p>
          </div>
          <div className="mt-9 text-muted-foreground block mx-auto text-center">
            <Link href="#features">Explore More 👇</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 md:py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-center text-foreground sm:text-4xl mb-12">
            Discover What SurfHub Offers
          </h2>
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-8 max-w-none mx-auto">
              {features.map((feature) => (
                <Card 
                  key={feature.title} 
                  className="flex flex-col overflow-hidden shadow-lg hover:shadow-lg hover:shadow-green-300 transition-shadow duration-300 md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]"
                >
                 {/*<div className="relative h-56 w-full">
                      <Image
                        src={feature.imgSrc}
                        alt={feature.imgAlt}
                        fill
                        className="object-cover"
                        data-ai-hint={feature.aiHint}
                      />
                    </div>  */}
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
        </div>
      </section>
    </div>
  );
}
