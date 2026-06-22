import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { ComingSoonPage } from '@/components/coming-soon';

export const metadata: Metadata = {
  title: 'Forum - SurfHub',
  description: 'Connect with fellow surfers, share condition reports, and ask questions — coming soon.',
};

export default function ForumPage() {
  return (
    <ComingSoonPage
      icon={Users}
      title="Community Forum"
      description="Join the conversation, swap local knowledge, and be part of the SurfHub community. Launching soon."
      hint="Forum"
    />
  );
}
