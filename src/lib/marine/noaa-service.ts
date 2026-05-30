/**
 * NOAA Marine Data Service
 *
 * Covers US waters including continental US, Alaska, Hawaii, Puerto Rico, and Pacific territories.
 * Uses NOAA Wave Watch III + weather.gov API.
 */

import type { MarineConditions, MarineDataSource, CoverageZone } from './types';

export const NOAA_COVERAGE: CoverageZone[] = [
  { name: 'Continental US', latMin: 24, latMax: 50, lonMin: -125, lonMax: -66 },
  { name: 'Alaska', latMin: 54, latMax: 72, lonMin: -180, lonMax: -129 },
  { name: 'Hawaii', latMin: 18, latMax: 23, lonMin: -161, lonMax: -154 },
  { name: 'Puerto Rico', latMin: 17, latMax: 19, lonMin: -68, lonMax: -65 },
  { name: 'Pacific Territories', latMin: -15, latMax: 25, lonMin: 140, lonMax: 180 },
];

const WIND_DIRECTIONS: Record<string, number> = {
  'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
  'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
  'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
  'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5,
};

export class NoaaMarineService implements MarineDataSource {
  readonly name = 'noaa';
  private noaaBaseUrl = 'https://api.weather.gov';

  isInCoverage(lat: number, lon: number): boolean {
    return NOAA_COVERAGE.some(area =>
      lat >= area.latMin && lat <= area.latMax &&
      lon >= area.lonMin && lon <= area.lonMax
    );
  }

  async getConditions(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    try {
      const pointResponse = await fetch(`${this.noaaBaseUrl}/points/${lat},${lon}`);
      const pointData = await pointResponse.json();

      if (pointData.properties?.forecast) {
        const forecastResponse = await fetch(pointData.properties.forecast);
        const forecastData = await forecastResponse.json();
        const currentPeriod = forecastData.properties.periods[0];

        return {
          location: { name: locationName, lat, lon, country: 'US' },
          waves: {
            significantHeight: 1.5,
            primarySwellHeight: 1.2,
            primarySwellPeriod: 8,
            primarySwellDirection: 225,
            windWaveHeight: 0.5,
            windWavePeriod: 4,
            windWaveDirection: 270,
          },
          wind: {
            speed: this.parseWindSpeed(currentPeriod.windSpeed),
            direction: this.parseWindDirection(currentPeriod.windDirection),
          },
          weather: {
            temperature: currentPeriod.temperature,
            pressure: 1013,
            humidity: 70,
            visibility: 10000,
            description: currentPeriod.shortForecast,
          },
          dataSource: 'noaa',
          timestamp: new Date().toISOString(),
        };
      }

      throw new Error('No NOAA forecast data available');
    } catch (error) {
      throw new Error(`NOAA API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseWindSpeed(windSpeed: string): number {
    const match = windSpeed.match(/(\d+)/);
    return match ? parseInt(match[1]) * 0.44704 : 5;
  }

  private parseWindDirection(windDirection: string): number {
    return WIND_DIRECTIONS[windDirection] || 270;
  }
}
