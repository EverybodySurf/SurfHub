import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Interactive Surf Map - SurfHub',
  description: 'Explore surf spots and view real-time swell conditions on our interactive map.',
};

export default function SurfMapPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <MapPin className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Interactive Surf Map
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Discover surf spots around the globe and check live swell conditions. Our interactive map is currently under development.
        </p>
      </div>

      <div className="bg-secondary rounded-lg p-8 text-center shadow-lg">
        <div className="relative w-full h-96 mb-6 rounded-md overflow-hidden">
          <Image 
            src="https://placehold.co/1200x600.png" 
            alt="Placeholder map of surf spots" 
            layout="fill"
            objectFit="cover"
            data-ai-hint="world map surf"
          />
           <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h2 className="text-3xl font-semibold text-white">Map Feature Coming Soon!</h2>
          </div>
        </div>
        <p className="text-xl text-foreground">
          We're working hard to bring you an amazing interactive map experience. Stay tuned!
        </p>
        <p className="mt-2 text-muted-foreground">
          Soon you'll be able to explore spots, see live data, and plan your surf sessions right here.
        </p>
      </div>
    </div>
  );
}
