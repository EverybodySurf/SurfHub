import type { Metadata } from 'next';
import { SwellForecastClient } from '@/components/swell-forecaster/SwellForecastClient';
import { BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Swell Forecaster - SurfHub',
  description: 'Get AI-powered swell forecasts for any surf spot. Analyze data from multiple sources to advise when and where to go surfing.',
};

export default function SwellForecasterPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <BarChart3 className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          AI Swell Forecaster
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Enter a surf spot below to get an AI-generated swell forecast, helping you decide the best time and place to catch some waves.
        </p>
      </div>
      <SwellForecastClient />
    </div>
  );
}
