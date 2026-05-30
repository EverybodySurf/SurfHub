/**
 * World Weather Online Marine Data Service
 *
 * Global coverage. Requires API key.
 */

import type { MarineConditions, MarineDataSource } from './types';

export class WorldWeatherOnlineService implements MarineDataSource {
  readonly name = 'worldweatheronline';
  private baseUrl = 'https://api.worldweatheronline.com/premium/v1';

  constructor(private readonly apiKey: string) {}

  async getConditions(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    const response = await fetch(
      `${this.baseUrl}/marine.ashx?key=${this.apiKey}&q=${lat},${lon}&format=json&tp=1`
    );

    if (!response.ok) {
      throw new Error(`World Weather Online API error: ${response.statusText}`);
    }

    const data = await response.json();
    const marine = data.data.weather[0].hourly[0];

    return {
      location: { name: locationName, lat, lon },
      waves: {
        significantHeight: parseFloat(marine.sigHeight_m) || 1.0,
        primarySwellHeight: parseFloat(marine.swellHeight_m) || 0.8,
        primarySwellPeriod: parseFloat(marine.swellPeriod_secs) || 8,
        primarySwellDirection: parseFloat(marine.swellDir) || 225,
        windWaveHeight: parseFloat(marine.sigHeight_m) * 0.3 || 0.3,
        windWavePeriod: 4,
        windWaveDirection: parseFloat(marine.winddir16Point) || 270,
      },
      wind: {
        speed: parseFloat(marine.windspeedKmph) * 0.277778,
        direction: parseFloat(marine.winddirDegree) || 270,
      },
      weather: {
        temperature: parseFloat(marine.tempC) || 20,
        pressure: parseFloat(marine.pressure) || 1013,
        humidity: parseFloat(marine.humidity) || 70,
        visibility: parseFloat(marine.visibility) * 1000 || 10000,
        description: marine.weatherDesc[0]?.value || 'Marine conditions',
      },
      dataSource: 'worldweatheronline',
      timestamp: new Date().toISOString(),
    };
  }
}
