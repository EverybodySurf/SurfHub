'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SurfSpot } from '@/data/surf-spots-guadeloupe';
import { Amenity } from '@/data/amenities-guadeloupe';

// Fix Leaflet default icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Colored circle markers for amenities
const amenityMarkerColors: Record<string, string> = {
  cafe: '#f97316',       // orange
  restaurant: '#ef4444',  // red
  'surf-shop': '#3b82f6', // blue
  'board-rental': '#a855f7', // purple
  'gas-station': '#eab308', // yellow
  grocery: '#22c55e',     // green
  hotel: '#6366f1',      // indigo
  parking: '#6b7280',    // gray
  lodging: '#14b8a6',    // teal
};

const amenityTypeLabels: Record<string, string> = {
  cafe: '☕ Cafe',
  restaurant: '🍽️ Restaurant',
  'surf-shop': '🏄 Surf Shop',
  'board-rental': '🛹 Board Rental',
  'gas-station': '⛽ Gas Station',
  grocery: '🛒 Grocery',
  hotel: '🏨 Hotel',
  parking: '🅿️ Parking',
  lodging: '🏠 Lodging',
};

// Difficulty colors for spot markers
const difficultyColors: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#f97316',
  expert: '#ef4444',
};

interface UnifiedMapProps {
  spots: SurfSpot[];
  amenities: Amenity[];
  selectedSpot?: SurfSpot | null;
  selectedAmenity?: Amenity | null;
  onSpotSelect?: (spot: SurfSpot) => void;
  onAmenitySelect?: (amenity: Amenity) => void;
  visibleSpotIds?: Set<string>;
  visibleAmenityIds?: Set<string>;
  centerOn?: { lat: number; lon: number } | null;
}

export default function UnifiedMap({
  spots,
  amenities,
  selectedSpot,
  selectedAmenity,
  onSpotSelect,
  onAmenitySelect,
  visibleSpotIds,
  visibleAmenityIds,
  centerOn,
}: UnifiedMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spotMarkersRef = useRef<L.Marker[]>([]);
  const amenityMarkersRef = useRef<L.CircleMarker[]>([]);

  const guadeloupeCenter: L.LatLngExpression = [16.25, -61.55];
  const defaultZoom = 10;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current).setView(guadeloupeCenter, defaultZoom);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update spot markers
  useEffect(() => {
    if (!mapRef.current) return;

    spotMarkersRef.current.forEach((m) => m.remove());
    spotMarkersRef.current = [];

    const filteredSpots = visibleSpotIds
      ? spots.filter((s) => visibleSpotIds.has(s.id))
      : spots;

    filteredSpots.forEach((spot) => {
      const color = difficultyColors[spot.difficulty] || '#3b82f6';

      // Custom icon with colored circle
      const spotIcon = L.divIcon({
        className: '',
        html: `<div style="
          width: 28px; height: 28px;
          background: ${color};
          border: 3px solid ${selectedSpot?.id === spot.id ? '#fff' : 'rgba(255,255,255,0.8)'};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: white; font-weight: bold;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        ">🏄</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([spot.location.lat, spot.location.lon], { icon: spotIcon }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.25rem;">${spot.name}</h3>
          ${spot.beachName ? `<p style="color: #666; font-size: 0.875rem;">${spot.beachName}</p>` : ''}
          <p style="font-size: 0.875rem;"><strong>Type:</strong> ${spot.waveType}</p>
          <p style="font-size: 0.875rem;"><strong>Level:</strong> ${spot.difficulty}</p>
          ${spot.bestSeason ? `<p style="font-size: 0.875rem;"><strong>Best:</strong> ${spot.bestSeason}</p>` : ''}
          <p style="font-size: 0.8rem; margin-top: 0.5rem; color: #555;">${spot.description.replace(/'/g, '&#39;')}</p>
        </div>
      `);

      marker.on('click', () => onSpotSelect?.(spot));
      spotMarkersRef.current.push(marker);
    });
  }, [spots, selectedSpot, onSpotSelect, visibleSpotIds]);

  // Update amenity markers
  useEffect(() => {
    if (!mapRef.current) return;

    amenityMarkersRef.current.forEach((m) => m.remove());
    amenityMarkersRef.current = [];

    const filteredAmenities = visibleAmenityIds
      ? amenities.filter((a) => visibleAmenityIds.has(a.id))
      : amenities;

    filteredAmenities.forEach((amenity) => {
      const color = amenityMarkerColors[amenity.type] || '#6b7280';
      const isSelected = selectedAmenity?.id === amenity.id;

      const circleMarker = L.circleMarker([amenity.location.lat, amenity.location.lon], {
        radius: isSelected ? 10 : 8,
        fillColor: color,
        color: isSelected ? '#fff' : color,
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapRef.current!);

      const label = amenityTypeLabels[amenity.type] || amenity.type;
      circleMarker.bindPopup(`
        <div style="min-width: 180px;">
          <p style="font-size: 0.9rem;"><strong>${label}</strong></p>
          <h4 style="font-weight: bold; margin: 0.25rem 0;">${amenity.name}</h4>
          ${amenity.address ? `<p style="font-size: 0.8rem; color: #666;">${amenity.address}</p>` : ''}
          ${amenity.distanceFromSpot ? `<p style="font-size: 0.8rem; color: #666;">${amenity.distanceFromSpot} from surf spot</p>` : ''}
          ${amenity.notes ? `<p style="font-size: 0.8rem; margin-top: 0.25rem;">${amenity.notes}</p>` : ''}
        </div>
      `);

      circleMarker.on('click', () => onAmenitySelect?.(amenity));
      amenityMarkersRef.current.push(circleMarker);
    });
  }, [amenities, selectedAmenity, onAmenitySelect, visibleAmenityIds]);

  // Recenter on selection
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedAmenity) {
      mapRef.current.setView(
        [selectedAmenity.location.lat, selectedAmenity.location.lon],
        14,
        { animate: true },
      );
    } else if (selectedSpot) {
      mapRef.current.setView(
        [selectedSpot.location.lat, selectedSpot.location.lon],
        12,
        { animate: true },
      );
    } else if (centerOn) {
      mapRef.current.setView([centerOn.lat, centerOn.lon], 12, { animate: true });
    }
  }, [selectedSpot, selectedAmenity, centerOn]);

  return (
    <div
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
      className="z-0 rounded-lg"
    />
  );
}
