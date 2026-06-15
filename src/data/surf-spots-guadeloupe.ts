// Guadeloupe Surf Spots Data
// Coordinates sourced from Wave Safari, WannaSurf, Surfline, and surf-forecast.com
// Last updated: 2026-06-15

export interface SurfSpot {
  id: string;
  name: string;
  aliases?: string[];
  location: {
    lat: number;
    lon: number;
    city?: string;
    region: string; // 'Grande-Terre' | 'Basse-Terre'
  };
  beachName?: string;
  waveType: 'beach-break' | 'reef-break' | 'point-break';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  bestSeason?: string;
  description: string;
  swellDirection?: string;
  windDirection?: string;
  hazards?: string;
  amenities?: {
    parking?: boolean;
    showers?: boolean;
    restaurants?: boolean;
    surfShop?: boolean;
    boardRental?: boolean;
  };
}

export const guadeloupeSurfSpots: SurfSpot[] = [
  // ===================== GRANDE-TERRE (East Island) =====================

  {
    id: 'spot-1',
    name: 'Anse Bertrand',
    aliases: ['Anse de la Chapelle', 'La Chapelle'],
    location: { lat: 16.4727, lon: -61.5119, region: 'Grande-Terre' },
    beachName: 'Plage de la Chapelle',
    waveType: 'beach-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    swellDirection: 'N, NE, E, SE',
    windDirection: 'N (offshore)',
    hazards: 'Sea urchins, wind picks up quickly',
    description: 'Popular beach break on Grande-Terre\'s northern tip. Left-hand waves on sandy bottom. Fun mellow waves for progression. Can get crowded on weekends.',
  },
  {
    id: 'spot-2',
    name: 'Port Louis',
    aliases: ['Le Souffleur', 'Anse du Souffleur'],
    location: { lat: 16.4222, lon: -61.5335, region: 'Grande-Terre' },
    beachName: 'Anse du Souffleur',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    swellDirection: 'N, NE',
    windDirection: 'SE, S (offshore)',
    hazards: 'Coral reef at low tide',
    description: 'Popular spot with A-frame reef break offering lefts and rights. Very popular with surf schools and beginners in smaller swell. Le Souffleur has gentle waves up to 1m; larger swells produce more power.',
  },
  {
    id: 'spot-3',
    name: 'Le Moule',
    aliases: ['Damencourt'],
    location: { lat: 16.3372, lon: -61.3620, region: 'Grande-Terre' },
    beachName: 'Damencourt Beach',
    waveType: 'reef-break',
    difficulty: 'expert',
    bestSeason: 'November - April',
    swellDirection: 'E, NE, NNE',
    windDirection: 'E, S, light wind (morning)',
    hazards: 'Sharp coral reef, sea urchins, localism, crowded',
    description: 'THE surf capital of Guadeloupe. Powerfull left-hand reef break with fast hollow sections and tube potential. Hosts WSL events and French championships. Long, workable walls on the left; softer right on north swell. Best at mid-to-high tide. Booties recommended.',
  },
  {
    id: 'spot-4',
    name: 'Anse Salabouelle',
    aliases: ['La Bouelle'],
    location: { lat: 16.2950, lon: -61.3230, region: 'Grande-Terre' },
    beachName: 'Anse Salabouelle',
    waveType: 'reef-break',
    difficulty: 'advanced',
    bestSeason: 'September - April',
    swellDirection: 'E, NE',
    windDirection: 'E, S (offshore)',
    hazards: 'Sharp coral, sea urchins, strong currents',
    description: 'Reef break south of Le Moule with fast, hollow lefts and longer mellower rights. Less crowded than Damencourt. Coral reef bottom with submerged rocks — booties strongly recommended. Works best with E/NE swell 0.8-2m+.',
  },
  {
    id: 'spot-5',
    name: 'La Station',
    location: { lat: 16.2833, lon: -61.5333, region: 'Grande-Terre' },
    beachName: 'La Station Beach',
    waveType: 'beach-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    description: 'Beginner-friendly beach break with consistent E swells. Sandy bottom, easy paddling. Good for learning and longboarding.',
  },
  {
    id: 'spot-6',
    name: 'Plombier',
    location: { lat: 16.2667, lon: -61.5167, region: 'Grande-Terre' },
    beachName: 'Plombier Beach',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Reef break with ENE swells. Cross-offshore winds. Tubular and shallow at the end — experienced surfers recommended.',
  },
  {
    id: 'spot-7',
    name: 'Petit Havre',
    location: { lat: 16.2080, lon: -61.4270, region: 'Grande-Terre' },
    beachName: 'Petit Havre Beach',
    waveType: 'reef-break',
    difficulty: 'advanced',
    bestSeason: 'November - April',
    swellDirection: 'S, SE, E',
    windDirection: 'N (offshore)',
    hazards: 'Shallow coral reef, fire coral, sea urchins',
    description: 'Quality left-hand reef break on Le Gosier\'s south coast. Ledgy barrels when conditions line up. Very shallow at the end with fire coral present — intermediate to advanced only. Booties essential. Few crowds on weekdays.',
  },
  {
    id: 'spot-8',
    name: 'La Chaise',
    location: { lat: 16.2167, lon: -61.4667, region: 'Grande-Terre' },
    beachName: 'La Chaise Beach',
    waveType: 'beach-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    description: 'Sandy beach break with consistent E swells. Cross-shore winds. Good for all levels — dependable option when other spots are too big.',
  },
  {
    id: 'spot-9',
    name: 'Antigues Cape',
    aliases: ['Cap d\'Antigues', 'Pointe d\'Antigues'],
    location: { lat: 16.3500, lon: -61.5667, region: 'Grande-Terre' },
    beachName: 'Antigues Cape Point',
    waveType: 'reef-break',
    difficulty: 'expert',
    bestSeason: 'December - March',
    swellDirection: 'N, NE',
    description: 'Expert reef break at the northern tip near Port Louis. Powerful right-hander on deep reef, barrels on big north swells. Handles larger swell without closing out. Tow-in and big-wave potential. Not for the faint-hearted.',
  },
  {
    id: 'spot-10',
    name: 'La Caravelle',
    location: { lat: 16.2650, lon: -61.3870, region: 'Grande-Terre' },
    beachName: 'La Caravelle Beach',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Left-hand reef break on coral bottom. Located between Le Moule and Sainte-Anne. Consistent E swell exposure. Works best at mid-tide.',
  },
  {
    id: 'spot-11',
    name: 'Port de St-François',
    aliases: ['St Francois Harbour', 'Saint-François Harbour'],
    location: { lat: 16.2510, lon: -61.2740, region: 'Grande-Terre' },
    beachName: 'Saint-François Marina',
    waveType: 'reef-break',
    difficulty: 'beginner',
    bestSeason: 'December - April',
    description: 'Sheltered right-hand reef break near the marina at Saint-François. Beginner-friendly waves in protected waters. Good option on windy days when other spots are blown out.',
  },
  {
    id: 'spot-12',
    name: 'Anse à la Gourde',
    location: { lat: 16.2300, lon: -61.1830, region: 'Grande-Terre' },
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'December - April',
    description: 'Right-hand reef break on Grande-Terre\'s eastern tip. Coral bottom with crystal clear water. Works on E swells. Nearby Pointe des Châteaux offers incredible scenery.',
  },

  // ===================== BASSE-TERRE (West Island) =====================

  {
    id: 'spot-13',
    name: 'La Perle',
    location: { lat: 16.3409, lon: -61.7796, region: 'Basse-Terre' },
    beachName: 'Plage de la Perle',
    waveType: 'beach-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    swellDirection: 'N, NW',
    hazards: 'Rip currents, submerged rocks',
    description: 'Golden sand beach on Basse-Terre\'s northwest coast. Works on north swells with offshore reef protection. Surrounded by Chez Loulous, Le Madras, and Langley Resort Fort Royal at nearby Plage de Bas Vent.',
  },
  {
    id: 'spot-14',
    name: 'Deshaies',
    location: { lat: 16.3096, lon: -61.7944, region: 'Basse-Terre' },
    beachName: 'Grande Anse des Deshaies',
    waveType: 'beach-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    swellDirection: 'W, NW',
    hazards: 'Strong currents at certain beaches',
    description: 'Northwest Basse-Terre spot with consistent waves year-round. The stretch from Plage Riflet to Grande Anse offers several peaks. Best surf is near Hotel Fort Royal / Bas Vent area. More beginner-friendly options than Grande-Terre\'s heavy reef breaks.',
  },
  {
    id: 'spot-15',
    name: 'Grande Anse',
    location: { lat: 16.0167, lon: -61.6833, region: 'Basse-Terre' },
    beachName: 'Grande Anse Beach',
    waveType: 'beach-break',
    difficulty: 'intermediate',
    bestSeason: 'June - December',
    swellDirection: 'S, SW, W',
    description: 'Large sandy beach on Basse-Terre\'s west coast near Trois-Rivières. Works best during cyclone season with S/SW swells. More exposed to the Caribbean Sea. Good intermediate option when Atlantic coast is flat.',
  },
  {
    id: 'spot-16',
    name: 'Bananier',
    aliases: ['Plage Salée de Bananier'],
    location: { lat: 15.9997, lon: -61.6031, region: 'Basse-Terre' },
    beachName: 'Plage Salée de Bananier',
    waveType: 'beach-break',
    difficulty: 'intermediate',
    bestSeason: 'June - December',
    swellDirection: 'S, W',
    hazards: 'Strong currents, powerful waves — swimming not recommended',
    description: 'Black volcanic sand beach on Basse-Terre\'s southeast coast in Capesterre-Belle-Eau. Popular with surfers and bodyboarders for regular waves. Unobstructed view of Marie-Galante. Surf schools available nearby.',
  },
];

// Legacy export
export const seedSpots = guadeloupeSurfSpots;
