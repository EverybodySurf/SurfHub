'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SurfSpot, guadeloupeSurfSpots } from '@/data/surf-spots-guadeloupe';
import { Amenity, guadeloupeAmenities, amenityColors, amenityTypeLabels } from '@/data/amenities-guadeloupe';
import { MapPin, Waves, Search, X, SlidersHorizontal, Coffee, UtensilsCrossed, ShoppingBag, Fuel, Building2, Waves as WaveIcon, Car, Bed } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import the unified map
const UnifiedMap = dynamic(() => import('@/components/surf-map/UnifiedMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <Waves className="h-12 w-12 mx-auto mb-3 animate-pulse text-cyan-400" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

// Filter types
type ViewMode = 'all' | 'spots' | 'amenities';
type AmenityFilter = string | 'all';

const amenityFilterIcons: Record<string, React.ReactNode> = {
  cafe: <Coffee className="h-3.5 w-3.5" />,
  restaurant: <UtensilsCrossed className="h-3.5 w-3.5" />,
  'surf-shop': <Building2 className="h-3.5 w-3.5" />,
  'board-rental': <Waves className="h-3.5 w-3.5" />,
  grocery: <ShoppingBag className="h-3.5 w-3.5" />,
  'gas-station': <Fuel className="h-3.5 w-3.5" />,
  parking: <Car className="h-3.5 w-3.5" />,
  lodging: <Bed className="h-3.5 w-3.5" />,
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-orange-100 text-orange-800 border-orange-200',
  expert: 'bg-red-100 text-red-800 border-red-200',
};

const waveTypeIcons: Record<string, string> = {
  'beach-break': '🏖️',
  'reef-break': '🪸',
  'point-break': '📍',
};

export default function ExplorePage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [amenityFilter, setAmenityFilter] = useState<AmenityFilter>('all');
  const [selectedSpot, setSelectedSpot] = useState<SurfSpot | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'spots' | 'amenities'>('spots');

  useEffect(() => { setMounted(true); }, []);

  const spots = guadeloupeSurfSpots;
  const amenities = guadeloupeAmenities;

  // Derive unique amenity types present in data
  const amenityTypes = useMemo(() => {
    const types = new Set(amenities.map((a) => a.type));
    return Array.from(types).sort();
  }, [amenities]);

  // Filter spots by search + view mode
  const filteredSpots = useMemo(() => {
    if (viewMode === 'amenities') return [];
    let list = spots;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.beachName?.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.difficulty.toLowerCase().includes(q) ||
          s.waveType.toLowerCase().includes(q) ||
          s.location.region.toLowerCase().includes(q),
      );
    }
    return list;
  }, [spots, searchQuery, viewMode]);

  // Filter amenities by search + filter type
  const filteredAmenities = useMemo(() => {
    if (viewMode === 'spots') return [];
    let list = amenities;
    if (amenityFilter !== 'all') {
      list = list.filter((a) => a.type === amenityFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.address?.toLowerCase().includes(q) ||
          a.notes?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [amenities, searchQuery, viewMode, amenityFilter]);

  // Visible spot/amenity IDs for map
  const visibleSpotIds = useMemo(() => {
    if (viewMode === 'amenities') {
      // If an amenity is selected, show its parent spot
      if (selectedAmenity) {
        return new Set([selectedAmenity.spotId]);
      }
      // Otherwise show all spots (for context) or none
      return new Set(spots.map((s) => s.id));
    }
    return new Set(filteredSpots.map((s) => s.id));
  }, [filteredSpots, viewMode, selectedAmenity, spots]);

  const visibleAmenityIds = useMemo(() => {
    if (viewMode === 'spots') {
      // Show amenities for the selected spot, or none
      if (selectedSpot) {
        return new Set(
          amenities.filter((a) => a.spotId === selectedSpot.id).map((a) => a.id),
        );
      }
      return new Set();
    }
    return new Set(filteredAmenities.map((a) => a.id));
  }, [filteredAmenities, viewMode, selectedSpot, amenities]);

  // Amenities for selected spot
  const spotAmenities = useMemo(
    () => (selectedSpot ? amenities.filter((a) => a.spotId === selectedSpot.id) : []),
    [selectedSpot, amenities],
  );

  // Parent spot for selected amenity
  const parentSpot = useMemo(() => {
    if (!selectedAmenity) return null;
    return spots.find((s) => s.id === selectedAmenity.spotId) || null;
  }, [selectedAmenity, spots]);

  const handleSpotSelect = (spot: SurfSpot) => {
    setSelectedSpot(spot);
    setSelectedAmenity(null);
    setSidebarTab('spots');
  };

  const handleAmenitySelect = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setSelectedSpot(null);
    setSidebarTab('amenities');
  };

  const handleClearSelection = () => {
    setSelectedSpot(null);
    setSelectedAmenity(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    handleClearSelection();
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shrink-0">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <MapPin className="h-5 w-5 text-cyan-400 shrink-0" />
          <h1 className="text-lg font-bold tracking-tight hidden sm:block">
            Explore Guadeloupe
          </h1>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search spots, cafes, shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-sm rounded-full border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
            <button
              onClick={() => handleViewModeChange('all')}
              className={cn(
                'px-3 py-1.5 transition-colors',
                viewMode === 'all' ? 'bg-cyan-500/10 text-cyan-500' : 'hover:bg-muted',
              )}
            >
              All
            </button>
            <button
              onClick={() => handleViewModeChange('spots')}
              className={cn(
                'px-3 py-1.5 border-x border-border transition-colors',
                viewMode === 'spots' ? 'bg-cyan-500/10 text-cyan-500' : 'hover:bg-muted',
              )}
            >
              🏄 Spots
            </button>
            <button
              onClick={() => handleViewModeChange('amenities')}
              className={cn(
                'px-3 py-1.5 transition-colors',
                viewMode === 'amenities' ? 'bg-cyan-500/10 text-cyan-500' : 'hover:bg-muted',
              )}
            >
              🗺️ Amenities
            </button>
          </div>
        </div>

        {/* Amenity Filter Chips (visible in 'all' or 'amenities' mode) */}
        {viewMode !== 'spots' && (
          <div className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto scrollbar-none">
            <span className="text-xs text-muted-foreground shrink-0 mr-1">
              <SlidersHorizontal className="h-3 w-3 inline mr-1" />
            </span>
            <button
              onClick={() => setAmenityFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs whitespace-nowrap border transition-colors',
                amenityFilter === 'all'
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border hover:bg-muted',
              )}
            >
              All
            </button>
            {amenityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setAmenityFilter(amenityFilter === type ? 'all' : type)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs whitespace-nowrap border transition-colors flex items-center gap-1',
                  amenityFilter === type
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-border hover:bg-muted',
                )}
              >
                {amenityFilterIcons[type]}
                {amenityTypeLabels[type] || type}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content — Map + Sidebar */}
      <main className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className={cn(
          'flex-1 relative',
          selectedSpot || selectedAmenity ? 'hidden lg:block' : '',
        )}>
          {mounted ? (
            <UnifiedMap
              spots={spots}
              amenities={amenities}
              selectedSpot={selectedSpot}
              selectedAmenity={selectedAmenity}
              onSpotSelect={handleSpotSelect}
              onAmenitySelect={handleAmenitySelect}
              visibleSpotIds={visibleSpotIds}
              visibleAmenityIds={visibleAmenityIds}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <Waves className="h-12 w-12 mx-auto mb-3 animate-pulse text-cyan-400" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={cn(
          'w-full lg:w-96 border-l border-border bg-card/50 overflow-y-auto',
          selectedSpot || selectedAmenity ? 'block' : 'hidden lg:block',
        )}>
          {/* Detail View */}
          {selectedSpot && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span>{waveTypeIcons[selectedSpot.waveType]}</span>
                  {selectedSpot.name}
                </h2>
                <button
                  onClick={handleClearSelection}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Info Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                  difficultyColors[selectedSpot.difficulty],
                )}>
                  {selectedSpot.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {selectedSpot.waveType.replace('-', ' ')}
                </span>
                {selectedSpot.location.region && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {selectedSpot.location.region}
                  </span>
                )}
              </div>

              {selectedSpot.beachName && (
                <p className="text-sm text-muted-foreground mb-2">{selectedSpot.beachName}</p>
              )}

              <p className="text-sm mb-4">{selectedSpot.description}</p>

              {/* Spot Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="p-2 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Wave Type</span>
                  <span className="font-medium capitalize">{selectedSpot.waveType.replace('-', ' ')}</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Difficulty</span>
                  <span className="font-medium capitalize">{selectedSpot.difficulty}</span>
                </div>
                {selectedSpot.bestSeason && (
                  <div className="p-2 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Best Season</span>
                    <span className="font-medium">{selectedSpot.bestSeason}</span>
                  </div>
                )}
                {selectedSpot.swellDirection && (
                  <div className="p-2 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground block">Swell Dir.</span>
                    <span className="font-medium">{selectedSpot.swellDirection}</span>
                  </div>
                )}
                <div className="p-2 rounded-lg bg-muted/50 col-span-2">
                  <span className="text-xs text-muted-foreground block">Coordinates</span>
                  <span className="font-medium font-mono text-xs">
                    {selectedSpot.location.lat.toFixed(4)}, {selectedSpot.location.lon.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Nearby Amenities */}
              {spotAmenities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    Nearby Amenities ({spotAmenities.length})
                  </h3>
                  <div className="space-y-2">
                    {spotAmenities.map((amenity) => (
                      <button
                        key={amenity.id}
                        onClick={() => handleAmenitySelect(amenity)}
                        className="w-full flex items-start gap-2.5 p-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0',
                          amenityColors[amenity.type],
                        )}>
                          {amenityFilterIcons[amenity.type] || <Building2 className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{amenity.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{amenityTypeLabels[amenity.type] || amenity.type}</span>
                            {amenity.distanceFromSpot && (
                              <>
                                <span>•</span>
                                <span>{amenity.distanceFromSpot}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {spotAmenities.length === 0 && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  No amenity data yet for this spot.
                </p>
              )}
            </div>
          )}

          {/* Amenity Detail View */}
          {selectedAmenity && !selectedSpot && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">{selectedAmenity.name}</h2>
                <button
                  onClick={handleClearSelection}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  amenityColors[selectedAmenity.type],
                )}>
                  {amenityTypeLabels[selectedAmenity.type] || selectedAmenity.type}
                </span>
              </div>

              {selectedAmenity.address && (
                <p className="text-sm text-muted-foreground mb-2">{selectedAmenity.address}</p>
              )}
              {selectedAmenity.notes && (
                <p className="text-sm mb-3">{selectedAmenity.notes}</p>
              )}
              {selectedAmenity.distanceFromSpot && (
                <p className="text-sm text-muted-foreground mb-3">
                  📍 {selectedAmenity.distanceFromSpot} from surf spot
                </p>
              )}

              {/* Link to parent surf spot */}
              {parentSpot && (
                <button
                  onClick={() => handleSpotSelect(parentSpot)}
                  className="w-full flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors text-left mt-2"
                >
                  <span className="text-lg">{waveTypeIcons[parentSpot.waveType]}</span>
                  <div>
                    <p className="text-sm font-medium">Near: {parentSpot.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {parentSpot.difficulty} • {parentSpot.waveType.replace('-', ' ')} • {parentSpot.location.region}
                    </p>
                  </div>
                  <MapPin className="h-4 w-4 text-cyan-400 ml-auto shrink-0" />
                </button>
              )}

              <div className="mt-4 p-2 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground block">Coordinates</span>
                <span className="font-medium font-mono text-xs">
                  {selectedAmenity.location.lat.toFixed(4)}, {selectedAmenity.location.lon.toFixed(4)}
                </span>
              </div>
            </div>
          )}

          {/* List View (no selection) */}
          {!selectedSpot && !selectedAmenity && (
            <div className="p-4">
              {/* Tabs */}
              <div className="flex border-b border-border mb-4">
                <button
                  onClick={() => setSidebarTab('spots')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                    sidebarTab === 'spots'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  🏄 Spots ({filteredSpots.length})
                </button>
                <button
                  onClick={() => setSidebarTab('amenities')}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                    sidebarTab === 'amenities'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  🗺️ Amenities ({filteredAmenities.length})
                </button>
              </div>

              {/* Spots List */}
              {sidebarTab === 'spots' && (
                <div className="space-y-2">
                  {filteredSpots.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No spots match your search
                    </p>
                  )}
                  {filteredSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => handleSpotSelect(spot)}
                      className="w-full p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-sm flex items-center gap-1.5">
                          <span>{waveTypeIcons[spot.waveType]}</span>
                          {spot.name}
                        </h3>
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-medium',
                          difficultyColors[spot.difficulty],
                        )}>
                          {spot.difficulty}
                        </span>
                      </div>
                      {spot.beachName && (
                        <p className="text-xs text-muted-foreground mb-1">{spot.beachName}</p>
                      )}
                      <div className="flex gap-2 text-[11px] text-muted-foreground">
                        <span>{spot.location.region}</span>
                        <span>•</span>
                        <span className="capitalize">{spot.waveType.replace('-', ' ')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Amenities List */}
              {sidebarTab === 'amenities' && (
                <div className="space-y-2">
                  {filteredAmenities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No amenities match your search
                    </p>
                  )}
                  {filteredAmenities.map((amenity) => (
                    <button
                      key={amenity.id}
                      onClick={() => handleAmenitySelect(amenity)}
                      className="w-full flex items-start gap-2.5 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5',
                        amenityColors[amenity.type],
                      )}>
                        {amenityFilterIcons[amenity.type] || <Building2 className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{amenity.name}</p>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                          <span className={cn(
                            'px-1 py-0.5 rounded',
                            amenityColors[amenity.type],
                          )}>
                            {amenityTypeLabels[amenity.type] || amenity.type}
                          </span>
                          {amenity.distanceFromSpot && (
                            <span>• {amenity.distanceFromSpot} from spot</span>
                          )}
                        </div>
                        {amenity.address && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {amenity.address}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
