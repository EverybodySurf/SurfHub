import { Waves } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row max-w-screen-2xl">
        <div className="flex items-center space-x-2">
          <Waves className="h-6 w-6 text-primary" />
          <p className="text-sm text-muted-foreground">
            SurfHub &copy; {new Date().getFullYear()}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Built with <span className="text-primary">♥</span> for the love of waves.
        </p>
      </div>
    </footer>
  );
}
