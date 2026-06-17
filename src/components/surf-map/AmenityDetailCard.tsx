'use client';

import { SurfSpot } from '@/data/surf-spots-guadeloupe';
import { Amenity, amenityColors } from '@/data/amenities-guadeloupe';
import { MapPin, X, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { amenityFilterIcons, amenityTypeLabels, waveTypeIcons } from './map-constants';
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
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md', amenityColors[amenity.type])}>
              {amenityFilterIcons[amenity.type] || <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{amenity.name}</h2>
              <p className="text-xs text-muted-foreground capitalize">{amenity.type.replace('-', ' ')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted transition-colors group">
            <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        {/* Type tag */}
        <div className="flex items-center gap-2 mb-4">
          <Tag className={amenityColors[amenity.type]}>
            {amenityTypeLabels[amenity.type] || amenity.type}
          </Tag>
        </div>

        {/* Info cards */}
        <div className="space-y-2.5 mb-4">
          {amenity.address && <InfoCard label="Address" value={amenity.address} />}
          {amenity.notes && <InfoCard>{amenity.notes}</InfoCard>}
          {amenity.distanceFromSpot && <InfoCard label="Distance" value={`📍 ${amenity.distanceFromSpot} from surf spot`} />}
        </div>

        {/* Rating & Verification */}
        <AmenityRating amenityId={amenity.id} amenityName={amenity.name} />

        {/* Link to parent surf spot */}
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

        <InfoCard label="Coordinates" value={`${amenity.location.lat.toFixed(4)}, ${amenity.location.lon.toFixed(4)}`} mono />
      </div>
    </div>
  );
}

function Tag({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      {children}
    </span>
  );
}

function InfoCard({ label, value, mono, children }: { label?: string; value?: string; mono?: boolean; children?: React.ReactNode }) {
  return (
    <div className="p-3 rounded-xl bg-muted/70">
      {label && <Label>{label}</Label>}
      {value ? <p className={cn('text-sm', mono && 'font-mono text-xs font-semibold')}>{value}</p> : null}
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">{children}</span>
  );
}
