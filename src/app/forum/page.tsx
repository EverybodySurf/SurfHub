import type { Metadata } from 'next';
import { Users, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Community Forum - SurfHub',
  description: 'Connect with fellow surfers, share tips, post condition reports, and ask questions in the SurfHub community forum.',
};

export default function ForumPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <Users className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Community Forum
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Join the conversation! Share your surf stories, ask questions, and connect with surfers from around the world. Our forum is paddling out soon!
        </p>
      </div>

      <div className="bg-muted rounded-lg p-8 text-center shadow-lg">
        <div className="relative w-full h-80 mb-6 rounded-md overflow-hidden">
           <Image 
            src="https://placehold.co/1000x500.png" 
            alt="Placeholder image of a community discussion" 
            layout="fill"
            objectFit="cover"
            data-ai-hint="community discussion people"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
            <MessageSquare className="h-20 w-20 text-white mb-4" />
            <h2 className="text-3xl font-semibold text-white">Forum Coming Soon!</h2>
          </div>
        </div>
        <p className="text-xl text-foreground">
          Get ready to dive into discussions, share local knowledge, and become part of the SurfHub family.
        </p>
        <p className="mt-2 text-muted-foreground mb-6">
          We are building a space for you to connect, learn, and share the stoke.
        </p>
        <Button asChild size="lg">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
