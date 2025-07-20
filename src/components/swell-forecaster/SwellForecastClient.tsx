'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, MessageSquareText, MapPin, Wind, Cloud } from 'lucide-react';
import { fetchSwellForecastAction, type SwellForecastOutput } from '@/app/swell-forecaster/actions';
import { Label } from '@/components/ui/label';
import { SwellForecastInput } from '@/app/swell-forecaster/actions';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

export function SwellForecastClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<SwellForecastOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const submitHandler: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setForecast(null);

    try {
      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
        throw new Error('OpenWeatherMap API key is not configured. Please check your environment variables.');
      }

      // First, fetch weather data for the location
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(data.location)}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`);
      
      if (!weatherResponse.ok) {
        const errorText = await weatherResponse.text();
        console.error('Weather API Error:', errorText);
        throw new Error(`Unable to fetch weather data for "${data.location}". Please check the location name and try again.`);
      }
      
      const weatherData = await weatherResponse.json();
      
      // Prepare input for swell forecast with weather data
      const input: SwellForecastInput = {
        location: data.location,
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg || 0,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility || 10000,
        cloudiness: weatherData.clouds.all,
        weatherDescription: weatherData.weather[0].description,
        preferredForecastType: 'auto', // Use smart auto-selection
      };

      const result = await fetchSwellForecastAction(input);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setForecast(result.data);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Get Current Surf Conditions
          </CardTitle>
          <CardDescription>
            Enter a location to get intelligent surf conditions powered by AI with automatic data source selection
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(submitHandler)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter location (e.g., Malibu, CA)"
                {...register('location')}
                aria-invalid={errors.location ? "true" : "false"}
                className={errors.location ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.location && (
                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
              )}
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Forecast...
                </>
              ) : (
                'Get Current Conditions'
              )}
            </Button>
          </CardContent>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {forecast && (
        <div className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5" />
                AI Surf Forecast for {forecast.location}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Score: {forecast.surfabilityScore}/10
                </Badge>
                {forecast.forecastType && (
                  <Badge variant="secondary">
                    {forecast.forecastType}
                  </Badge>
                )}
                {forecast.dataQuality && (
                  <Badge variant={forecast.dataQuality === 'Premium' ? 'default' : 'outline'}>
                    {forecast.dataQuality} Data
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Overall Conditions</h4>
                  <p className="text-muted-foreground">{forecast.conditions}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Recommendation</h4>
                  <p className="text-muted-foreground">{forecast.recommendation}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    Wind Conditions
                  </h4>
                  <p className="text-muted-foreground">{forecast.windConditions}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    Weather Summary
                  </h4>
                  <p className="text-muted-foreground">{forecast.weatherSummary}</p>
                </div>

                {/* Enhanced Surf Quality Analysis */}
                {forecast.surfQuality && (
                  <div>
                    <h4 className="font-semibold mb-2">Surf Quality Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {forecast.surfQuality.rating} ({forecast.surfQuality.overallScore}/10)
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{forecast.surfQuality.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Wave Height: {(forecast.surfQuality.breakdown.waveHeight * 10).toFixed(1)}/10</div>
                        <div>Wave Period: {(forecast.surfQuality.breakdown.wavePeriod * 10).toFixed(1)}/10</div>
                        <div>Wind: {(forecast.surfQuality.breakdown.wind * 10).toFixed(1)}/10</div>
                        <div>Swell Direction: {(forecast.surfQuality.breakdown.swellDirection * 10).toFixed(1)}/10</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Real Marine Data */}
                {forecast.marineData && (
                  <div>
                    <h4 className="font-semibold mb-2">Marine Conditions</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Wave Height: {forecast.marineData.waveHeight.toFixed(1)}m</div>
                      <div>Swell Height: {forecast.marineData.primarySwellHeight.toFixed(1)}m</div>
                      <div>Swell Period: {forecast.marineData.primarySwellPeriod}s</div>
                      <div>Swell Direction: {forecast.marineData.primarySwellDirection}°</div>
                      <div>Wind Speed: {forecast.marineData.windSpeed.toFixed(1)} m/s</div>
                      <div>Wind Direction: {forecast.marineData.windDirection}°</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Data source: {forecast.marineData.dataSource}
                    </p>
                  </div>
                )}

                {/* Spot Information */}
                {forecast.spotInfo && (
                  <div>
                    <h4 className="font-semibold mb-2">Spot Information</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Type:</strong> {forecast.spotInfo.type}</div>
                      <div><strong>Difficulty:</strong> {forecast.spotInfo.difficulty}</div>
                      <div><strong>Optimal Conditions:</strong> {forecast.spotInfo.optimalConditions}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
