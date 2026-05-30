/**
 * Stormglass Marine Data Service
 *
 * Global coverage, commercial API. Requires API key.
 */

import type { MarineConditions, MarineDataSource } from './types';

export class StormglassMarineService implements MarineDataSource {
  readonly name = 'stormglass';

  constructor(private readonly apiKey: string) {}

  async getConditions(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    const params = [
      'waveHeight', 'wavePeriod', 'waveDirection',
      'swellHeight', 'swellPeriod', 'swellDirection',
      'windWaveHeight', 'windWavePeriod', 'windWaveDirection',
      'windSpeed', 'windDirection',
      'airTemperature', 'pressure',
    ].join(',');

    const response = await fetch(
      `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=${params}`,
      { headers: { Authorization: this.apiKey } }
    );

    if (!response.ok) {
      throw new Error(`Stormglass API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.hours?.length) {
      throw new Error('Stormglass returned no hourly data');
    }

    const current = data.hours[0];

    const pick = (field: any, preferred: string = 'noaa') =>
      field?.[preferred] ?? field?.sg ?? 0;

    return {
      location: { name: locationName, lat, lon },
      waves: {
        significantHeight: pick(current.waveHeight) || 1.0,
        primarySwellHeight: pick(current.swellHeight) || 0.8,
        primarySwellPeriod: pick(current.swellPeriod) || 8,
        primarySwellDirection: pick(current.swellDirection) || 225,
        windWaveHeight: pick(current.windWaveHeight) || 0.3,
        windWavePeriod: pick(current.windWavePeriod) || 4,
        windWaveDirection: pick(current.windWaveDirection) || 270,
      },
      wind: {
        speed: pick(current.windSpeed) || 5,
        direction: pick(current.windDirection) || 270,
      },
      weather: {
        temperature: pick(current.airTemperature) || 20,
        pressure: pick(current.pressure) || 1013,
        humidity: 70,
        visibility: 10000,
        description: 'Marine conditions from Stormglass',
      },
      dataSource: 'stormglass',
      timestamp: new Date().toISOString(),
    };
  }
}
