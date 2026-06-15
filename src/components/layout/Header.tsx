'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Waves, List, MapPin, BarChart3, Users, ShoppingBag, Menu, LayoutDashboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import { CircleUserRound, LogOut } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';


export function Header() {
  const [session, setSession] = useState<Session | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuState, setMenuState] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();

  // Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase]);

  // Admin routes have white background, need dark text
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Only homepage hero needs white text — everywhere else use dark/foreground
  const isHomePage = pathname === '/';

  // Scroll effect: transparent → glassmorphic
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', onScroll);
    onScroll();
    
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dynamic text color: white only on homepage hero, else always readable
  const navTextClass = scrolled || isAdminRoute || !isHomePage
    ? 'text-foreground transition-colors duration-300'
    : 'text-white transition-colors duration-300';

  const baseNavItems = [
    { href: '/', label: 'Home', icon: Waves },
    { href: '/swell-forecaster', label: 'Surf Reports', icon: BarChart3 },
    { href: '/surf-map', label: 'Surf Map', icon: MapPin },
    { href: '/directory', label: 'Directory', icon: List },
    { href: '/forum', label: 'Forum', icon: Users },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  ];

  const navItems = session
    ? [
        ...baseNavItems, 
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    : baseNavItems;

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    } else {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className={`
          fixed z-50 w-full
          transition-all duration-500 ease-out
          ${
            scrolled || isAdminRoute
              ? 'bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/20'
              : 'bg-transparent'
          }
        `}
      >
        <div className="container flex h-16 max-w-screen-2xl items-center px-6 md:hidden">
          {/* Logo */}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Waves className="h-6 w-6 text-pink-500 transition-colors duration-300" />
            <span className={`font-black sm:inline-block transition-colors duration-300 ${navTextClass}`}>
              SurfHub<span className="text-cyan-400 ml-1">GP</span>
            </span>
          </Link>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`transition-colors ${
                  pathname === item.href
                    ? "font-semibold " + navTextClass
                    : "text-muted-foreground hover:" + navTextClass
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center justify-end gap-4 ml-auto">
            <div className="hidden md:flex items-center space-x-4">
              {!session ? (
                <Link href="/login" className={`text-sm font-medium ${navTextClass}`}>
                  Login
                </Link>
              ) : (
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className={`text-sm font-medium flex items-center ${navTextClass}`}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              )}
              <ThemeToggleButton scrolled={scrolled} />
            </div>
            
            {/* Mobile menu */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuState(!menuState)}
                className="relative z-20 p-2.5"
              >
                <Menu className={`size-6 duration-200 ${navTextClass} ${menuState ? 'rotate-180 scale-0 opacity-0' : ''}`} />
                <X className={`absolute inset-0 m-auto size-6 duration-200 ${navTextClass} ${menuState ? 'rotate-0 scale-100 opacity-100' : '-rotate-180 scale-0 opacity-0'}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile dropdown */}
        <div 
          className={`
            md:hidden
            ${menuState ? 'block' : 'hidden'}
            bg-background/95 backdrop-blur-xl
            border border-border/20
            rounded-xl mx-4 mb-4 p-6 shadow-2xl
          `}
        >
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`text-lg py-2 flex items-center justify-center ${
                  pathname === item.href
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {item.icon && <item.icon className="mr-3 h-5 w-5 text-cyan-400" />}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col space-y-3 mt-6 pt-6 border-t border-border/20">
            {!session ? (
              <Link href="/login" className="flex items-center justify-center text-base font-medium">
                <CircleUserRound className="mr-2 h-5 w-5 text-cyan-400" />
                Login / Sign Up
              </Link>
            ) : (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center text-base font-medium"
              >
                <LogOut className="mr-2 h-5 w-5 text-cyan-400" />
                Sign Out
              </button>
            )}
            <div className="flex justify-center">
              <ThemeToggleButton scrolled={scrolled} />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}