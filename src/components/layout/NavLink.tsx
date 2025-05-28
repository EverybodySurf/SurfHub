'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type NavLinkProps = ComponentProps<typeof Link> & {
  children: React.ReactNode;
  className?: string;
};

export function NavLink({ href, children, className, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href.toString()));

  return (
    <Link
      href={href}
      className={cn(
        'transition-colors hover:text-foreground/80',
        isActive ? 'text-foreground font-semibold' : 'text-foreground/60',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
