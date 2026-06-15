'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Waves, List, MapPin, BarChart3, Users, ShoppingBag, Menu, LayoutDashboard, X, CircleUserRound, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import type { Session } from '@supabase/supabase-js';

export function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, [supabase]);

  const isHomePage = pathname === '/';
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Solid background only when scrolled — always overlay otherwise
  const isScrolled = scrolled || isAdminRoute;
  // Text: dark on scrollable pages, white on fullscreen pages (like home, surf-map) when not scrolled
  const isFullscreenPage = isHomePage || pathname?.startsWith('/surf-map');
  const textColor = isScrolled || !isFullscreenPage ? 'text-foreground' : 'text-white';

  const navItems = [
    { href: '/', label: 'Home', icon: Waves },
    { href: '/swell-forecaster', label: 'Surf Reports', icon: BarChart3 },
    { href: '/surf-map', label: 'Surf/Amenities Map', icon: MapPin },
    { href: '/directory', label: 'Directory', icon: List },
    { href: '/forum', label: 'Forum', icon: Users },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    ...(session ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
    <header className="relative z-[1200]">
      <nav
        className={`
          fixed top-0 left-0 right-0 z-[1200] h-16
          transition-all duration-300 ease-out
          ${headerHidden ? '-translate-y-full' : 'translate-y-0'}
          ${isScrolled ? 'bg-background/5 backdrop-blur-sm' : 'bg-transparent'}
        `}
      >
        <div className="flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto">
          {/* Logo — home button */}
          <Link href="/" className="flex items-center space-x-2">
            <Waves className="h-6 w-6 text-pink-500 shrink-0" />
            <span className="font-black text-lg text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
              SurfHub<span className="text-cyan-400 ml-1">GP</span>
            </span>
          </Link>

          {/* Right section — just hamburger menu */}
          <div className="flex items-center">

            {/* Hamburger menu — works on all screen sizes */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative z-20 p-2.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              <Menu className={`size-6 duration-200 ${textColor} ${menuOpen ? 'rotate-180 scale-0 opacity-0' : ''}`} />
              <X className={`absolute inset-0 m-auto size-6 duration-200 ${textColor} ${menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'}`} />
            </button>
          </div>
        </div>

        {/* Dropdown menu — works on all screens */}
        <div className={`${menuOpen ? 'block' : 'hidden'} bg-background/95 backdrop-blur-xl border-b border-border/20 shadow-2xl`}>
          <div className="max-w-screen-2xl mx-auto px-4 py-6">
            <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-500'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-cyan-500' : 'text-cyan-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Theme toggle & auth actions inside dropdown */}
            <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border/20">
              <div className="flex justify-center">
                <ThemeToggleButton scrolled={isScrolled} />
              </div>
              {!session ? (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-xl hover:bg-muted transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <CircleUserRound className="h-5 w-5 text-cyan-400" />
                  Login / Sign Up
                </Link>
              ) : (
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-xl hover:bg-muted transition-colors w-full"
                >
                  <LogOut className="h-5 w-5 text-cyan-400" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>

      {/* Header toggle button — appears when header is hidden */}
      <button
        onClick={() => setHeaderHidden(!headerHidden)}
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-[1200] transition-all duration-300 ${
          headerHidden
            ? 'translate-y-2 opacity-80 hover:opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        } bg-background/80 backdrop-blur-sm border border-border/40 rounded-b-xl px-4 py-1 text-xs text-muted-foreground hover:text-foreground shadow-sm`}
        aria-label={headerHidden ? 'Show header' : 'Hide header'}
      >
        SurfHub GP ▾
      </button>
    </>
  );
}
