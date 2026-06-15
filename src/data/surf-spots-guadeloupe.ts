// Guadeloupe Surf Spots Data
// Coordinates sourced from Wave Safari, WannaSurf, Surfline, surf-forecast.com, and local knowledge
// All Grande-Terre spots are reef breaks unless noted
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
  lowKey?: boolean; // flagged spots that shouldn't be over-exposed
}

export const guadeloupeSurfSpots: SurfSpot[] = [
  // ===================== GRANDE-TERRE =====================

  // --- North Coast ---
  {
    id: 'spot-1',
    name: 'Anse Bertrand',
    aliases: ['Anse de la Chapelle', 'La Chapelle'],
    location: { lat: 16.4727, lon: -61.5119, region: 'Grande-Terre' },
    beachName: 'Plage de la Chapelle',
    waveType: 'reef-break',
    difficulty: 'expert',
    bestSeason: 'November - April',
    swellDirection: 'N, NE, E, SE',
    windDirection: 'N (offshore)',
    hazards: 'Sea urchins, wind picks up quickly',
    description: 'Renowned reef break on Grande-Terre\'s northern tip. Left-hand waves over reef bottom. Quality wave that draws experienced surfers. Can get crowded on weekends.',
  },
  {
    id: 'spot-6',
    name: 'Plombier',
    location: { lat: 16.4600, lon: -61.5100, region: 'Grande-Terre' },
    beachName: 'Plage de Plombier',
    waveType: 'reef-break',
    difficulty: 'advanced',
    bestSeason: 'November - April',
    description: 'Further south on the same beach as Anse Bertrand. Reef break with consistent swells. Tubular and shallow sections. Less crowded than the main peak.',
  },

  // --- Northwest Coast ---
  {
    id: 'spot-9',
    name: 'Antigues Cape',
    aliases: ['Cap d\'Antigues', 'Pointe d\'Antigues'],
    location: { lat: 16.4420, lon: -61.5450, region: 'Grande-Terre' },
    beachName: 'Pointe d\'Antigues',
    waveType: 'reef-break',
    difficulty: 'expert',
    bestSeason: 'December - March',
    swellDirection: 'N, NE',
    description: 'Expert reef break at Pointe d\'Antigues peninsula near Port Louis. Powerful right-hander on deep reef, barrels on big north swells. Handles larger swell well.',
  },
  {
    id: 'spot-2',
    name: 'Port Louis',
    aliases: ['Le Souffleur', 'Anse du Souffleur'],
    location: { lat: 16.4170, lon: -61.5370, region: 'Grande-Terre' },
    beachName: 'Anse du Souffleur',
    waveType: 'reef-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    swellDirection: 'N, NE',
    windDirection: 'SE, S (offshore)',
    hazards: 'Coral reef at low tide',
    description: 'Beginner-friendly A-frame reef break. Very popular with surf schools. Gentle waves up to 1m in smaller swell. Good for longboarding and learning.',
  },

  // --- East Coast (Atlantic facing) ---
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
    description: 'The surf capital of Guadeloupe. Powerful left-hand reef break with fast hollow sections and tube potential. Hosts WSL events and French championships. Best at mid-to-high tide. Booties recommended.',
  },
  {
    id: 'spot-4',
    name: 'Anse Salabouelle',
    aliases: ['La Bouelle'],
    location: { lat: 16.2770, lon: -61.2620, region: 'Grande-Terre' },
    beachName: 'Anse Salabouelle',
    waveType: 'reef-break',
    difficulty: 'advanced',
    bestSeason: 'September - April',
    swellDirection: 'E, NE',
    windDirection: 'E, S (offshore)',
    hazards: 'Sharp coral, sea urchins, strong currents',
    description: 'Located between Anse à l\'Eau and Anse à la Croix. Protected reef break with hollow lefts and mellower rights. Less crowded than Damencourt. General area — keep it low key.',
    lowKey: true,
  },
  {
    id: 'spot-17',
    name: 'Alizé',
    location: { lat: 16.2420, lon: -61.2470, region: 'Grande-Terre' },
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Low-key locals spot between Anse Gros Morne and Anse Petite Savane. General area — part of the hidden treasures of Guadeloupe\'s east coast.',
    lowKey: true,
  },
  {
    id: 'spot-18',
    name: 'Caille Dehors',
    location: { lat: 16.2420, lon: -61.2970, region: 'Grande-Terre' },
    waveType: 'reef-break',
    difficulty: 'advanced',
    bestSeason: 'November - April',
    description: 'Offshore reef break west of Alizé. Low-key locals spot — a treasure for those who find it. Respect the lineup.',
    lowKey: true,
  },
  {
    id: 'spot-5',
    name: 'La Station',
    location: { lat: 16.2420, lon: -61.3220, region: 'Grande-Terre' },
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Low-key reef break west of Caille Dehors. Hidden gem on the east coast. Not a beginner spot — paddle out with respect.',
    lowKey: true,
  },

  // --- Southeast ---
  {
    id: 'spot-12',
    name: 'Anse à la Gourde',
    location: { lat: 16.2270, lon: -61.1760, region: 'Grande-Terre' },
    beachName: 'Anse à la Gourde',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'December - April',
    description: 'Reef break directly facing Anse à la Gourde beach. Crystal clear water over coral bottom. Works on E swells. Stunning location near Pointe des Châteaux.',
  },
  {
    id: 'spot-8',
    name: 'La Chaise',
    location: { lat: 16.1950, lon: -61.1800, region: 'Grande-Terre' },
    waveType: 'reef-break',
    difficulty: 'advanced',
    bestSeason: 'December - April',
    description: 'Low-key reef break on the south coast below Anse à la Gourde. Intermediate to advanced only. General area — part of the hidden treasures.',
    lowKey: true,
  },
  {
    id: 'spot-11',
    name: 'Port de St-François',
    location: { lat: 16.2480, lon: -61.2770, region: 'Grande-Terre' },
    beachName: 'Plage des Raisins Clairs',
    waveType: 'reef-break',
    difficulty: 'beginner',
    bestSeason: 'December - April',
    description: 'In front of Gendarmerie National, just east of Plage des Raisins Clairs. Beginner-friendly reef break. Protected waters, good for learning.',
  },

  // --- South Coast ---
  {
    id: 'spot-10',
    name: 'La Caravelle',
    location: { lat: 16.2250, lon: -61.3970, region: 'Grande-Terre' },
    beachName: 'Club Med La Caravelle',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Just west of the peninsula/rock buffer next to Club Med La Caravelle. Consistent reef break on the south coast.',
  },
  {
    id: 'spot-19',
    name: 'La Table',
    location: { lat: 16.2250, lon: -61.4120, region: 'Grande-Terre' },
    waveType: 'reef-break',
    difficulty: 'advanced',
    bestSeason: 'November - April',
    description: 'About half a click west of La Caravelle, facing Club Med. Quality reef break for experienced surfers.',
  },
  {
    id: 'spot-7',
    name: 'Petit Havre',
    location: { lat: 16.2100, lon: -61.4350, region: 'Grande-Terre' },
    beachName: 'Petit Havre Beach',
    waveType: 'reef-break',
    difficulty: 'advanced',
    bestSeason: 'November - April',
    swellDirection: 'S, SE, E',
    windDirection: 'N (offshore)',
    hazards: 'Shallow coral reef, fire coral, sea urchins',
    description: 'Quality left-hand reef break near Le Gosier. Ledgy barrels when conditions line up. Shallow coral — booties essential. Intermediate to advanced.',
  },
  {
    id: 'spot-20',
    name: 'Anse à la Barque',
    location: { lat: 16.1980, lon: -61.4600, region: 'Grande-Terre' },
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Low-key reef break facing the river mouth of Rivière de Anse à la Barque. Part of Guadeloupe\'s hidden surf treasures.',
    lowKey: true,
  },
  {
    id: 'spot-21',
    name: 'Le Helleux',
    location: { lat: 16.1950, lon: -61.4800, region: 'Grande-Terre' },
    beachName: 'Plage de Gros Sable',
    waveType: 'reef-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    description: 'Beginner-friendly break facing Plage de Gros Sable. Surf schools and coaching available right at the spot. Good for learning in a beautiful setting.',
  },
  {
    id: 'spot-22',
    name: 'Hotel Novotel',
    location: { lat: 16.2100, lon: -61.4950, region: 'Grande-Terre' },
    beachName: 'Plage Fleur d\'Epée',
    waveType: 'reef-break',
    difficulty: 'intermediate',
    bestSeason: 'November - April',
    description: 'Reef break facing Hotel Fleur d\'Epée, just south of the mini peninsula near Le Gosier. Consistent waves, good intermediate option.',
  },
  {
    id: 'spot-23',
    name: 'Plage de Salako',
    location: { lat: 16.2200, lon: -61.5100, region: 'Grande-Terre' },
    beachName: 'Plage de Salako',
    waveType: 'reef-break',
    difficulty: 'beginner',
    bestSeason: 'November - April',
    description: 'Beginner-friendly spot directly facing Plage de Salako. Mellow waves, good for learning and longboarding on the south coast.',
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
    description: 'Golden sand beach on Basse-Terre\'s northwest coast. Works on north swells with offshore reef protection. Near Chez Loulous, Le Madras, and Langley Resort Fort Royal at Plage de Bas Vent.',
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
    description: 'Northwest Basse-Terre spot with consistent waves year-round. The stretch from Plage Riflet to Grande Anse offers several peaks.',
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
    description: 'Large sandy beach on Basse-Terre\'s west coast near Trois-Rivières. Works during cyclone season with S/SW swells. Good alternative when Atlantic coast is flat.',
  },
  {
    id: 'spot-16',
    name: 'Bananier',
    aliases: ['Plage Salée de Bananier'],
    location: { lat: 15.9997, lon: -61.6031, region: 'Basse-Terre' },
    beachName: 'Plage Salée de Bananier',
    waveType: 'beach-break', // The only beach break — all other spots are reef breaks
    difficulty: 'intermediate',
    bestSeason: 'June - December',
    swellDirection: 'S, W',
    hazards: 'Strong currents, powerful waves — swimming not recommended',
    description: 'Black volcanic sand beach in Capesterre-Belle-Eau. Popular with surfers and bodyboarders. View of Marie-Galante. Surf schools nearby.',
  },
];

// Legacy export
export const seedSpots = guadeloupeSurfSpots;
