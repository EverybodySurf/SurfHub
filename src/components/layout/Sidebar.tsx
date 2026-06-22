'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Waves, BarChart3, MapPin, List, Users, ShoppingBag, LayoutDashboard, ChevronRight, CircleUserRound, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import { createClient } from '@/utils/supabase/client';
import type { Session } from '@supabase/supabase-js';

const navItems = [
  { href: '/', label: 'Home', icon: Waves },
  { href: '/swell-forecaster', label: 'Surf Reports', icon: BarChart3 },
  { href: '/surf-map', label: 'Surf Map', icon: MapPin },
  { href: '/directory', label: 'Directory', icon: List },
  { href: '/forum', label: 'Forum', icon: Users },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
    } else {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <>
      {/* Collapsed tab — hidden on mobile, visible on desktop */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full hidden md:flex flex-col items-center transition-all duration-300 ease-out',
          open ? 'w-56' : 'w-11'
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Background panel */}
        <div
          className={cn(
            'absolute inset-0 bg-background/90 backdrop-blur-md border-r border-gray-200/50 transition-all duration-300',
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        />

        {/* Thin exposed strip (always visible when collapsed) */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-11 flex-col items-center justify-center border-r border-gray-200/50 transition-all duration-300',
            open ? 'opacity-0' : 'flex',
            'hidden md:flex'
          )}
        >
          {/* Pill-shaped tab */}
          <div className="relative flex flex-col items-center justify-center w-7 pt-3 pb-2 rounded-full bg-background/80 backdrop-blur-sm cursor-pointer hover:bg-background transition-colors gap-1.5">
            {/* Mini SurfHub icon — pink/purple */}
            <Waves className="h-4 w-4 text-pink-500 shrink-0" />
            {/* Vertical "Menu" text */}
            <span
              className="text-[10px] font-medium tracking-[0.15em] text-muted-foreground uppercase"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Menu
            </span>
            {/* Tiny pointer arrow */}
            <ChevronRight className="absolute -right-2 h-3 w-3 text-muted-foreground animate-pulse" />
          </div>
        </div>

        {/* Expanded nav content */}
        <div
          className={cn(
            'relative z-10 flex flex-col h-full w-full pt-16 px-3 transition-all duration-300',
            open ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* SurfHub logo */}
          <Link href="/" className="flex items-center gap-2 px-3 py-3 mb-4">
            <Waves className="h-6 w-6 text-pink-500 shrink-0" />
            <span className="font-black text-lg">
              SurfHub<span className="text-cyan-400 ml-1">GP</span>
            </span>
          </Link>

          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer to push bottom items down */}
          <div className="flex-1" />

          {/* Login / Sign Out + Theme Toggle */}
          <div className="border-t border-border/20 pt-3 pb-6 space-y-2">
            {!session ? (
              <Link
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
              >
                <CircleUserRound className="h-5 w-5 shrink-0" />
                <span className="truncate">Login</span>
              </Link>
            ) : (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all w-full"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="truncate">Sign Out</span>
              </button>
            )}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <ThemeToggleButton />
              <span className="text-sm text-muted-foreground">Theme</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind collapsed sidebar */}
      <div className="hidden md:block w-11 shrink-0" />
    </>
  );
}
