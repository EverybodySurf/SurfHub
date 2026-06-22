'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { SurfSpot, guadeloupeSurfSpots } from '@/data/surf-spots-guadeloupe';
import { Amenity, guadeloupeAmenities } from '@/data/amenities-guadeloupe';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { amenityTypeLabels, amenityFilterIcons } from './map-constants';
import { SpotDetailCard } from './SpotDetailCard';
import { AmenityDetailCard } from './AmenityDetailCard';
import { SpotListPanel } from './SpotListPanel';

const UnifiedMap = dynamic(() => import('@/components/surf-map/UnifiedMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/30">
      <div className="text-center animate-pulse">
        <p className="text-xs text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

type ViewMode = 'all' | 'spots' | 'amenities';

export default function SurfMapSection() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedSpot, setSelectedSpot] = useState<SurfSpot | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'spots' | 'amenities'>('spots');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mapVisible, setMapVisible] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const sheetStartY = useRef(0);
  const [sheetOffset, setSheetOffset] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  // FAB visible while map section is in view. Disappears when
  // the bottom of the map scrolls past the bottom of the header (64px).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const check = () => {
      const rect = el.getBoundingClientRect();
      // Visible when: top has entered viewport (or is above it) AND bottom hasn't scrolled past header
      setMapVisible(rect.top < window.innerHeight && rect.bottom > 64);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  const spots = guadeloupeSurfSpots;
  const amenities = guadeloupeAmenities;

  const amenityTypes = useMemo(() => Array.from(new Set(amenities.map((a) => a.type))).sort(), [amenities]);

  const filteredSpots = useMemo(() => {
    if (viewMode === 'amenities') return [];
    if (!searchQuery) return spots;
    const q = searchQuery.toLowerCase();
    return spots.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.beachName?.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.difficulty.toLowerCase().includes(q) ||
        s.waveType.toLowerCase().includes(q) ||
        s.location.region.toLowerCase().includes(q),
    );
  }, [spots, searchQuery, viewMode]);

  const filteredAmenities = useMemo(() => {
    if (viewMode === 'spots' && selectedTypes.size === 0) return [];
    let list = amenities;
    if (selectedTypes.size > 0) list = list.filter((a) => selectedTypes.has(a.type));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        [a.name, a.type, a.address, a.notes].some((f) => f?.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [amenities, searchQuery, viewMode, selectedTypes]);

  const visibleSpotIds = useMemo(() => {
    if (viewMode === 'amenities') return selectedAmenity ? new Set([selectedAmenity.spotId]) : new Set();
    if (viewMode === 'all' && selectedTypes.size > 0) return new Set();
    return new Set(filteredSpots.map((s) => s.id));
  }, [filteredSpots, viewMode, selectedAmenity, selectedTypes]);

  const visibleAmenityIds = useMemo(() => {
    if (viewMode === 'spots') {
      if (selectedTypes.size > 0) return new Set(filteredAmenities.map((a) => a.id));
      if (selectedSpot) return new Set(amenities.filter((a) => a.spotId === selectedSpot.id).map((a) => a.id));
      return new Set();
    }
    return new Set(filteredAmenities.map((a) => a.id));
  }, [filteredAmenities, viewMode, selectedSpot, amenities, selectedTypes]);

  const parentSpot = useMemo(
    () => (selectedAmenity ? spots.find((s) => s.id === selectedAmenity.spotId) : null),
    [selectedAmenity, spots],
  );

  const hasActiveFilters = viewMode !== 'all' || selectedTypes.size > 0 || searchQuery.length > 0;

  const handleSpotSelect = (spot: SurfSpot) => { setSelectedSpot(spot); setSelectedAmenity(null); setSidebarTab('spots'); };
  const handleAmenitySelect = (amenity: Amenity) => { setSelectedAmenity(amenity); setSelectedSpot(null); setSidebarTab('amenities'); };
  const clearSelection = () => { setSelectedSpot(null); setSelectedAmenity(null); };
  const clearAllFilters = () => { setSearchQuery(''); setViewMode('all'); setSelectedTypes(new Set()); };

  return (
    <div ref={sectionRef} className="h-full w-full flex flex-col bg-background overflow-hidden">
      {/* FAB — only visible when map section is in viewport */}
      <div className={`fixed bottom-6 right-4 z-[1050] flex flex-row items-center gap-3 transition-opacity duration-300 ${mapVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {hasActiveFilters && (
          <button onClick={clearAllFilters}
            className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all active:scale-95"
          >
            Clear filters
          </button>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-white shadow-xl flex items-center justify-center active:scale-95 transition-all shrink-0"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <SlidersHorizontal className="h-6 w-6" />}
        </button>
      </div>

      {/* Filter Sheet */}
      {menuOpen && <FilterSheet
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
        viewMode={viewMode} onViewModeChange={(m: ViewMode) => { setViewMode(m); clearSelection(); }}
        selectedTypes={selectedTypes} onTypesChange={setSelectedTypes}
        amenityTypes={amenityTypes}
        sheetOffset={sheetOffset} setSheetOffset={setSheetOffset}
        sheetStartY={sheetStartY}
        onClose={() => setMenuOpen(false)}
        onClearAll={clearAllFilters}
      />}

      {/* Map + Details */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          {mounted ? (
            <UnifiedMap
              spots={spots} amenities={amenities}
              selectedSpot={selectedSpot} selectedAmenity={selectedAmenity}
              onSpotSelect={handleSpotSelect} onAmenitySelect={handleAmenitySelect}
              visibleSpotIds={visibleSpotIds} visibleAmenityIds={visibleAmenityIds}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted/30">
              <div className="text-center animate-pulse">
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Detail backdrop */}
        {(selectedSpot || selectedAmenity) && (
          <div className="fixed inset-0 top-0 z-[1050] bg-black/20 backdrop-blur-[1px]" onClick={clearSelection} />
        )}

        {/* Detail panel */}
        <aside className={cn(
          'fixed right-0 top-16 bottom-0 z-[1060] w-full sm:w-96 bg-card/95 backdrop-blur-lg border-l border-border shadow-2xl overflow-y-auto transition-transform duration-300',
          selectedSpot || selectedAmenity ? 'translate-x-0' : 'translate-x-full',
        )}>
          {selectedSpot && (
            <SpotDetailCard spot={selectedSpot} amenities={amenities} onAmenitySelect={handleAmenitySelect} onClose={clearSelection} />
          )}
          {selectedAmenity && !selectedSpot && (
            <AmenityDetailCard amenity={selectedAmenity} parentSpot={parentSpot} onSpotSelect={handleSpotSelect} onClose={clearSelection} />
          )}
          {!selectedSpot && !selectedAmenity && (
            <SpotListPanel
              spots={filteredSpots} amenities={filteredAmenities}
              sidebarTab={sidebarTab} onTabChange={setSidebarTab}
              onSpotSelect={handleSpotSelect} onAmenitySelect={handleAmenitySelect}
            />
          )}
        </aside>
      </main>
    </div>
  );
}

// ═══ Filter Sheet (extracted inline) ═══

interface FilterSheetProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  selectedTypes: Set<string>;
  onTypesChange: (t: Set<string>) => void;
  amenityTypes: string[];
  sheetOffset: number;
  setSheetOffset: (n: number) => void;
  sheetStartY: React.MutableRefObject<number>;
  onClose: () => void;
  onClearAll: () => void;
}

function FilterSheet({
  searchQuery, onSearchChange,
  viewMode, onViewModeChange,
  selectedTypes, onTypesChange,
  amenityTypes,
  sheetOffset, setSheetOffset,
  sheetStartY, onClose, onClearAll,
}: FilterSheetProps) {
  return (
    <div className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-5 pb-8 max-h-[70vh] overflow-y-auto"
        style={{
          overscrollBehavior: 'contain',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          ...(sheetOffset > 0 ? { transform: `translateY(${sheetOffset}px)` } : {}),
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { sheetStartY.current = e.touches[0].clientY; }}
        onTouchMove={(e) => {
          const dy = e.touches[0].clientY - sheetStartY.current;
          if (dy > 0) { e.preventDefault(); setSheetOffset(dy); }
        }}
        onTouchEnd={() => {
          if (sheetOffset > 80) { navigator.vibrate?.(10); onClose(); }
          setSheetOffset(0);
        }}
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
          Map Filters
        </h3>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search spots, cafes, shops..."
            value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/50"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex rounded-xl border border-border overflow-hidden text-sm font-medium mb-4">
          {(['all', 'spots', 'amenities'] as ViewMode[]).map((mode) => (
            <button key={mode} onClick={() => onViewModeChange(mode)}
              className={cn('flex-1 py-2.5 text-center transition-colors', viewMode === mode ? 'bg-cyan-500/10 text-cyan-500 font-semibold' : 'hover:bg-muted', mode === 'spots' && 'border-x border-border')}
            >
              {mode === 'all' ? 'All' : mode === 'spots' ? '🏄 Spots' : '🗺️ Amenities'}
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Filter by type (tap multiple):</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={selectedTypes.size === 0} onClick={() => onTypesChange(selectedTypes.size === 0 ? new Set(amenityTypes) : new Set())}>
              All/None
            </Chip>
            {amenityTypes.map((type) => (
              <Chip key={type} active={selectedTypes.has(type)} onClick={() => { const n = new Set(selectedTypes); n.has(type) ? n.delete(type) : n.add(type); onTypesChange(n); }}>
                <span className="flex items-center gap-1">
                  {amenityFilterIcons[type]}{amenityTypeLabels[type] || type}
                </span>
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClearAll} className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all active:scale-95">
            Clear all
          </button>
          <button onClick={onClose} className="flex-[2] py-2.5 rounded-xl bg-cyan-500 text-white font-medium text-sm active:scale-[0.98] transition-transform">
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', active ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border hover:bg-muted')}
    >
      {children}
    </button>
  );
}
