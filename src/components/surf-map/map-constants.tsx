import { Coffee, UtensilsCrossed, Building2, Waves, Fuel, ShoppingBag, Car, Bed } from 'lucide-react';

export const amenityFilterIcons: Record<string, React.ReactNode> = {
  cafe: <Coffee className="h-3.5 w-3.5" />,
  restaurant: <UtensilsCrossed className="h-3.5 w-3.5" />,
  'surf-shop': <Building2 className="h-3.5 w-3.5" />,
  'board-rental': <Waves className="h-3.5 w-3.5" />,
  grocery: <ShoppingBag className="h-3.5 w-3.5" />,
  'gas-station': <Fuel className="h-3.5 w-3.5" />,
  parking: <Car className="h-3.5 w-3.5" />,
  lodging: <Bed className="h-3.5 w-3.5" />,
};

export const amenityTypeLabels: Record<string, string> = {
  cafe: 'Café',
  restaurant: 'Restaurant',
  'surf-shop': 'Surf Shop',
  'board-rental': 'Board Rental',
  grocery: 'Grocery',
  'gas-station': 'Gas Station',
  parking: 'Parking',
  lodging: 'Lodging',
};

export const difficultyColors: Record<string, string> = {
  beginner: 'bg-lime-200 text-lime-900 border-lime-300',
  intermediate: 'bg-yellow-200 text-yellow-900 border-yellow-300',
  advanced: 'bg-orange-200 text-orange-900 border-orange-300',
  expert: 'bg-rose-200 text-rose-900 border-rose-300',
};

export const waveTypeIcons: Record<string, string> = {
  'beach-break': '🏖️',
  'reef-break': '🪸',
  'point-break': '📍',
};
