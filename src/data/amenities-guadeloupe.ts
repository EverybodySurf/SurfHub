// Guadeloupe Surf Spot Amenities Data
// Nearby services and businesses for surfers
// Last updated: 2026-06-15

export interface Amenity {
  id: string;
  spotId: string; // Links to surf spot
  name: string;
  type: 'cafe' | 'restaurant' | 'surf-shop' | 'board-rental' | 'gas-station' | 'grocery' | 'hotel' | 'parking' | 'lodging';
  location: {
    lat: number;
    lon: number;
  };
  address?: string;
  distanceFromSpot?: string;
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
  'lodging': '🏠',
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
  'lodging': 'bg-teal-100 text-teal-800',
};

export const amenityTypeLabels: Record<string, string> = {
  cafe: 'Cafe',
  restaurant: 'Restaurant',
  'surf-shop': 'Surf Shop',
  'board-rental': 'Board Rental',
  'gas-station': 'Gas',
  grocery: 'Grocery',
  hotel: 'Hotel',
  parking: 'Parking',
  lodging: 'Lodging',
};


export const guadeloupeAmenities: Amenity[] = [
  // ========== PORT LOUIS (spot-2) ==========
  {
    id: 'amen-pl-1',
    spotId: 'spot-2',
    name: 'Snack Bar Anse du Souffleur',
    type: 'cafe',
    location: { lat: 16.4200, lon: -61.5320 },
    address: 'Anse du Souffleur, Port Louis',
    distanceFromSpot: '50m',
    notes: 'Beachside snack bar with drinks and light meals',
  },
  {
    id: 'amen-pl-2',
    spotId: 'spot-2',
    name: 'Restaurant Le Souffleur',
    type: 'restaurant',
    location: { lat: 16.4190, lon: -61.5300 },
    address: 'Port Louis',
    distanceFromSpot: '100m',
    notes: 'Local Creole cuisine',
  },
  {
    id: 'amen-pl-3',
    spotId: 'spot-2',
    name: 'Caraibe Surf Shop',
    type: 'surf-shop',
    location: { lat: 16.4180, lon: -61.5290 },
    address: 'Port Louis',
    distanceFromSpot: '300m',
    notes: 'Surf gear and accessories',
  },
  {
    id: 'amen-pl-4',
    spotId: 'spot-2',
    name: 'Station Total Port Louis',
    type: 'gas-station',
    location: { lat: 16.4170, lon: -61.5270 },
    address: 'Route Nationale, Port Louis',
    distanceFromSpot: '500m',
  },
  {
    id: 'amen-pl-5',
    spotId: 'spot-2',
    name: 'Superette Port Louis',
    type: 'grocery',
    location: { lat: 16.4180, lon: -61.5280 },
    address: 'Centre Ville, Port Louis',
    distanceFromSpot: '400m',
    notes: 'Snacks, drinks, supplies',
  },
  {
    id: 'amen-pl-6',
    spotId: 'spot-2',
    name: 'Gîtes du Souffleur',
    type: 'lodging',
    location: { lat: 16.4210, lon: -61.5330 },
    address: 'Port Louis',
    distanceFromSpot: '200m',
    notes: 'Beachfront guesthouses and vacation rentals',
  },

  // ========== LE MOULE / DAMENCOURT (spot-3) ==========
  {
    id: 'amen-lm-1',
    spotId: 'spot-3',
    name: 'Le Spot',
    type: 'restaurant',
    location: { lat: 16.3380, lon: -61.3615 },
    address: 'Boulevard Maritime, Damencourt, Le Moule',
    distanceFromSpot: '50m',
    notes: 'Iconic post-surf spot — directly opposite the break. Local cuisine, ocean views.'
  },
  {
    id: 'amen-lm-2',
    spotId: 'spot-3',
    name: 'Krél Bar',
    type: 'restaurant',
    location: { lat: 16.3365, lon: -61.3600 },
    address: 'ZAC de Damencourt, Le Moule',
    distanceFromSpot: '200m',
    notes: 'Modern Creole cuisine, brunch, street food in the Damencourt business zone.'
  },
  {
    id: 'amen-lm-3',
    spotId: 'spot-3',
    name: 'Le Moule Surf Location',
    type: 'board-rental',
    location: { lat: 16.3370, lon: -61.3580 },
    address: 'Le Moule',
    distanceFromSpot: '150m',
    notes: 'Board rentals and surf lessons',
  },
  {
    id: 'amen-lm-4',
    spotId: 'spot-3',
    name: 'Station Shell Le Moule',
    type: 'gas-station',
    location: { lat: 16.3350, lon: -61.3550 },
    address: 'Route de la Plage, Le Moule',
    distanceFromSpot: '600m',
  },
  {
    id: 'amen-lm-5',
    spotId: 'spot-3',
    name: 'Carrefour City Le Moule',
    type: 'grocery',
    location: { lat: 16.3360, lon: -61.3560 },
    address: 'Centre Ville, Le Moule',
    distanceFromSpot: '400m',
    notes: 'Supermarket with full selection',
  },
  {
    id: 'amen-lm-6',
    spotId: 'spot-3',
    name: 'Le Moule Surf Club',
    type: 'surf-shop',
    location: { lat: 16.3380, lon: -61.3610 },
    address: 'Damencourt, Le Moule',
    distanceFromSpot: '50m',
    notes: 'Surf school and board rentals on the beach',
  },

  // ========== ANSE BERTRAND (spot-1) ==========
  {
    id: 'amen-ab-1',
    spotId: 'spot-1',
    name: 'Le Zion',
    type: 'restaurant',
    location: { lat: 16.4735, lon: -61.5125 },
    address: 'Plage de la Chapelle, Anse-Bertrand',
    distanceFromSpot: '50m',
    notes: 'Beachfront restaurant on Plage de la Chapelle. Seafood, Creole cuisine. Popular — reserve ahead.',
  },
  {
    id: 'amen-ab-2',
    spotId: 'spot-1',
    name: 'Au Coin des Bons Amis',
    type: 'restaurant',
    location: { lat: 16.4710, lon: -61.5140 },
    address: 'Anse Laborde, Anse-Bertrand',
    distanceFromSpot: '300m',
    notes: 'Authentic local Creole. Accras, grilled fish, lobster. Beachside with ocean views.',
  },
  {
    id: 'amen-ab-3',
    spotId: 'spot-1',
    name: "Ti'Plage Surf",
    type: 'surf-shop',
    location: { lat: 16.4720, lon: -61.5140 },
    address: 'Anse Bertrand',
    distanceFromSpot: '200m',
    notes: 'Local surf shop',
  },
  {
    id: 'amen-ab-4',
    spotId: 'spot-1',
    name: 'Station Total Anse Bertrand',
    type: 'gas-station',
    location: { lat: 16.4700, lon: -61.5100 },
    address: 'Route Nationale, Anse Bertrand',
    distanceFromSpot: '800m',
  },
  {
    id: 'amen-ab-5',
    spotId: 'spot-1',
    name: 'Petite Marché Anse Bertrand',
    type: 'grocery',
    location: { lat: 16.4710, lon: -61.5110 },
    address: 'Centre Ville, Anse Bertrand',
    distanceFromSpot: '500m',
    notes: 'Local market and grocery',
  },

  // ========== DESHAIES (spot-14) ==========
  {
    id: 'amen-de-1',
    spotId: 'spot-14',
    name: 'Snack de la Grande Anse',
    type: 'cafe',
    location: { lat: 16.3110, lon: -61.7950 },
    address: 'Grande Anse, Deshaies',
    distanceFromSpot: '100m',
    notes: 'Beachside snack bar',
  },
  {
    id: 'amen-de-2',
    spotId: 'spot-14',
    name: "La Kaz'Anse",
    type: 'restaurant',
    location: { lat: 16.3100, lon: -61.7960 },
    address: 'Deshaies',
    distanceFromSpot: '200m',
    notes: 'Popular restaurant in tourist area',
  },
  {
    id: 'amen-de-3',
    spotId: 'spot-14',
    name: 'Le Jardin de Pomme Rose',
    type: 'restaurant',
    location: { lat: 16.3080, lon: -61.7980 },
    address: 'Deshaies',
    distanceFromSpot: '500m',
    notes: 'Upscale dining option',
  },
  {
    id: 'amen-de-4',
    spotId: 'spot-14',
    name: 'Deshaies Surf Location',
    type: 'board-rental',
    location: { lat: 16.3090, lon: -61.7970 },
    address: 'Deshaies',
    distanceFromSpot: '300m',
    notes: 'Board rentals available',
  },
  {
    id: 'amen-de-5',
    spotId: 'spot-14',
    name: 'Station Shell Deshaies',
    type: 'gas-station',
    location: { lat: 16.3070, lon: -61.7990 },
    address: 'Route de la Plage, Deshaies',
    distanceFromSpot: '700m',
  },
  {
    id: 'amen-de-6',
    spotId: 'spot-14',
    name: 'Supermarché U Deshaies',
    type: 'grocery',
    location: { lat: 16.3080, lon: -61.7980 },
    address: 'Centre Ville, Deshaies',
    distanceFromSpot: '600m',
    notes: 'Full supermarket',
  },

  // ========== LA PERLE (spot-13) ==========
  {
    id: 'amen-lp-1',
    spotId: 'spot-13',
    name: "Chez Loulous",
    type: 'restaurant',
    location: { lat: 16.3410, lon: -61.7790 },
    address: 'Plage de la Perle, Deshaies',
    distanceFromSpot: '50m',
    notes: 'Popular beachside restaurant on the sand at La Perle',
  },
  {
    id: 'amen-lp-2',
    spotId: 'spot-13',
    name: 'Le Madras',
    type: 'cafe',
    location: { lat: 16.3415, lon: -61.7793 },
    address: 'Plage de la Perle',
    distanceFromSpot: '100m',
    notes: 'Snack bar and café on the beach',
  },

  // ========== PETIT HAVRE (spot-7) ==========
  {
    id: 'amen-ph-1',
    spotId: 'spot-7',
    name: 'Snack Petit Havre',
    type: 'cafe',
    location: { lat: 16.2090, lon: -61.4280 },
    address: 'Plage du Petit Havre, Le Gosier',
    distanceFromSpot: '50m',
    notes: 'Beachside snack bar',
  },
  {
    id: 'amen-ph-2',
    spotId: 'spot-7',
    name: 'Restaurant Le Gosier',
    type: 'restaurant',
    location: { lat: 16.2060, lon: -61.4910 },
    address: 'Le Gosier',
    distanceFromSpot: '3km',
    notes: 'Dining options in Le Gosier town',
  },
  {
    id: 'amen-ph-3',
    spotId: 'spot-7',
    name: 'Le Gosier Surf Shop',
    type: 'surf-shop',
    location: { lat: 16.2070, lon: -61.4900 },
    address: 'Le Gosier',
    distanceFromSpot: '2.5km',
    notes: 'Surf gear and board rentals',
  },

  // ========== SAINT-FRANÇOIS HARBOUR (spot-11) ==========
  {
    id: 'amen-sf-1',
    spotId: 'spot-11',
    name: 'Marina de Saint-François',
    type: 'restaurant',
    location: { lat: 16.2520, lon: -61.2750 },
    address: 'Saint-François Marina',
    distanceFromSpot: '200m',
    notes: 'Multiple restaurants at the marina',
  },
  {
    id: 'amen-sf-2',
    spotId: 'spot-11',
    name: 'Carrefour Saint-François',
    type: 'grocery',
    location: { lat: 16.2500, lon: -61.2780 },
    address: 'Saint-François',
    distanceFromSpot: '500m',
  },

  {
    id: 'amen-de-7',
    spotId: 'spot-14',
    name: 'Langley Resort Fort Royal',
    type: 'lodging',
    location: { lat: 16.3200, lon: -61.7800 },
    address: 'Pointe du Petit-Bas-Vent, Deshaies',
    distanceFromSpot: '1.5km',
    notes: 'Beachfront resort at Plage de Bas Vent with surf school',
  },

  // ========== BANANIER (spot-16) ==========
  {
    id: 'amen-ba-1',
    spotId: 'spot-16',
    name: 'Surf School Bananier',
    type: 'surf-shop',
    location: { lat: 16.0000, lon: -61.6020 },
    address: 'Plage Salée de Bananier, Capesterre-Belle-Eau',
    distanceFromSpot: '100m',
    notes: 'Local surf school with board rentals and lessons',
  },

  // ========== ANSE SALABOUELLE (spot-4) ==========
  {
    id: 'amen-as-1',
    spotId: 'spot-4',
    name: 'Snack Salabouelle',
    type: 'cafe',
    location: { lat: 16.2960, lon: -61.3240 },
    address: 'Anse Salabouelle',
    distanceFromSpot: '50m',
    notes: 'Small beach bar',
  },
  {
    id: 'amen-as-2',
    spotId: 'spot-4',
    name: 'Parking Salabouelle',
    type: 'parking',
    location: { lat: 16.2940, lon: -61.3220 },
    address: 'Anse Salabouelle',
    distanceFromSpot: '100m',
    notes: 'Small parking area near the beach',
  },
];
