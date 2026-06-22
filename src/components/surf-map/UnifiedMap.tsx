'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SurfSpot } from '@/data/surf-spots-guadeloupe';
import { Amenity } from '@/data/amenities-guadeloupe';

const amenityMarkerColors: Record<string, string> = {
  cafe: '#f97316', restaurant: '#ef4444', 'surf-shop': '#3b82f6',
  'board-rental': '#a855f7', 'gas-station': '#eab308', grocery: '#22c55e',
  hotel: '#6366f1', parking: '#6b7280', lodging: '#14b8a6',
};

const amenityMarkerEmojis: Record<string, string> = {
  cafe: '☕', restaurant: '🍽️', 'surf-shop': '🏄', 'board-rental': '🛹',
  'gas-station': '⛽', grocery: '🛒', hotel: '🏨', parking: '🅿️', lodging: '🏠',
};

const amenityTypeLabels: Record<string, string> = {
  cafe: '☕ Cafe', restaurant: '🍽️ Restaurant', 'surf-shop': '🏄 Surf Shop',
  'board-rental': '🛹 Board Rental', 'gas-station': '⛽ Gas Station',
  grocery: '🛒 Grocery', hotel: '🏨 Hotel', parking: '🅿️ Parking', lodging: '🏠 Lodging',
};

const difficultyColors: Record<string, string> = {
  beginner: '#39ff14', intermediate: '#ffea00', advanced: '#ff5e00', expert: '#ff0040',
};

interface UnifiedMapProps {
  spots: SurfSpot[]; amenities: Amenity[];
  selectedSpot?: SurfSpot | null; selectedAmenity?: Amenity | null;
  onSpotSelect?: (spot: SurfSpot) => void; onAmenitySelect?: (amenity: Amenity) => void;
  visibleSpotIds?: Set<string>; visibleAmenityIds?: Set<string>;
  centerOn?: { lat: number; lon: number } | null;
}

