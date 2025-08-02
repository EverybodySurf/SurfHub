'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquareText, Wind, Cloud, Sun, CloudRain, Waves, Thermometer, Navigation, Activity, Star, MapPin } from 'lucide-react';
import { fetchSwellForecastAction } from '@/app/swell-forecaster/actions';

interface ForecastData {
  location: string;
  conditions: string;
  recommendation: string;
  surfabilityScore: number;
  windConditions: string;
  weatherSummary: string;
  forecastType?: string;
  dataQuality?: string;
  marineData?: {
    waveHeight: number;
    primarySwellHeight: number;
    primarySwellPeriod: number;
    primarySwellDirection: number;
    windSpeed: number;
    windDirection: number;
    secondarySwellHeight?: number;
    seaTemperature?: number;
    dataSource: string;
  };
  surfQuality?: {
    rating: string;
    overallScore: number;
    description: string;
    breakdown: {
      waveHeight: number;
      wavePeriod: number;
      wind: number;
      swellDirection: number;
    };
  };
  spotInfo?: {
    type: string;
    difficulty: string;
    optimalConditions: string;
  };
}

interface SwellForecastClientProps {
  activeTab?: string;
  sharedForecast?: any;
  sharedLocation?: string;
  onForecastChange?: (forecast: any, location: string) => void;
}

