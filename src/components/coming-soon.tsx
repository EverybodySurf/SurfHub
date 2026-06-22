import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  hint?: string;
}

/**
 * Reusable "Coming Soon" page layout.
 *
 * Mechanic — no domain policy here. Callers provide the icon,
 * title, and description that match their page.
 */
export function ComingSoonPage({ icon: Icon, title, description, hint }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon ring */}
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400/20 to-pink-400/20 flex items-center justify-center">
          <Icon className="h-10 w-10 text-cyan-400" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Visual placeholder hint */}
        <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-muted/30">
          <div className="aspect-video flex items-center justify-center">
            <div className="text-center space-y-3 p-8">
              <Waves className="h-12 w-12 mx-auto text-cyan-400/40" />
              <p className="text-sm text-muted-foreground/60 font-mono">
                {hint ?? 'Coming Soon'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button asChild variant="gradient" size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
