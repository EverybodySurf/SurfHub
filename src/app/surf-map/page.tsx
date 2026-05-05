'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SurfSpot, guadeloupeSurfSpots } from '@/data/surf-spots-guadeloupe';
import { Amenity, guadeloupeAmenities, amenityColors } from '@/data/amenities-guadeloupe';
import { MapPin, Waves, Clock, Coffee, UtensilsCrossed, ShoppingBag, Fuel, Car, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import map component with SSR disabled (Leaflet requires window)
const SurfMap = dynamic(() => import('@/components/surf-map/SurfMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
      <div className="text-center">
        <Waves className="h-12 w-12 mx-auto mb-3 animate-pulse text-cyan-400" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

// Amenity icons mapping
const amenityIconsMap = {
  'cafe': Coffee,
  'restaurant': UtensilsCrossed,
  'surf-shop': Building2,
  'board-rental': Waves,
  'gas-station': Fuel,
  'grocery': ShoppingBag,
  'parking': Car,
  'hotel': Building2,
};

export default function SurfMapPage() {
  const [selectedSpot, setSelectedSpot] = useState<SurfSpot | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Wait for client-side mount to prevent double initialization
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use full scraped list
  const spots = guadeloupeSurfSpots;
  
  // Get amenities for selected spot
  const spotAmenities = selectedSpot 
    ? guadeloupeAmenities.filter(a => a.spotId === selectedSpot.id)
    : [];

  const difficultyColors = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-yellow-100 text-yellow-800',
    'advanced': 'bg-orange-100 text-orange-800',
    'expert': 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold tracking-tight">
              Guadeloupe Surf Spots
            </h1>
          </div>
          <p className="text-muted-foreground">
            Explore {spots.length} surf spots across Grande-Terre and Basse-Terre
          </p>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Map - Takes 2/3 on large screens */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-card rounded-lg shadow-lg overflow-hidden h-[500px] lg:h-[600px]">
              {mounted ? (
                <SurfMap 
                  spots={spots} 
                  selectedSpot={selectedSpot}
                  onSpotSelect={setSelectedSpot}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <Waves className="h-12 w-12 mx-auto mb-3 animate-pulse text-cyan-400" />
                    <p className="text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Spot List - Takes 1/3 on large screens */}
          <div className="order-1 lg:order-2">
            <div className="bg-card rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Waves className="h-5 w-5" />
                Surf Spots
              </h2>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {spots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all",
                      selectedSpot?.id === spot.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{spot.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        difficultyColors[spot.difficulty]
                      )}>
                        {spot.difficulty}
                      </span>
                    </div>
                    
                    {spot.beachName && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {spot.beachName}
                      </p>
                    )}
                    
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Waves className="h-3 w-3" />
                        {spot.waveType}
                      </span>
                      {spot.bestSeason && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {spot.bestSeason}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                
                {spots.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Waves className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Loading surf spots...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Spot Details */}
            {selectedSpot && (
              <div className="mt-4 bg-card rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-semibold mb-2">{selectedSpot.name}</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedSpot.description}
                </p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Wave Type</span>
                    <p className="font-medium">{selectedSpot.waveType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Difficulty</span>
                    <p className={cn(
                      "font-medium",
                      selectedSpot.difficulty === 'beginner' && "text-green-600",
                      selectedSpot.difficulty === 'intermediate' && "text-yellow-600",
                      selectedSpot.difficulty === 'advanced' && "text-orange-600"
                    )}>
                      {selectedSpot.difficulty}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location</span>
                    <p className="font-medium">
                      {selectedSpot.location.lat.toFixed(4)}, {selectedSpot.location.lon.toFixed(4)}
                    </p>
                  </div>
                  {selectedSpot.bestSeason && (
                    <div>
                      <span className="text-muted-foreground">Best Season</span>
                      <p className="font-medium">{selectedSpot.bestSeason}</p>
                    </div>
                  )}
                </div>

                {/* Nearby Amenities */}
                {spotAmenities.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm font-medium mb-3">Nearby Amenities</p>
                    <div className="space-y-2">
                      {spotAmenities.map((amenity) => {
                        const Icon = amenityIconsMap[amenity.type] || Building2;
                        return (
                          <div 
                            key={amenity.id}
                            className="flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Icon className="h-4 w-4 mt-0.5 text-cyan-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{amenity.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className={cn("px-1.5 py-0.5 rounded", amenityColors[amenity.type])}>
                                  {amenity.type.replace('-', ' ')}
                                </span>
                                {amenity.distanceFromSpot && (
                                  <span>• {amenity.distanceFromSpot}</span>
                                )}
                              </div>
                              {amenity.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{amenity.notes}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* No amenities message */}
                {spotAmenities.length === 0 && selectedSpot && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground italic">
                      Amenities data coming soon...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}