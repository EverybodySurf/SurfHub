import type { Metadata } from 'next';
import { List } from 'lucide-react';
import { ComingSoonPage } from '@/components/coming-soon';

export const metadata: Metadata = {
  title: 'Directory - SurfHub',
  description: 'Explore surf spots, businesses, and restaurants — coming soon.',
};

export default function DirectoryPage() {
  return (
    <ComingSoonPage
      icon={List}
      title="Surf Directory"
      description="A curated guide to surf spots, businesses, and restaurants around Guadeloupe. Paddling in soon."
      hint="Directory"
    />
  );
}
