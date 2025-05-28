import Link from 'next/link';
import { Waves, List, MapPin, BarChart3, Users, ShoppingBag, Menu } from 'lucide-react';
import { NavLink } from './NavLink';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';

const navItems = [
  { href: '/', label: 'Home', icon: Waves },
  { href: '/swell-forecaster', label: 'Swell Forecaster', icon: BarChart3 },
  { href: '/surf-map', label: 'Surf Map', icon: MapPin },
  { href: '/directory', label: 'Directory', icon: List },
  { href: '/forum', label: 'Forum', icon: Users },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

export function Header() {
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
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 ml-auto">
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
                <div className="p-6">
                  <Link href="/" className="mb-8 flex items-center space-x-2">
                    <Waves className="h-8 w-8 text-primary" />
                    <span className="font-bold text-2xl">SurfHub</span>
                  </Link>
                  <nav className="flex flex-col space-y-3">
                    {navItems.map((item) => (
                      <NavLink key={item.href} href={item.href} className="text-lg py-2 flex items-center">
                         <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
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
