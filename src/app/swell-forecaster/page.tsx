'use client';

import SwellForecastClient from '@/components/swell-forecaster/SwellForecastClient';
import { BarChart3, MessageSquareText, Cloud } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function SwellForecasterPage() {
  const [hasForecast, setHasForecast] = useState(false);
  const [sharedForecast, setSharedForecast] = useState(null);
  const [sharedLocation, setSharedLocation] = useState('');

  const handleForecastChange = (forecast: any, location: string) => {
    setSharedForecast(forecast);
    setSharedLocation(location);
    setHasForecast(!!forecast);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page title - conditional rendering based on forecast state */}
      {!hasForecast ? (
        <div className="flex flex-col items-center text-center mb-12">
          <BarChart3 className="h-16 w-16 text-primary mb-4" />
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Surf Reports
          </h2>
        </div>
      ) : (
        <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-top-2 duration-500 px-4">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Surf Reports</h1>
        </div>
      )}

      {/* Tabs - expand width when forecast exists */}
      <div className={`w-full mb-4 px-4 transition-all duration-700 ${
        hasForecast ? 'max-w-7xl mx-auto' : 'max-w-2xl mx-auto'
      }`}>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4" />
              Current Conditions
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Extended Forecast
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <SwellForecastClient 
              activeTab="current" 
              sharedForecast={sharedForecast}
              sharedLocation={sharedLocation}
              onForecastChange={handleForecastChange}
            />
          </TabsContent>
          
          <TabsContent value="forecast">
            <SwellForecastClient 
              activeTab="forecast" 
              sharedForecast={sharedForecast}
              sharedLocation={sharedLocation}
              onForecastChange={handleForecastChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
