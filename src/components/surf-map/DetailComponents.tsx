'use client';

import { cn } from '@/lib/utils';

/** Uppercase tracking label (e.g. "Coordinates", "Best Season") */
export function DetailLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
      {children}
    </span>
  );
}

/** Pill/badge tag with consistent styling */
export function Tag({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', className)}>
      {children}
    </span>
  );
}

/** Info block card: label + value inside a muted rounded box */
export function InfoBlock({ label, value, mono, capitalize, colSpan }: { label: string; value: string; mono?: boolean; capitalize?: boolean; colSpan?: boolean }) {
  return (
    <div className={cn('p-3 rounded-xl bg-muted/70', colSpan && 'col-span-2')}>
      <DetailLabel>{label}</DetailLabel>
      <span className={cn('font-semibold', capitalize && 'capitalize', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  );
}

/** Generic rounded card container */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl', className)}>{children}</div>;
}

/** Detail panel header: icon + name + subtitle + close button */
export function DetailHeader({ icon, name, subtitle, onClose }: { icon: React.ReactNode; name: string; subtitle?: string; onClose: () => void }) {
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
        <svg className="h-4 w-4 text-muted-foreground group-hover:text-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>
  );
}
