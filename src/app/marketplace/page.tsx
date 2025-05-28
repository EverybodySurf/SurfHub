import type { Metadata } from 'next';
import { ShoppingBag, Store } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community Marketplace - SurfHub',
  description: 'Buy, sell, and promote surf gear, lessons, and services within the SurfHub community marketplace.',
};

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <ShoppingBag className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Community Marketplace
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Discover great deals on surf gear, find local services, or list your own offerings. The SurfHub marketplace is currently shaping up!
        </p>
      </div>

      <div className="bg-muted rounded-lg p-8 text-center shadow-lg">
         <div className="relative w-full h-80 mb-6 rounded-md overflow-hidden">
           <Image 
            src="https://placehold.co/1000x500.png" 
            alt="Placeholder image of a marketplace" 
            layout="fill"
            objectFit="cover"
            data-ai-hint="market stall items"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
            <Store className="h-20 w-20 text-white mb-4" />
            <h2 className="text-3xl font-semibold text-white">Marketplace Launching Soon!</h2>
          </div>
        </div>
        <p className="text-xl text-foreground">
          A dedicated space for surfers to buy, sell, and trade. Get ready to score some awesome deals!
        </p>
        <p className="mt-2 text-muted-foreground mb-6">
          Whether you're looking for a new board or offering lessons, this will be your go-to spot.
        </p>
         <Button asChild size="lg">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
