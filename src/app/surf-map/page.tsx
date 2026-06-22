'use client';

import SurfMapSection from '@/components/surf-map/SurfMapSection';

export default function SurfMapStandalone() {
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <SurfMapSection />
    </div>
  );
}
