'use client';

import { SurfSpot } from '@/data/surf-spots-guadeloupe';
import { Amenity, amenityColors } from '@/data/amenities-guadeloupe';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { amenityFilterIcons, amenityTypeLabels, difficultyColors, waveTypeIcons } from './map-constants';

interface Props {
  spots: SurfSpot[];
  amenities: Amenity[];
  sidebarTab: 'spots' | 'amenities';
  onSpotSelect: (spot: SurfSpot) => void;
  onAmenitySelect: (amenity: Amenity) => void;
  onTabChange: (tab: 'spots' | 'amenities') => void;
}

export function SpotListPanel({ spots, amenities, sidebarTab, onSpotSelect, onAmenitySelect, onTabChange }: Props) {
  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex border-b border-border mb-4">
        <button onClick={() => onTabChange('spots')} className={cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px', sidebarTab === 'spots' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-muted-foreground hover:text-foreground')}>
          🏄 Spots ({spots.length})
        </button>
        <button onClick={() => onTabChange('amenities')} className={cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px', sidebarTab === 'amenities' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-muted-foreground hover:text-foreground')}>
          🗺️ Amenities ({amenities.length})
        </button>
      </div>

      {sidebarTab === 'spots' && (
        <div className="space-y-2">
          {spots.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No spots match your search</p>}
          {spots.map((spot) => (
            <button key={spot.id} onClick={() => onSpotSelect(spot)}
              className="w-full p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-sm flex items-center gap-1.5"><span>{waveTypeIcons[spot.waveType]}</span>{spot.name}</h3>
                <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', difficultyColors[spot.difficulty])}>{spot.difficulty}</span>
              </div>
              {spot.beachName && <p className="text-xs text-muted-foreground mb-1">{spot.beachName}</p>}
              <div className="flex gap-2 text-[11px] text-muted-foreground">
                <span>{spot.location.region}</span><span>•</span><span className="capitalize">{spot.waveType.replace('-', ' ')}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {sidebarTab === 'amenities' && (
        <div className="space-y-2">
          {amenities.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No amenities match your search</p>}
          {amenities.map((amenity) => (
            <button key={amenity.id} onClick={() => onAmenitySelect(amenity)}
              className="w-full flex items-start gap-2.5 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
            >
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5', amenityColors[amenity.type])}>
                {amenityFilterIcons[amenity.type] || <Building2 className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{amenity.name}</p>
                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  <span className={cn('px-1 py-0.5 rounded', amenityColors[amenity.type])}>{amenityTypeLabels[amenity.type] || amenity.type}</span>
                  {amenity.distanceFromSpot && <span>• {amenity.distanceFromSpot} from spot</span>}
                </div>
                {amenity.address && <p className="text-xs text-muted-foreground truncate mt-0.5">{amenity.address}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
