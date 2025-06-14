'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Waves, List, MapPin, BarChart3, Users, ShoppingBag, Menu, LayoutDashboard } from 'lucide-react';
import { NavLink } from './NavLink';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import { CircleUserRound, LogOut } from 'lucide-react';


const navItems = [
  { href: '/', label: 'Home', icon: Waves },
  { href: '/swell-forecaster', label: 'Swell Forecaster', icon: BarChart3 },
  { href: '/surf-map', label: 'Surf Map', icon: MapPin },
  { href: '/directory', label: 'Directory', icon: List },
  { href: '/forum', label: 'Forum', icon: Users },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function Header() {
  const [session, setSession] = useState(null);
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase]);

  const baseNavItems = [
    { href: '/', label: 'Home', icon: Waves },
    { href: '/swell-forecaster', label: 'Swell Forecaster', icon: BarChart3 },
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
      // Optionally show a message to the user
    } else {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Waves className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-xl">
            SurfHub
          </span>
        </Link>
        
        <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`nav-link transition-colors ${
                pathname === item.href
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-6 ml-auto">
          <div className="hidden md:flex space-x-6">
            {!session ? (
              <Link href="/login" className="text-sm font-medium">
                Login / Sign Up
              </Link>
            ) : (
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="text-sm font-medium flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
          <div className="hidden md:flex">
            <ThemeToggleButton />
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
                <SheetTitle>Menu</SheetTitle>
                <div className="p-6">
                  <Link href="/" className="mb-8 flex items-center space-x-2">
                    <Waves className="h-8 w-8 text-primary" />
                    <span className="font-bold text-2xl">SurfHub</span>
                  </Link>
                  <nav className="flex flex-col space-y-3">
                    {navItems.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className={`text-lg py-2 flex items-center transition-colors ${
                          pathname === item.href
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="flex flex-col space-y-3 mt-6">
                    {!session ? (
                      <Link href="/login" className="flex items-center text-base font-medium">
                        <CircleUserRound className="mr-2 h-5 w-5" />
                        Login / Sign Up
                      </Link>
                    ) : (
                      <button
                        onClick={handleSignOut}
                        className="flex items-center text-base font-medium"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Sign Out    
                      </button>   
                    )}
                  </div>
                </div> 
                <div className="mt-auto p-6 border-t border-border/40">
                  <ThemeToggleButton />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
