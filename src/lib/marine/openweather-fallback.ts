/**
 * OpenWeather Marine Data Fallback
 *
 * Estimated marine conditions from OpenWeather free tier weather data.
 * No real wave data — derives from wind speed + direction.
 * Used as final fallback when all primary sources fail.
 */

import type { MarineConditions, MarineDataSource } from './types';

export class OpenWeatherFallbackService implements MarineDataSource {
  readonly name = 'openweather';

  constructor(private readonly apiKey: string) {}

  async getConditions(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.statusText}`);
    }

    const data = await response.json();
    const windSpeed = data.wind?.speed ?? 5;
    const windDeg = data.wind?.deg ?? 270;

    // Estimate wave conditions from wind
    const estimatedWaveHeight = Math.max(0.3, windSpeed * 0.15);
    const estimatedPeriod = Math.min(12, Math.max(4, windSpeed * 0.4 + 4));

    return {
      location: {
        name: locationName, lat, lon,
        country: data.sys?.country,
      },
      waves: {
        significantHeight: estimatedWaveHeight,
        primarySwellHeight: estimatedWaveHeight * 0.7,
        primarySwellPeriod: estimatedPeriod,
        primarySwellDirection: (windDeg + 180) % 360,
        windWaveHeight: estimatedWaveHeight * 0.3,
        windWavePeriod: Math.max(3, estimatedPeriod * 0.5),
        windWaveDirection: windDeg,
      },
      wind: {
        speed: windSpeed,
        direction: windDeg,
      },
      weather: {
        temperature: data.main?.temp ?? 20,
        pressure: data.main?.pressure ?? 1013,
        humidity: data.main?.humidity ?? 70,
        visibility: data.visibility ?? 10000,
        description: data.weather?.[0]?.description || 'Clear conditions',
      },
      dataSource: 'openweather',
      timestamp: new Date().toISOString(),
    };
  }

  /** Reverse geocode a place name to lat/lon */
  async getCoordinates(locationName: string): Promise<{ lat: number; lon: number; country?: string }> {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${this.apiKey}`
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();
    if (data.length === 0) throw new Error('Location not found');

    return { lat: data[0].lat, lon: data[0].lon, country: data[0].country };
  }
}
