'use client';

import { SurfSpot } from '@/data/surf-spots-guadeloupe';
import { Amenity, amenityColors } from '@/data/amenities-guadeloupe';
import { MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { amenityFilterIcons, amenityTypeLabels, waveTypeIcons } from './map-constants';
import { DetailHeader, Tag, InfoBlock } from './DetailComponents';
import { AmenityRating } from '@/components/amenity-rating';

interface Props {
  amenity: Amenity;
  parentSpot: SurfSpot | null;
  onSpotSelect: (spot: SurfSpot) => void;
  onClose: () => void;
}

export function AmenityDetailCard({ amenity, parentSpot, onSpotSelect, onClose }: Props) {
  return (
    <div>
      <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
      <div className="p-4">
        <DetailHeader
          icon={amenityFilterIcons[amenity.type] || <Building2 className="h-5 w-5" />}
          name={amenity.name}
          subtitle={amenity.type.replace('-', ' ')}
          onClose={onClose}
        />

        <div className="flex items-center gap-2 mb-4">
          <Tag className={amenityColors[amenity.type]}>
            {amenityTypeLabels[amenity.type] || amenity.type}
          </Tag>
        </div>

        <div className="space-y-2.5 mb-4">
          {amenity.address && <InfoBlock label="Address" value={amenity.address} />}
          {amenity.notes && (
            <div className="p-3 rounded-xl bg-muted/70">
              <p className="text-sm">{amenity.notes}</p>
            </div>
          )}
          {amenity.distanceFromSpot && (
            <InfoBlock label="Distance" value={`📍 ${amenity.distanceFromSpot} from surf spot`} />
          )}
        </div>

        <AmenityRating amenityId={amenity.id} amenityName={amenity.name} />

        {parentSpot && (
          <button onClick={() => onSpotSelect(parentSpot)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-gradient-to-br from-teal-400/5 to-cyan-500/5 hover:from-teal-400/10 hover:to-cyan-500/10 transition-all text-left mb-3 mt-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-sm shadow-sm shrink-0">
              {waveTypeIcons[parentSpot.waveType]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Near: {parentSpot.name}</p>
              <p className="text-xs text-muted-foreground">{parentSpot.difficulty} • {parentSpot.waveType.replace('-', ' ')} • {parentSpot.location.region}</p>
            </div>
            <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
          </button>
        )}

        <InfoBlock label="Coordinates" value={`${amenity.location.lat.toFixed(4)}, ${amenity.location.lon.toFixed(4)}`} mono />
      </div>
    </div>
  );
}