export default function UnifiedMap({
  spots, amenities, selectedSpot, selectedAmenity,
  onSpotSelect, onAmenitySelect, visibleSpotIds, visibleAmenityIds, centerOn,
}: UnifiedMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spotMarkersRef = useRef<L.Marker[]>([]);
  const amenityMarkersRef = useRef<L.Marker[]>([]);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const guadeloupeCenter: L.LatLngExpression = [16.25, -61.55];
  const defaultZoom = 10;

  // Init map with dark/light tile layer — rebuilds on theme switch
  useEffect(() => {
    if (!containerRef.current) return;

    function buildMap() {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      const isDark = document.documentElement.classList.contains('dark');
    const map = L.map(containerRef.current, { zoomControl: false }).setView(guadeloupeCenter, defaultZoom);
    mapRef.current = map;

    if (isDark) {
      // Dark mode: CartoDB dark_all + hillshading for terrain + labels overlay
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
      }).addTo(map);
      L.tileLayer('https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png', {
        opacity: 0.3,
        attribution: 'Hillshading: &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);
    }
    }

    buildMap();

    // Rebuild when theme changes
    const observer = new MutationObserver(() => buildMap());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // Wire zoom buttons
  useEffect(() => {
    if (!mapRef.current || !zoomContainerRef.current) return;
    const zi = zoomContainerRef.current.querySelector('.custom-zoom-in') as HTMLElement;
    const zo = zoomContainerRef.current.querySelector('.custom-zoom-out') as HTMLElement;
    if (zi) zi.onclick = () => mapRef.current?.zoomIn();
    if (zo) zo.onclick = () => mapRef.current?.zoomOut();
  }, []);

  // Spot markers — use divIcon with colored circles
  useEffect(() => {
    if (!mapRef.current) return;
    spotMarkersRef.current.forEach((m) => m.remove());
    spotMarkersRef.current = [];
    const filtered = visibleSpotIds ? spots.filter((s) => visibleSpotIds.has(s.id)) : spots;

    filtered.forEach((spot) => {
      const color = difficultyColors[spot.difficulty] || '#3b82f6';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;background:${color};border:3px solid ${selectedSpot?.id === spot.id ? '#fff' : 'rgba(255,255,255,0.8)'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:white;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;">🏄</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14],
      });
      const m = L.marker([spot.location.lat, spot.location.lon], { icon }).addTo(mapRef.current!);
      m.bindTooltip(`<div class="marker-hover-card"><h4>${spot.name}</h4><p class="card-meta">${spot.difficulty} • ${spot.waveType.replace('-', ' ')}${spot.beachName ? `<br/>${spot.beachName}` : ''}${spot.swellDirection ? `<br/>Swell: ${spot.swellDirection}` : ''}${spot.bestSeason ? `<br/>Best: ${spot.bestSeason}` : ''}</p><div class="card-desc">${spot.description.replace(/'/g, '&#39;')}</div><div class="card-footer">Tap for details</div></div>`, { sticky: true, offset: [0, -10], className: 'tooltip-brand' });
      m.on('click', () => onSpotSelect?.(spot));
      spotMarkersRef.current.push(m);
    });
  }, [spots, selectedSpot, onSpotSelect, visibleSpotIds]);

  // Amenity markers — use divIcon with smaller colored circles
  useEffect(() => {
    if (!mapRef.current) return;
    amenityMarkersRef.current.forEach((m) => m.remove());
    amenityMarkersRef.current = [];
    const filtered = visibleAmenityIds ? amenities.filter((a) => visibleAmenityIds.has(a.id)) : amenities;

    filtered.forEach((amenity) => {
      const color = amenityMarkerColors[amenity.type] || '#6b7280';
      const isSelected = selectedAmenity?.id === amenity.id;
      const size = isSelected ? 26 : 20;
      const emoji = amenityMarkerEmojis[amenity.type] || '•';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:${isSelected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.9)'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${isSelected ? 12 : 10}px;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;">${emoji}</div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });
      const m = L.marker([amenity.location.lat, amenity.location.lon], { icon }).addTo(mapRef.current!);
      const label = amenityTypeLabels[amenity.type] || amenity.type;
      m.bindTooltip(`<div class="marker-hover-card"><h4>${emoji} ${amenity.name}</h4><p class="card-meta">${label}${amenity.address ? `<br/>${amenity.address}` : ''}${amenity.distanceFromSpot ? `<br/>${amenity.distanceFromSpot} from spot` : ''}${amenity.notes ? `<br/>${amenity.notes.replace(/'/g, '&#39;')}` : ''}</p><div class="card-footer">Tap for details</div></div>`, { sticky: true, offset: [0, -10], className: 'tooltip-brand' });
      m.on('click', () => onAmenitySelect?.(amenity));
      amenityMarkersRef.current.push(m);
    });
  }, [amenities, selectedAmenity, onAmenitySelect, visibleAmenityIds]);

  // Center on selection
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedAmenity) mapRef.current.setView([selectedAmenity.location.lat, selectedAmenity.location.lon], 14, { animate: true });
    else if (selectedSpot) mapRef.current.setView([selectedSpot.location.lat, selectedSpot.location.lon], 12, { animate: true });
    else if (centerOn) mapRef.current.setView([centerOn.lat, centerOn.lon], 12, { animate: true });
  }, [selectedSpot, selectedAmenity, centerOn]);

  return (
    <div className="relative h-full w-full">
      {/* Brand tooltip styles */}
      <style>{`
        .leaflet-tooltip.tooltip-brand {
          background: var(--tooltip-bg, #fff);
          border: none;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          padding: 0;
          max-width: 260px;
        }
        .leaflet-tooltip.tooltip-brand::before {
          border-top-color: var(--tooltip-bg, #fff);
        }
        .marker-hover-card {
          padding: 12px 14px;
          font-family: inherit;
        }
        .marker-hover-card h4 {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #111;
          line-height: 1.3;
        }
        .marker-hover-card .card-meta {
          font-size: 11px;
          color: #666;
          margin: 0 0 6px 0;
          line-height: 1.5;
        }
        .marker-hover-card .card-desc {
          font-size: 11px;
          color: #444;
          line-height: 1.5;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .marker-hover-card .card-footer {
          font-size: 10px;
          color: #3b82f6;
          font-weight: 500;
          padding-top: 6px;
          border-top: 1px solid #f0f0f0;
        }
        .dark .leaflet-tooltip.tooltip-brand {
          --tooltip-bg: #1f2937;
          background: var(--tooltip-bg);
          color: #e5e7eb;
        }
        .dark .marker-hover-card h4 { color: #f3f4f6; }
        .dark .marker-hover-card .card-meta { color: #9ca3af; }
        .dark .marker-hover-card .card-desc { color: #d1d5db; }
        .dark .marker-hover-card .card-footer { color: #60a5fa; border-top-color: #374151; }
      `}</style>
      {/* Custom zoom controls */}
      <div ref={zoomContainerRef} className="absolute top-24 sm:top-16 right-4 z-[1000] flex flex-col gap-1">
        <button className="custom-zoom-in h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 active:from-teal-600 active:to-cyan-700 text-white flex items-center justify-center text-lg font-bold transition-all shadow-md cursor-pointer border-none" aria-label="Zoom in">+</button>
        <button className="custom-zoom-out h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 active:from-teal-600 active:to-cyan-700 text-white flex items-center justify-center text-lg font-bold transition-all shadow-md cursor-pointer border-none" aria-label="Zoom out">−</button>
      </div>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} className="z-0 rounded-lg" />
    </div>
  );
}
