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
    { href: '/surf-map', label: 'Surf Map', icon: MapPin },
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
    <header className="relative z-50">
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 h-16
          transition-all duration-500 ease-out
          ${isScrolled ? 'bg-background/5 backdrop-blur-sm' : 'bg-transparent'}
        `}
      >
        <div className="flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto">
          {/* Logo — home button */}
          <Link href="/" className="flex items-center space-x-2">
            <Waves className="h-6 w-6 text-pink-500 shrink-0" />
            <span className={`font-black text-lg ${textColor} transition-colors duration-300`}>
              SurfHub<span className="text-cyan-400 ml-1">GP</span>
            </span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Theme toggle always visible */}
            <ThemeToggleButton scrolled={isScrolled} />

            {/* Desktop quick actions: Login/Sign Out */}
            <div className="hidden md:flex items-center gap-2">
              {!session ? (
                <Link href="/login" className={`text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${textColor}`}>
                  Login
                </Link>
              ) : (
                <Button onClick={handleSignOut} variant="ghost" className={`text-sm font-medium h-9 ${textColor}`}>
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>

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

            {/* Mobile-only auth actions */}
            <div className="md:hidden flex flex-col gap-3 mt-6 pt-6 border-t border-border/20">
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
  );
}
