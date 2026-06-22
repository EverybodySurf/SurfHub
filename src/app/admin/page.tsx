import type { Metadata } from 'next';
import Link from 'next/link';
import { SlidersHorizontal, Image } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin - SurfHub',
  description: 'SurfHub admin dashboard — curate content and manage hero images.',
};

const adminSections = [
  {
    href: '/admin/curate',
    icon: SlidersHorizontal,
    title: 'Content Curation',
    description: 'Review, approve, and manage feed content. Add new items from Instagram, YouTube, and more.',
    color: 'from-cyan-400 to-teal-500',
  },
  {
    href: '/admin/hero',
    icon: Image,
    title: 'Hero Images',
    description: 'Manage the hero collage image pool. Fetch new images from Unsplash and Pexels, remove stale ones.',
    color: 'from-pink-500 to-purple-600',
  },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background px-8 pt-24 pb-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-10">
          Manage content and images for SurfHub.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${section.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-5`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                
                <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {section.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
