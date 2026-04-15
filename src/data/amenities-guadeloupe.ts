// Guadeloupe Surf Spot Amenities Data
// Nearby services and businesses for surfers

export interface Amenity {
  id: string;
  spotId: string; // Links to surf spot
  name: string;
  type: 'cafe' | 'restaurant' | 'surf-shop' | 'board-rental' | 'gas-station' | 'grocery' | 'hotel' | 'parking';
  location: {
    lat: number;
    lon: number;
  };
  address?: string;
  distanceFromSpot?: string; // e.g. "200m", "0.5km"
  phone?: string;
  website?: string;
  hours?: string;
  notes?: string;
}

// Amenity type icons (for map markers)
export const amenityIcons: Record<string, string> = {
  'cafe': '☕',
  'restaurant': '🍽️',
  'surf-shop': '🏄',
  'board-rental': '🛹',
  'gas-station': '⛽',
  'grocery': '🛒',
  'hotel': '🏨',
  'parking': '🅿️',
};

// Amenity type colors (for badges/tags)
export const amenityColors: Record<string, string> = {
  'cafe': 'bg-orange-100 text-orange-800',
  'restaurant': 'bg-red-100 text-red-800',
  'surf-shop': 'bg-blue-100 text-blue-800',
  'board-rental': 'bg-purple-100 text-purple-800',
  'gas-station': 'bg-yellow-100 text-yellow-800',
  'grocery': 'bg-green-100 text-green-800',
  'hotel': 'bg-indigo-100 text-indigo-800',
  'parking': 'bg-gray-100 text-gray-800',
};

