'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { SurfSpot, guadeloupeSurfSpots } from '@/data/surf-spots-guadeloupe';
import { Amenity, guadeloupeAmenities, amenityColors, amenityTypeLabels } from '@/data/amenities-guadeloupe';
import { MapPin, Waves, Search, X, SlidersHorizontal, Coffee, UtensilsCrossed, ShoppingBag, Fuel, Building2, Waves as WaveIcon, Car, Bed } from 'lucide-react';
import { AmenityRating } from '@/components/amenity-rating';
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
  beginner: 'bg-lime-200 text-lime-900 border-lime-300',
  intermediate: 'bg-yellow-200 text-yellow-900 border-yellow-300',
  advanced: 'bg-orange-200 text-orange-900 border-orange-300',
  expert: 'bg-rose-200 text-rose-900 border-rose-300',
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
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedSpot, setSelectedSpot] = useState<SurfSpot | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'spots' | 'amenities'>('spots');
  const [menuOpen, setMenuOpen] = useState(false); // Mobile filter menu
  const sheetStartY = useRef(0);
  const [sheetOffset, setSheetOffset] = useState(0);

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

  // Filter amenities by search + selected types
  const filteredAmenities = useMemo(() => {
    // In 'spots' mode, only show amenities if amenity type filters are active
    if (viewMode === 'spots' && selectedTypes.size === 0) return [];
    let list = amenities;
    if (selectedTypes.size > 0) {
      list = list.filter((a) => selectedTypes.has(a.type));
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
  }, [amenities, searchQuery, viewMode, selectedTypes]);

  // Visible spot/amenity IDs for map
  const visibleSpotIds = useMemo(() => {
    if (viewMode === 'amenities') {
      // If an amenity is selected, show its parent spot only
      if (selectedAmenity) {
        return new Set([selectedAmenity.spotId]);
      }
      // No spots when in amenities-only mode
      return new Set();
    }
    // When filtering by amenity type, hide spots so filtered amenities are clear
    if (viewMode === 'all' && selectedTypes.size > 0) {
      return new Set();
    }
    return new Set(filteredSpots.map((s) => s.id));
  }, [filteredSpots, viewMode, selectedAmenity, spots, selectedTypes]);

  const visibleAmenityIds = useMemo(() => {
    if (viewMode === 'spots') {
      // If amenity type filters are active, show filtered amenities alongside spots
      if (selectedTypes.size > 0) {
        return new Set(filteredAmenities.map((a) => a.id));
      }
      // Show amenities for the selected spot only (default)
      if (selectedSpot) {
        return new Set(
          amenities.filter((a) => a.spotId === selectedSpot.id).map((a) => a.id),
        );
      }
      return new Set();
    }
    return new Set(filteredAmenities.map((a) => a.id));
  }, [filteredAmenities, viewMode, selectedSpot, amenities, selectedTypes]);

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
      {/* Top Bar — hidden, FAB replaces it */}
      <header className="hidden">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <MapPin className="h-5 w-5 text-cyan-400 shrink-0" />
        </div>
      </header>

      {/* Map Menu FAB — visible on all screens */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-row items-center gap-3">
        {/* Active filter indicator */}
        {(viewMode !== 'all' || selectedTypes.size > 0 || searchQuery) && (
          <div className="rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg p-[1.5px]">
            <button
              onClick={() => { setSearchQuery(''); setViewMode('all'); setSelectedTypes(new Set()); }}
              className="bg-white text-black dark:text-white text-xs px-3 py-1.5 rounded-full w-full h-full"
            >
              Clear filters
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all shrink-0"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <SlidersHorizontal className="h-6 w-6" />}
        </button>
      </div>

      {/* Filter Sheet — works on all screens */}
      <div className={cn(
        'fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm transition-opacity duration-300',
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      )} onClick={() => setMenuOpen(false)}>
        <div 
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-5 pb-8 max-h-[70vh] overflow-y-auto',
            menuOpen ? 'translate-y-0' : 'translate-y-full',
          )}
          style={{ 
            overscrollBehavior: 'contain',
            transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
            ...(sheetOffset > 0 ? { transform: `translateY(${sheetOffset}px)` } : {})
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => { sheetStartY.current = e.touches[0].clientY; }}
          onTouchMove={(e) => {
            const dy = e.touches[0].clientY - sheetStartY.current;
            if (dy > 0) {
              e.preventDefault();
              setSheetOffset(dy);
            }
          }}
          onTouchEnd={() => {
            if (sheetOffset > 80) {
              navigator.vibrate?.(10);
              setMenuOpen(false);
            }
            setSheetOffset(0);
          }}
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
          
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
            Map Filters
          </h3>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search spots, cafes, shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50"
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
          <div className="flex rounded-xl border border-border overflow-hidden text-sm font-medium mb-4">
            <button
              onClick={() => handleViewModeChange('all')}
              className={cn(
                'flex-1 py-2.5 text-center transition-colors',
                viewMode === 'all' ? 'bg-cyan-500/10 text-cyan-500 font-semibold' : 'hover:bg-muted',
              )}
            >
              All
            </button>
            <button
              onClick={() => handleViewModeChange('spots')}
              className={cn(
                'flex-1 py-2.5 text-center border-x border-border transition-colors',
                viewMode === 'spots' ? 'bg-cyan-500/10 text-cyan-500 font-semibold' : 'hover:bg-muted',
              )}
            >
              🏄 Spots
            </button>
            <button
              onClick={() => handleViewModeChange('amenities')}
              className={cn(
                'flex-1 py-2.5 text-center transition-colors',
                viewMode === 'amenities' ? 'bg-cyan-500/10 text-cyan-500 font-semibold' : 'hover:bg-muted',
              )}
            >
              🗺️ Amenities
            </button>
          </div>

          {/* Amenity Filter Chips — Multi-select */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Filter by type (tap multiple):</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (selectedTypes.size === 0) {
                    // Deselect All — populate with all types so chips light up individually
                    setSelectedTypes(new Set(amenityTypes));
                  } else {
                    // Select All — clear all selections
                    setSelectedTypes(new Set());
                  }
                }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  selectedTypes.size === 0
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-border hover:bg-muted',
                )}
              >
                All/None
              </button>
              {amenityTypes.map((type) => {
                const isActive = selectedTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => {
                      const next = new Set(selectedTypes);
                      if (next.has(type)) next.delete(type); else next.add(type);
                      setSelectedTypes(next);
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1',
                      isActive
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    {amenityFilterIcons[type]}
                    {amenityTypeLabels[type] || type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons row */}
          <div className="mt-5 flex gap-3">
            <div className="flex-1 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 p-[1.5px]">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setViewMode('all');
                  setSelectedTypes(new Set());
                  // Keep menu open so user can continue filtering
                }}
                className="w-full py-2.5 rounded-xl bg-white dark:bg-gray-900 text-sm font-medium text-black dark:text-white hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-colors"
              >
                Clear all
              </button>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="flex-[2] py-2.5 rounded-xl bg-cyan-500 text-white font-medium text-sm active:scale-[0.98] transition-transform"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>

      {/* Main Content — Map + Sidebar */}
      <main className="flex-1 flex overflow-hidden">
        {/* Map — always full width on all screens */}
        <div className="flex-1 relative">
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

        {/* Detail panel backdrop */}
        {(selectedSpot || selectedAmenity) && (
          <div
            className="fixed inset-0 top-0 z-[1050] bg-black/20 backdrop-blur-[1px]"
            onClick={handleClearSelection}
          />
        )}

        {/* Detail Panel — overlays map when something is selected */}
        <aside className={cn(
          'fixed right-0 top-16 bottom-0 z-[1060] w-full sm:w-96 bg-card/95 backdrop-blur-lg border-l border-border shadow-2xl overflow-y-auto transition-transform duration-300',
          selectedSpot || selectedAmenity ? 'translate-x-0' : 'translate-x-full',
        )}>
          {/* Detail View */}
          {selectedSpot && (
            <div>
              {/* Gradient accent bar */}
              <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
              
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-lg shadow-md">
                      {waveTypeIcons[selectedSpot.waveType]}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold leading-tight">{selectedSpot.name}</h2>
                      {selectedSpot.beachName && (
                        <p className="text-xs text-muted-foreground">{selectedSpot.beachName}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleClearSelection}
                    className="p-1.5 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </div>

                {/* Quick Info Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    difficultyColors[selectedSpot.difficulty],
                  )}>
                    {selectedSpot.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-br from-teal-400/10 to-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-teal-200 dark:border-teal-800">
                    {selectedSpot.waveType.replace('-', ' ')}
                  </span>
                  {selectedSpot.location.region && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {selectedSpot.location.region}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="p-3 rounded-xl bg-muted/80 mb-4">
                  <p className="text-sm leading-relaxed text-foreground/80">{selectedSpot.description}</p>
                </div>

                {/* Spot Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-sm mb-4">
                  <div className="p-3 rounded-xl bg-muted/70">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Wave Type</span>
                    <span className="font-semibold capitalize">{selectedSpot.waveType.replace('-', ' ')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/70">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Difficulty</span>
                    <span className="font-semibold capitalize">{selectedSpot.difficulty}</span>
                  </div>
                  {selectedSpot.bestSeason && (
                    <div className="p-3 rounded-xl bg-muted/70">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Best Season</span>
                      <span className="font-semibold">{selectedSpot.bestSeason}</span>
                    </div>
                  )}
                  {selectedSpot.swellDirection && (
                    <div className="p-3 rounded-xl bg-muted/70">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Swell Dir.</span>
                      <span className="font-semibold">{selectedSpot.swellDirection}</span>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-muted/70 col-span-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Coordinates</span>
                    <span className="font-semibold font-mono text-xs">
                      {selectedSpot.location.lat.toFixed(4)}, {selectedSpot.location.lon.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nearby Amenities */}
              {spotAmenities.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-teal-400/30 to-transparent" />
                    <h3 className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                      Nearby Amenities ({spotAmenities.length})
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-l from-teal-400/30 to-transparent" />
                  </div>
                  <div className="space-y-2">
                    {spotAmenities.map((amenity) => (
                      <button
                        key={amenity.id}
                        onClick={() => handleAmenitySelect(amenity)}
                        className="w-full flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:border-teal-400/30 hover:bg-gradient-to-r hover:from-teal-400/[0.03] hover:to-transparent transition-all text-left group"
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-sm',
                          amenityColors[amenity.type],
                        )}>
                          {amenityFilterIcons[amenity.type] || <Building2 className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-foreground transition-colors">{amenity.name}</p>
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
                <p className="text-xs text-muted-foreground italic mt-2 mb-2">
                  No amenity data yet for this spot.
                </p>
              )}
            </div>
          )}

          {/* Amenity Detail View */}
          {selectedAmenity && !selectedSpot && (
            <div>
              {/* Gradient accent bar */}
              <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
              
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md',
                      amenityColors[selectedAmenity.type],
                    )}>
                      {amenityFilterIcons[selectedAmenity.type] || <Building2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold leading-tight">{selectedAmenity.name}</h2>
                      <p className="text-xs text-muted-foreground">{selectedAmenity.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearSelection}
                    className="p-1.5 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </div>

                {/* Type tag */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    amenityColors[selectedAmenity.type],
                  )}>
                    {amenityTypeLabels[selectedAmenity.type] || selectedAmenity.type}
                  </span>
                </div>

                {/* Info cards */}
                <div className="space-y-2.5 mb-4">
                  {selectedAmenity.address && (
                    <div className="p-3 rounded-xl bg-muted/70">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Address</span>
                      <p className="text-sm">{selectedAmenity.address}</p>
                    </div>
                  )}
                  {selectedAmenity.notes && (
                    <div className="p-3 rounded-xl bg-muted/70">
                      <p className="text-sm">{selectedAmenity.notes}</p>
                    </div>
                  )}
                  {selectedAmenity.distanceFromSpot && (
                    <div className="p-3 rounded-xl bg-muted/70">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Distance</span>
                      <p className="text-sm">📍 {selectedAmenity.distanceFromSpot} from surf spot</p>
                    </div>
                  )}
                </div>

                {/* Rating & Verification */}
                {selectedAmenity && (
                  <AmenityRating amenityId={selectedAmenity.id} amenityName={selectedAmenity.name} />
                )}

                {/* Link to parent surf spot */}
                {parentSpot && (
                  <button
                    onClick={() => handleSpotSelect(parentSpot)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-gradient-to-br from-teal-400/5 to-cyan-500/5 hover:from-teal-400/10 hover:to-cyan-500/10 transition-all text-left mb-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-sm shadow-sm shrink-0">
                      {waveTypeIcons[parentSpot.waveType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Near: {parentSpot.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {parentSpot.difficulty} • {parentSpot.waveType.replace('-', ' ')} • {parentSpot.location.region}
                      </p>
                    </div>
                    <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                  </button>
                )}

                <div className="p-3 rounded-xl bg-muted/70">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Coordinates</span>
                  <span className="font-semibold font-mono text-xs">
                    {selectedAmenity.location.lat.toFixed(4)}, {selectedAmenity.location.lon.toFixed(4)}
                  </span>
                </div>
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