export default function SwellForecastClient({ 
  activeTab, 
  sharedForecast, 
  sharedLocation, 
  onForecastChange 
}: SwellForecastClientProps) {
  const [location, setLocation] = useState(sharedLocation || '');
  const [forecast, setForecast] = useState<ForecastData | null>(sharedForecast || null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchDateTime, setSearchDateTime] = useState<string | null>(null);

  // Update local state when shared state changes
  useEffect(() => {
    setForecast(sharedForecast || null);
    setLocation(sharedLocation || '');
  }, [sharedForecast, sharedLocation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await fetchSwellForecastAction({ 
        location, 
        preferredForecastType: 'auto' 
      });
      if (result.error) {
        console.error('Error generating forecast:', result.error);
      } else if (result.data) {
        // Capture the current date and time when search is successful
        const now = new Date();
        const formattedDateTime = now.toLocaleString('en-CA', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZoneName: 'short'
        });
        
        setForecast(result.data);
        setSearchDateTime(formattedDateTime);
        onForecastChange?.(result.data, location);
      }
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get weather icon
  const getWeatherIcon = (weatherSummary: string) => {
    const weather = weatherSummary.toLowerCase();
    if (weather.includes('rain') || weather.includes('storm')) {
      return <CloudRain className="h-8 w-8 text-blue-600" />;
    } else if (weather.includes('cloud') || weather.includes('overcast')) {
      return <Cloud className="h-8 w-8 text-gray-600" />;
    } else {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <div className={`transition-all duration-700 ease-in-out ${
      forecast ? 'max-w-7xl mx-auto space-y-8' : 'space-y-6'
    }`}>
      {/* Top Row: Search Card + Overall Conditions Card (when forecast exists) */}
      {forecast ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
          {/* Compact Search Card - Takes 1/3 width on large screens */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-2 text-card-foreground">
                <MapPin className="h-8 w-8 text-card-foreground" />
                Search
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <form onSubmit={handleSearch} className="flex flex-col gap-3">
                    <Input
                      type="text"
                      placeholder="Enter surf spot or location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full"
                      disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      {isLoading ? 'Searching...' : 'Search'}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Conditions Summary Card - Takes 2/3 width on large screens */}
          <Card className="lg:col-span-2 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-xl text-card-foreground">
                    Overall Conditions Summary - {forecast.location}
                  </CardTitle>
                </div>
                {searchDateTime && (
                  <div className="text-lg text-card-foreground">
                    {searchDateTime}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <strong className="text-card-foreground">Wave Score:</strong>
                    <Badge variant="outline" className="text-xl px-4 py-2 font-bold text-card-foreground">
                      {forecast.surfabilityScore}/10
                    </Badge>
                  </div>
                  <p className="text-sm text-card-foreground leading-relaxed bg-background p-3 rounded-lg border border-card-border">
                    {forecast.conditions.split('.')[0]}. Current conditions at {forecast.location}.
                  </p>
                </div>
                <div className="space-y-6">
                  {getWeatherIcon(forecast.weatherSummary)}
                  <div className="bg-background p-3 rounded-lg border border-card-border space-y-2">
                    <p className="text-sm text-card-foreground"><strong>Weather:</strong> {forecast.weatherSummary}</p>
                    <p className="text-sm text-card-foreground">{forecast.recommendation.split('.')[0]}.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Original Search Card for when no forecast exists */
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter surf spot or location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Conditions Content */}
      {forecast && (!activeTab || activeTab === 'current') && (
        <div className="w-full space-y-8 animate-in slide-in-from-bottom-4 duration-700">

          {/* AI Advice Card - Full width */}
          <Card className="shadow-none bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                AI Surf Recommendation & Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg border border-card-border inset-shadow-sm space-y-4 bg-background">
                <div>
                  <h5 className="font-semibold text-base mb-2 text-card-foreground">General Recommendation</h5>
                  <p className="text-base leading-relaxed text-card-foreground">
                    {forecast.recommendation}
                  </p>
                </div>
                
                {/* Extract detailed advice from conditions if available */}
                {forecast.conditions.length > 100 && (
                  <div className="space-y-3">
                    <h5 className="font-semibold text-base mb-2 text-card-foreground">Detailed Analysis</h5>
                    <div className="text-base leading-relaxed text-card-foreground">
                      {/* Split conditions into meaningful sections */}
                      {forecast.conditions.split('.').slice(1).map((sentence, index) => {
                        const trimmed = sentence.trim();
                        if (trimmed.length > 10) {
                          return (
                            <p key={index} className="mb-2 text-card-foreground">
                              {trimmed}.
                            </p>
                          );
                        }
                        return null;
                      }).filter(Boolean)}
                    </div>
                  </div>
                )}

                {/* Add spot-specific info if available */}
                {forecast.spotInfo && (
                  <div>
                    <h5 className="font-semibold text-base mb-2 text-card-foreground">Spot Information</h5>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-card-foreground">
                      <div>
                        <strong>Type:</strong> {forecast.spotInfo.type}
                      </div>
                      <div>
                        <strong>Difficulty:</strong> {forecast.spotInfo.difficulty}
                      </div>
                      <div>
                        <strong>Optimal Conditions:</strong> {forecast.spotInfo.optimalConditions}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add wind conditions details */}
                {forecast.windConditions && (
                  <div>
                    <h5 className="font-semibold text-base mb-2 text-card-foreground">Wind Analysis</h5>
                    <p className="text-base leading-relaxed text-card-foreground">
                      {forecast.windConditions}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Scoring Card - Full width */}
          <Card className="shadow-none bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                Detailed Surf Quality Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background p-4 rounded-lg border border-card-border">
                <div className="grid lg:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-card-foreground mb-2">
                      {forecast.surfabilityScore}/10
                    </div>
                    <div className="text-sm font-medium text-card-foreground">Overall Score</div>
                  </div>
                  {forecast.surfQuality?.breakdown && (
                    <>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-card-foreground mb-2">
                          {forecast.surfQuality.breakdown.waveHeight}/10
                        </div>
                        <div className="text-sm font-medium text-card-foreground">Wave Height</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-card-foreground mb-2">
                          {forecast.surfQuality.breakdown.wavePeriod}/10
                        </div>
                        <div className="text-sm font-medium text-card-foreground">Wave Period</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-card-foreground mb-2">
                          {forecast.surfQuality.breakdown.wind}/10
                        </div>
                        <div className="text-sm font-medium text-card-foreground">Wind Quality</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-card-foreground mb-2">
                          {forecast.surfQuality.breakdown.swellDirection}/10
                        </div>
                        <div className="text-sm font-medium text-card-foreground">Swell Direction</div>
                      </div>
                    </>
                  )}
                </div>
                {forecast.surfQuality && (
                  <div className="mt-6 pt-4 border-t border-card-border">
                    <p className="text-card-foreground text-center">
                      <strong>Quality Rating:</strong> {forecast.surfQuality.rating} - {forecast.surfQuality.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Primary Data Cards - Optimized grid for wide screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {/* Wave Height Card */}
            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                  Wave Height
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-card-foreground text-center flex justify-start">
                  {forecast.marineData ? `${forecast.marineData.waveHeight.toFixed(1)}m` : 'N/A'}
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>What this means:</strong><br />
                  {forecast.marineData && forecast.marineData.waveHeight > 2 
                    ? 'Good surf size for most surfers. Ideal conditions for catching waves.' 
                    : forecast.marineData && forecast.marineData.waveHeight > 1
                    ? 'Suitable for beginners and longboarders. Great for learning.'
                    : 'Small surf conditions. Best for beginners.'}
                </div>
              </CardContent>
            </Card>

            {/* Swell Period Card */}
            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                  Swell Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-card-foreground text-center flex justify-start">
                  {forecast.marineData ? `${forecast.marineData.primarySwellPeriod}s` : 'N/A'}
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>What this means:</strong><br />
                  {forecast.marineData && forecast.marineData.primarySwellPeriod > 12
                    ? 'Long period swells create powerful, organized waves with more push.'
                    : forecast.marineData && forecast.marineData.primarySwellPeriod > 8
                    ? 'Medium period swells provide good surfable waves with decent power.'
                    : 'Short period swells create choppy, less organized conditions.'}
                </div>
              </CardContent>
            </Card>

            {/* Wind Info Card */}
            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                  Wind Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-card-foreground text-center flex justify-start">
                  {forecast.marineData ? `${forecast.marineData.windSpeed.toFixed(1)} m/s` : 'N/A'}
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>What this means:</strong><br />
                  {forecast.marineData && forecast.marineData.windSpeed < 5
                    ? 'Light winds create clean, glassy surf conditions. Perfect for surfing!'
                    : forecast.marineData && forecast.marineData.windSpeed < 10
                    ? 'Moderate winds add some texture to waves but still surfable.'
                    : 'Strong winds create choppy, difficult surfing conditions.'}
                </div>
              </CardContent>
            </Card>

            {/* Tide Info Card */}
            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                  Tide Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-card-foreground text-center flex justify-start">
                  Variable
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>What this means:</strong><br />
                  Tide timing affects how waves break and determines accessibility to different surf spots.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Data Cards - Wider layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Secondary Swell */}
            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                  Secondary Swell
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-card-foreground text-center flex justify-start">
                  {forecast.marineData?.secondarySwellHeight 
                    ? `${forecast.marineData.secondarySwellHeight.toFixed(1)}m` 
                    : 'None'
                  }
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>What this means:</strong><br />
                  {forecast.marineData?.secondarySwellHeight
                    ? 'Additional swell sources can create more complex wave patterns.'
                    : 'Single swell source typically creates cleaner, more predictable conditions.'}
                </div>
              </CardContent>
            </Card>

            {/* Water Temperature */}
            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                  Water Temp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-card-foreground text-center flex justify-start">
                  {forecast.marineData?.seaTemperature 
                    ? `${forecast.marineData.seaTemperature}°C` 
                    : 'N/A'
                  }
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>What this means:</strong><br />
                  {forecast.marineData?.seaTemperature && forecast.marineData.seaTemperature > 20
                    ? 'Warm water - comfortable for surfing in boardshorts or thin wetsuit.'
                    : forecast.marineData?.seaTemperature && forecast.marineData.seaTemperature > 15
                    ? 'Moderate temperature - 3/2mm wetsuit recommended.'
                    : 'Cold water - full 4/3mm+ wetsuit with boots and gloves needed.'}
                </div>
              </CardContent>
            </Card>

            {/* Swell Direction */}
            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                  Swell Direction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-card-foreground text-center flex justify-start">
                  {forecast.marineData ? `${forecast.marineData.primarySwellDirection}°` : 'N/A'}
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>What this means:</strong><br />
                  The direction the swell is traveling from affects how waves break at different surf spots.
                </div>
              </CardContent>
            </Card>

            {/* Data Source */}
            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-base text-card-foreground flex items-center gap-2">
                  Data Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-card-foreground text-center flex justify-start">
                  {forecast.marineData?.dataSource || 'Mixed'}
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>What this means:</strong><br />
                  Data source quality affects forecast accuracy. Higher quality sources provide more reliable predictions.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Extended Forecast Content */}
      {forecast && activeTab === 'forecast' && (
        <div className="w-full space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                  Next 6 Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-card-foreground mb-2">
                    {forecast.marineData ? `${(forecast.marineData.waveHeight * 1.1).toFixed(1)}m` : 'N/A'}
                  </div>
                  <div className="text-sm text-card-foreground font-medium">Wave Height</div>
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>Trend:</strong><br />
                  {forecast.surfabilityScore >= 6 ? 'Conditions expected to improve slightly with better organization.' : 'Similar conditions expected with minor variations.'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                  Next 12 Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-card-foreground mb-2">
                    {forecast.marineData ? `${(forecast.marineData.waveHeight * 0.9).toFixed(1)}m` : 'N/A'}
                  </div>
                  <div className="text-sm text-card-foreground font-medium">Wave Height</div>
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>Trend:</strong><br />
                  {forecast.surfabilityScore >= 7 ? 'Peak conditions expected with optimal swell direction and wind.' : 'Moderate conditions likely with good surfable waves.'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                  Next 24 Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-card-foreground mb-2">
                    {forecast.marineData ? `${(forecast.marineData.waveHeight * 0.8).toFixed(1)}m` : 'N/A'}
                  </div>
                  <div className="text-sm text-card-foreground font-medium">Wave Height</div>
                </div>
                <div className="bg-background text-sm text-card-foreground p-3 rounded-lg border border-card-border">
                  <strong>Trend:</strong><br />
                  {forecast.surfabilityScore >= 6 ? 'Favorable conditions continuing with consistent surf opportunities.' : 'Variable conditions with changing swell patterns.'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                Extended Analysis & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-card-foreground">24-Hour Outlook</h4>
                  <div className="bg-background p-4 rounded-lg border border-card-border">
                    <p className="text-base text-card-foreground leading-relaxed">
                      {forecast.recommendation} Based on current patterns, conditions are expected to {
                        forecast.surfabilityScore >= 6 ? 'remain favorable through the next 12-24 hours with consistent surf opportunities' : 
                        'gradually improve over the next 6-12 hours as swell organization increases'
                      }.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-card-foreground">Best Session Times</h4>
                  <div className="space-y-3">
                    <div className="bg-background flex justify-between items-center p-3 rounded-lg border border-card-border">
                      <span className="font-medium">Morning (6-9 AM)</span>
                      <Badge variant={forecast.surfabilityScore >= 7 ? 'default' : 'secondary'}>
                        {forecast.surfabilityScore >= 7 ? 'Excellent' : forecast.surfabilityScore >= 5 ? 'Good' : 'Fair'}
                      </Badge>
                    </div>
                    <div className="bg-background flex justify-between items-center p-3 rounded-lg border border-card-border">
                      <span className="font-medium">Afternoon (2-5 PM)</span>
                      <Badge variant={forecast.surfabilityScore >= 6 ? 'default' : 'secondary'}>
                        {forecast.surfabilityScore >= 6 ? 'Good' : forecast.surfabilityScore >= 4 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                    <div className="bg-background flex justify-between items-center p-3 rounded-lg border border-card-border">
                      <span className="font-medium">Evening (6-8 PM)</span>
                      <Badge variant={forecast.surfabilityScore >= 5 ? 'secondary' : 'outline'}>
                        {forecast.surfabilityScore >= 5 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
