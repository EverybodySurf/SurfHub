/**
 * World Weather Online Marine Data Service
 *
 * Global coverage. Requires API key.
 */

import type { MarineConditions, MarineDataSource } from './types';

/**
 * Compass direction lookup: string label → degrees.
 * Reference: https://www.nhc.noaa.gov/aboutwindprofile.shtml
 */
const WIND_DIRECTIONS: Record<string, number> = {
  'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
  'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
  'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
  'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5,
};

/**
 * Parse a numeric value, falling back to default if undefined, null, or NaN.
 * Unlike `||`, this preserves valid 0 values (0° wind, 0°C, 0m waves).
 */
function parseNumeric(val: any, fallback: number): number {
  if (val == null) return fallback;
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

/**
 * Compute a derived numeric value, falling back if the input is null/NaN.
 */
function computeNumeric(val: any, fn: (n: number) => number, fallback: number): number {
  if (val == null) return fallback;
  const n = parseFloat(val);
  if (isNaN(n)) return fallback;
  return fn(n);
}

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
        significantHeight: parseNumeric(marine.sigHeight_m, 1.0),
        primarySwellHeight: parseNumeric(marine.swellHeight_m, 0.8),
        primarySwellPeriod: parseNumeric(marine.swellPeriod_secs, 8),
        primarySwellDirection: parseNumeric(marine.swellDir, 225),
        windWaveHeight: computeNumeric(marine.sigHeight_m, h => h * 0.3, 0.3),
        windWavePeriod: 4,
        windWaveDirection: WIND_DIRECTIONS[marine.winddir16Point] ?? parseNumeric(marine.winddirDegree, 270),
      },
      wind: {
        speed: parseFloat(marine.windspeedKmph) * 0.277778,
        direction: parseNumeric(marine.winddirDegree, 270),
      },
      weather: {
        temperature: parseNumeric(marine.tempC, 20),
        pressure: parseNumeric(marine.pressure, 1013),
        humidity: parseNumeric(marine.humidity, 70),
        visibility: computeNumeric(marine.visibility, v => v * 1000, 10000),
        description: marine.weatherDesc[0]?.value || 'Marine conditions',
      },
      dataSource: 'worldweatheronline',
      timestamp: new Date().toISOString(),
    };
  }
}
