'use client';

import { SurfSpot } from '@/data/surf-spots-guadeloupe';
import { Amenity, amenityColors } from '@/data/amenities-guadeloupe';
import { MapPin, X, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { amenityFilterIcons, amenityTypeLabels, difficultyColors, waveTypeIcons } from './map-constants';

interface Props {
  spot: SurfSpot;
  amenities: Amenity[];
  onAmenitySelect: (amenity: Amenity) => void;
  onClose: () => void;
}

export function SpotDetailCard({ spot, amenities, onAmenitySelect, onClose }: Props) {
  const spotAmenities = amenities.filter((a) => a.spotId === spot.id);

  return (
    <div>
      <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
      <div className="p-4">
        <Header
          icon={waveTypeIcons[spot.waveType]}
          name={spot.name}
          subtitle={spot.beachName ?? undefined}
          onClose={onClose}
        />

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Tag className={difficultyColors[spot.difficulty]}>{spot.difficulty}</Tag>
          <Tag className="bg-gradient-to-br from-teal-400/10 to-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-teal-200 dark:border-teal-800">
            {spot.waveType.replace('-', ' ')}
          </Tag>
          {spot.location.region && <Tag className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">{spot.location.region}</Tag>}
        </div>

        <Card className="p-3 rounded-xl bg-muted/80 mb-4">
          <p className="text-sm leading-relaxed text-foreground/80">{spot.description}</p>
        </Card>

        <div className="grid grid-cols-2 gap-2.5 text-sm mb-4">
          <InfoBlock label="Wave Type" value={spot.waveType.replace('-', ' ')} capitalize />
          <InfoBlock label="Difficulty" value={spot.difficulty} capitalize />
          {spot.bestSeason && <InfoBlock label="Best Season" value={spot.bestSeason} />}
          {spot.swellDirection && <InfoBlock label="Swell Dir." value={spot.swellDirection} />}
          <InfoBlock label="Coordinates" value={`${spot.location.lat.toFixed(4)}, ${spot.location.lon.toFixed(4)}`} mono colSpan={2} />
        </div>
      </div>

      <AmenityList amenities={spotAmenities} onAmenitySelect={onAmenitySelect} />
    </div>
  );
}

// ═══ Shared sub-components ═══

function Header({ icon, name, subtitle, onClose }: { icon: string; name: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-lg shadow-md">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">{name}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted transition-colors group">
        <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
    </div>
  );
}

function Tag({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', className)}>
      {children}
    </span>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl', className)}>{children}</div>;
}

function InfoBlock({ label, value, mono, capitalize, colSpan }: { label: string; value: string; mono?: boolean; capitalize?: boolean; colSpan?: boolean }) {
  return (
    <div className={cn('p-3 rounded-xl bg-muted/70', colSpan && 'col-span-2')}>
      <Label>{label}</Label>
      <span className={cn('font-semibold', capitalize && 'capitalize', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">{children}</span>
  );
}

function AmenityList({ amenities, onAmenitySelect }: { amenities: Amenity[]; onAmenitySelect: (a: Amenity) => void }) {
  if (amenities.length === 0) {
    return <p className="text-xs text-muted-foreground italic mb-2 px-4">No amenity data yet for this spot.</p>;
  }

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-3 px-4">
        <div className="h-px flex-1 bg-gradient-to-r from-teal-400/30 to-transparent" />
        <h3 className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
          Nearby Amenities ({amenities.length})
        </h3>
        <div className="h-px flex-1 bg-gradient-to-l from-teal-400/30 to-transparent" />
      </div>
      <div className="space-y-2 px-4 pb-4">
        {amenities.map((amenity) => (
          <AmenityRow key={amenity.id} amenity={amenity} onClick={() => onAmenitySelect(amenity)} />
        ))}
      </div>
    </div>
  );
}

function AmenityRow({ amenity, onClick }: { amenity: Amenity; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-start gap-3 p-3 rounded-xl border border-border/60 hover:border-teal-400/30 hover:bg-gradient-to-r hover:from-teal-400/[0.03] hover:to-transparent transition-all text-left group"
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-sm', amenityColors[amenity.type])}>
        {amenityFilterIcons[amenity.type] || <Building2 className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-foreground transition-colors">{amenity.name}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{amenityTypeLabels[amenity.type] || amenity.type}</span>
          {amenity.distanceFromSpot && <><span>•</span><span>{amenity.distanceFromSpot}</span></>}
        </div>
      </div>
    </button>
  );
}
