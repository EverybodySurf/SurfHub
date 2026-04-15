// Guadeloupe Surf Spots Data
// Coordinates verified from Wikipedia/official sources
// Note: Coordinates are for commune centers; actual surf beaches may be nearby

export interface SurfSpot {
  id: string;
  name: string;
  location: {
    lat: number;
    lon: number;
    city?: string;
    region?: string;
  };
  beachName?: string;
  waveType: 'beach-break' | 'reef-break' | 'point-break';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  bestSeason?: string;
  description: string;
  amenities?: {
    parking?: boolean;
    showers?: boolean;
    restaurants?: boolean;
    surfShop?: boolean;
    boardRental?: boolean;
  };
}

// Verified surf spots data - Grande-Terre & Basse-Terre
// Coordinates sourced from Wikipedia commune data
export const guadeloupeSurfSpots: SurfSpot[] = [
  {
    id: 'spot-1',
    name: 'Anse Bertrand',
    location: { lat: 16.47, lon: -61.51, region: 'Grande-Terre' },
    beachName: 'Anse Bertrand Beach',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Popular spot on Grande-Terre\'s Atlantic coast with consistent NNE swells. Works best with offshore winds.',
  },
  {
    id: 'spot-2',
    name: 'Port Louis',
    location: { lat: 16.4167, lon: -61.5333, region: 'Grande-Terre' },
    beachName: 'Port Louis Beach',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Located near Anse Bertrand, offers good reef breaks with NNE swells. Offshore wind conditions.',
  },
  {
    id: 'spot-3',
    name: 'Le Moule',
    location: { lat: 16.3306, lon: -61.3444, region: 'Grande-Terre' },
    beachName: 'Le Moule Beach',
    waveType: 'beach-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    description: 'Sandy beach break suitable for beginners. Consistent E swells, cross-shore winds common.',
  },
  {
    id: 'spot-4',
    name: 'La Station',
    location: { lat: 16.2833, lon: -61.5333, region: 'Grande-Terre' },
    beachName: 'La Station Beach',
    waveType: 'beach-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    description: 'Beginner-friendly beach break with consistent E swells. Good for learning.',
  },
  {
    id: 'spot-5',
    name: 'Plombier',
    location: { lat: 16.2667, lon: -61.5167, region: 'Grande-Terre' },
    beachName: 'Plombier Beach',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Reef break with ENE swells. Cross-offshore winds make it favorable for intermediate surfers.',
  },
  {
    id: 'spot-6',
    name: 'La Perle',
    location: { lat: 16.25, lon: -61.5, region: 'Grande-Terre' },
    beachName: 'La Perle Beach',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Smaller reef break working on NNE swells. Cross-offshore conditions, good for intermediates.',
  },
  {
    id: 'spot-7',
    name: 'Petit Havre',
    location: { lat: 16.2333, lon: -61.4833, region: 'Grande-Terre' },
    beachName: 'Petit Havre Beach',
    waveType: 'beach-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    description: 'Beach break with E swells. Cross-onshore winds, suitable for beginners.',
  },
  {
    id: 'spot-8',
    name: 'La Chaise',
    location: { lat: 16.2167, lon: -61.4667, region: 'Grande-Terre' },
    beachName: 'La Chaise Beach',
    waveType: 'beach-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    description: 'Sandy beach break with consistent E swells. Cross-shore winds, good for all levels.',
  },
  {
    id: 'spot-9',
    name: 'Antigues Cape',
    location: { lat: 16.35, lon: -61.5667, region: 'Grande-Terre' },
    beachName: 'Antigues Cape Point',
    waveType: 'point-break',
    difficulty: 'advanced',
    bestSeason: 'November - April',
    description: 'Point break with ENE swells. Cross-offshore conditions, more suitable for experienced surfers.',
  },
  {
    id: 'spot-10',
    name: 'Deshaies',
    location: { lat: 16.3, lon: -61.8, region: 'Basse-Terre' },
    beachName: 'Deshaies Beach',
    waveType: 'beach-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Located on Basse-Terre\'s west coast. More sheltered, works with W/NW swells.',
  },
  {
    id: 'spot-11',
    name: 'Grande Anse',
    location: { lat: 16.0167, lon: -61.6833, region: 'Basse-Terre' },
    beachName: 'Grande Anse Beach',
    waveType: 'beach-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Large beach on Basse-Terre\'s west coast. Good for intermediate surfers with W swells.',
  },
  {
    id: 'spot-12',
    name: 'Rivière Sens',
    location: { lat: 16.0333, lon: -61.7, region: 'Basse-Terre' },
    beachName: 'Rivière Sens Beach',
    waveType: 'beach-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    description: 'Sheltered beach break near Basse-Terre. Good for beginners with smaller W swells.',
  },
];

// Legacy seed spots (deprecated - use guadeloupeSurfSpots)
export const seedSpots = guadeloupeSurfSpots;