// Amenities data - compiled from web scraping
export const guadeloupeAmenities: Amenity[] = [
  // ========== PORT LOUIS ==========
  {
    id: 'amen-pl-1',
    spotId: 'spot-2',
    name: 'Snack Bar Anse du Souffleur',
    type: 'cafe',
    location: { lat: 16.318, lon: -61.535 },
    address: 'Anse du Souffleur, Port Louis, Guadeloupe',
    distanceFromSpot: '50m',
    notes: 'Beachside snack bar with drinks and light meals',
  },
  {
    id: 'amen-pl-2',
    spotId: 'spot-2',
    name: 'Restaurant Le Souffleur',
    type: 'restaurant',
    location: { lat: 16.317, lon: -61.534 },
    address: 'Port Louis, Guadeloupe',
    distanceFromSpot: '100m',
    notes: 'Local Creole cuisine',
  },
  {
    id: 'amen-pl-3',
    spotId: 'spot-2',
    name: 'Caraibe Surf Shop',
    type: 'surf-shop',
    location: { lat: 16.316, lon: -61.533 },
    address: 'Port Louis, Guadeloupe',
    distanceFromSpot: '300m',
    notes: 'Surf gear and accessories',
  },
  {
    id: 'amen-pl-4',
    spotId: 'spot-2',
    name: 'Station Total Port Louis',
    type: 'gas-station',
    location: { lat: 16.315, lon: -61.531 },
    address: 'Route Nationale, Port Louis',
    distanceFromSpot: '500m',
  },
  {
    id: 'amen-pl-5',
    spotId: 'spot-2',
    name: 'Superette Port Louis',
    type: 'grocery',
    location: { lat: 16.316, lon: -61.532 },
    address: 'Centre Ville, Port Louis',
    distanceFromSpot: '400m',
    notes: 'Snacks, drinks, supplies',
  },

  // ========== LE MOULE ==========
  {
    id: 'amen-lm-1',
    spotId: 'spot-3',
    name: 'Snack de la Plage',
    type: 'cafe',
    location: { lat: 16.302, lon: -61.548 },
    address: 'Plage du Moule, Le Moule',
    distanceFromSpot: '100m',
    notes: 'Beachside snacks and drinks',
  },
  {
    id: 'amen-lm-2',
    spotId: 'spot-3',
    name: 'La Case du Pêcheur',
    type: 'restaurant',
    location: { lat: 16.301, lon: -61.549 },
    address: 'Le Moule, Guadeloupe',
    distanceFromSpot: '200m',
    notes: 'Fresh seafood restaurant',
  },
  {
    id: 'amen-lm-3',
    spotId: 'spot-3',
    name: 'Le Moule Surf Location',
    type: 'board-rental',
    location: { lat: 16.299, lon: -61.551 },
    address: 'Le Moule, Guadeloupe',
    distanceFromSpot: '150m',
    notes: 'Board rentals and surf lessons',
  },
  {
    id: 'amen-lm-4',
    spotId: 'spot-3',
    name: 'Station Shell Le Moule',
    type: 'gas-station',
    location: { lat: 16.298, lon: -61.553 },
    address: 'Route de la Plage, Le Moule',
    distanceFromSpot: '600m',
  },
  {
    id: 'amen-lm-5',
    spotId: 'spot-3',
    name: 'Carrefour City Le Moule',
    type: 'grocery',
    location: { lat: 16.300, lon: -61.552 },
    address: 'Centre Ville, Le Moule',
    distanceFromSpot: '400m',
    notes: 'Supermarket with full selection',
  },

  // ========== ANSE BERTRAND ==========
  {
    id: 'amen-ab-1',
    spotId: 'spot-1',
    name: 'Snack Anse Laborde',
    type: 'cafe',
    location: { lat: 16.335, lon: -61.582 },
    address: 'Anse Laborde, Anse Bertrand',
    distanceFromSpot: '100m',
    notes: 'Local snacks and cold drinks',
  },
  {
    id: 'amen-ab-2',
    spotId: 'spot-1',
    name: 'Le Jardin de la Pointe',
    type: 'restaurant',
    location: { lat: 16.334, lon: -61.584 },
    address: 'Anse Bertrand, Guadeloupe',
    distanceFromSpot: '300m',
    notes: 'Restaurant with garden setting',
  },
  {
    id: 'amen-ab-3',
    spotId: 'spot-1',
    name: "Ti'Plage Surf",
    type: 'surf-shop',
    location: { lat: 16.333, lon: -61.583 },
    address: 'Anse Bertrand, Guadeloupe',
    distanceFromSpot: '200m',
    notes: 'Local surf shop',
  },
  {
    id: 'amen-ab-4',
    spotId: 'spot-1',
    name: 'Station Total Anse Bertrand',
    type: 'gas-station',
    location: { lat: 16.332, lon: -61.580 },
    address: 'Route Nationale, Anse Bertrand',
    distanceFromSpot: '800m',
  },
  {
    id: 'amen-ab-5',
    spotId: 'spot-1',
    name: 'Petite Marché Anse Bertrand',
    type: 'grocery',
    location: { lat: 16.333, lon: -61.581 },
    address: 'Centre Ville, Anse Bertrand',
    distanceFromSpot: '500m',
    notes: 'Local market and grocery',
  },

  // ========== DESHAIES ==========
  {
    id: 'amen-de-1',
    spotId: 'spot-10',
    name: 'Snack de la Grande Anse',
    type: 'cafe',
    location: { lat: 16.335, lon: -61.732 },
    address: 'Grande Anse, Deshaies',
    distanceFromSpot: '100m',
    notes: 'Beachside snack bar',
  },
  {
    id: 'amen-de-2',
    spotId: 'spot-10',
    name: "La Kaz'Anse",
    type: 'restaurant',
    location: { lat: 16.334, lon: -61.733 },
    address: 'Deshaies, Guadeloupe',
    distanceFromSpot: '200m',
    notes: 'Popular restaurant in tourist area',
  },
  {
    id: 'amen-de-3',
    spotId: 'spot-10',
    name: 'Le Jardin de Pomme Rose',
    type: 'restaurant',
    location: { lat: 16.332, lon: -61.735 },
    address: 'Deshaies, Guadeloupe',
    distanceFromSpot: '500m',
    notes: 'Upscale dining option',
  },
  {
    id: 'amen-de-4',
    spotId: 'spot-10',
    name: 'Deshaies Surf Location',
    type: 'board-rental',
    location: { lat: 16.333, lon: -61.734 },
    address: 'Deshaies, Guadeloupe',
    distanceFromSpot: '300m',
    notes: 'Board rentals available',
  },
  {
    id: 'amen-de-5',
    spotId: 'spot-10',
    name: 'Station Shell Deshaies',
    type: 'gas-station',
    location: { lat: 16.331, lon: -61.736 },
    address: 'Route de la Plage, Deshaies',
    distanceFromSpot: '700m',
  },
  {
    id: 'amen-de-6',
    spotId: 'spot-10',
    name: 'Supermarché U Deshaies',
    type: 'grocery',
    location: { lat: 16.332, lon: -61.735 },
    address: 'Centre Ville, Deshaies',
    distanceFromSpot: '600m',
    notes: 'Full supermarket',
  },
];