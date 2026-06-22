import type { Metadata } from 'next';
import { ShoppingBag } from 'lucide-react';
import { ComingSoonPage } from '@/components/coming-soon';

export const metadata: Metadata = {
  title: 'Marketplace - SurfHub',
  description: 'Buy, sell, and trade surf gear and services within the SurfHub community — coming soon.',
};

export default function MarketplacePage() {
  return (
    <ComingSoonPage
      icon={ShoppingBag}
      title="Community Marketplace"
      description="Find great deals on surf gear, book local lessons, or list your own offerings. Shaping up now."
      hint="Marketplace"
    />
  );
}
