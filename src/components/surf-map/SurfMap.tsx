'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SurfSpot } from '@/data/surf-spots-guadeloupe';

// Fix Leaflet default icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface SurfMapProps {
  spots: SurfSpot[];
  selectedSpot?: SurfSpot | null;
  onSpotSelect?: (spot: SurfSpot) => void;
}

export default function SurfMap({ spots, selectedSpot, onSpotSelect }: SurfMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  // Guadeloupe center
  const guadeloupeCenter: L.LatLngExpression = [16.25, -61.55];
  const defaultZoom = 10;

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clean up existing map if any (handles StrictMode double-mount)
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    
    // Create new map
    const map = L.map(containerRef.current).setView(guadeloupeCenter, defaultZoom);
    mapRef.current = map;
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty deps - only init once

  // Update markers when spots change
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add new markers
    spots.forEach(spot => {
      const marker = L.marker([spot.location.lat, spot.location.lon], { icon: defaultIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.25rem;">${spot.name}</h3>
            ${spot.beachName ? `<p style="color: #666; font-size: 0.875rem; margin-bottom: 0.25rem;">${spot.beachName}</p>` : ''}
            <p style="font-size: 0.875rem;"><strong>Type:</strong> ${spot.waveType}</p>
            <p style="font-size: 0.875rem;"><strong>Level:</strong> ${spot.difficulty}</p>
            ${spot.bestSeason ? `<p style="font-size: 0.875rem;"><strong>Best:</strong> ${spot.bestSeason}</p>` : ''}
            <p style="font-size: 0.875rem; margin-top: 0.5rem; color: #555;">${spot.description}</p>
          </div>
        `);
      
      marker.on('click', () => {
        onSpotSelect?.(spot);
      });
      
      markersRef.current.push(marker);
    });
  }, [spots, onSpotSelect]);

  // Recenter map when selected spot changes
  useEffect(() => {
    if (!mapRef.current || !selectedSpot) return;
    
    mapRef.current.setView(
      [selectedSpot.location.lat, selectedSpot.location.lon],
      12,
      { animate: true }
    );
  }, [selectedSpot]);

  return (
    <div 
      ref={containerRef} 
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      className="z-0"
    />
  );
}