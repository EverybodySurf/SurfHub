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
  beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#f97316', expert: '#ef4444',
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
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = isDark
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

    const map = L.map(containerRef.current, { zoomControl: false }).setView(guadeloupeCenter, defaultZoom);
    mapRef.current = map;
    L.tileLayer(tileUrl, { attribution }).addTo(map);
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
      m.bindPopup(`<div style="min-width:200px;"><h3 style="font-weight:bold;font-size:1.1rem;margin-bottom:0.25rem;">${spot.name}</h3>${spot.beachName ? `<p style="color:#666;font-size:0.875rem;">${spot.beachName}</p>` : ''}<p style="font-size:0.875rem;"><strong>Type:</strong> ${spot.waveType}</p><p style="font-size:0.875rem;"><strong>Level:</strong> ${spot.difficulty}</p>${spot.bestSeason ? `<p style="font-size:0.875rem;"><strong>Best:</strong> ${spot.bestSeason}</p>` : ''}<p style="font-size:0.8rem;margin-top:0.5rem;color:#555;">${spot.description.replace(/'/g, '&#39;')}</p></div>`);
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
      m.bindPopup(`<div style="min-width:180px;"><p style="font-size:0.9rem;"><strong>${label}</strong></p><h4 style="font-weight:bold;margin:0.25rem 0;">${amenity.name}</h4>${amenity.address ? `<p style="font-size:0.8rem;color:#666;">${amenity.address}</p>` : ''}${amenity.distanceFromSpot ? `<p style="font-size:0.8rem;color:#666;">${amenity.distanceFromSpot} from surf spot</p>` : ''}${amenity.notes ? `<p style="font-size:0.8rem;margin-top:0.25rem;">${amenity.notes}</p>` : ''}</div>`);
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
      {/* Custom zoom controls */}
      <div ref={zoomContainerRef} className="absolute top-16 left-4 z-[1000] flex flex-col gap-1">
        <button className="custom-zoom-in h-10 w-10 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white flex items-center justify-center text-xl font-bold transition-colors shadow-md cursor-pointer border-none" aria-label="Zoom in">+</button>
        <button className="custom-zoom-out h-10 w-10 rounded-xl bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white flex items-center justify-center text-xl font-bold transition-colors shadow-md cursor-pointer border-none" aria-label="Zoom out">−</button>
      </div>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} className="z-0 rounded-lg" />
    </div>
  );
}
