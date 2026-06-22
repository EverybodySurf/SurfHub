'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal, Image, RadioTower } from 'lucide-react';

const adminTabs = [
  { href: '/admin/curate', label: 'Content', icon: SlidersHorizontal },
  { href: '/admin/sources', label: 'Sources', icon: RadioTower },
  { href: '/admin/hero', label: 'Hero Images', icon: Image },
];

/**
 * Admin header with back button and tab navigation.
 * Shared across all admin pages.
 */
export function AdminHeader() {
  const pathname = usePathname();
  const showBack = pathname !== '/admin';

  return (
    <div className="mb-8 space-y-4">
      {/* Back button */}
      {showBack && (
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
        {adminTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
