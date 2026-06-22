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
 * Parse a numeric value, returning undefined if the value is missing/null/NaN.
 * Unlike `||`, this preserves valid 0 values (0° wind, 0°C, 0m waves).
 * Pass an explicit fallback for fields where a safe neutral default makes sense.
 */
function parseNumeric(val: any): number | undefined;
function parseNumeric(val: any, fallback: number): number;
function parseNumeric(val: any, fallback?: number): number | undefined {
  if (val == null) return fallback;
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

/**
 * Compute a derived numeric value, returning undefined if the input is null/NaN.
 * Pass an explicit fallback for fields where a safe neutral default makes sense.
 */
function computeNumeric(val: any, fn: (n: number) => number): number | undefined;
function computeNumeric(val: any, fn: (n: number) => number, fallback: number): number;
function computeNumeric(val: any, fn: (n: number) => number, fallback?: number): number | undefined {
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
        significantHeight: parseNumeric(marine.sigHeight_m),
        primarySwellHeight: parseNumeric(marine.swellHeight_m),
        primarySwellPeriod: parseNumeric(marine.swellPeriod_secs),
        primarySwellDirection: parseNumeric(marine.swellDir),
        windWaveHeight: computeNumeric(marine.sigHeight_m, h => h * 0.3),
        windWavePeriod: parseNumeric(marine.windWavePeriod_secs),
        windWaveDirection: WIND_DIRECTIONS[marine.winddir16Point] ?? parseNumeric(marine.winddirDegree),
      },
      wind: {
        speed: computeNumeric(marine.windspeedKmph, v => v * 0.277778), // km/h → m/s
        direction: parseNumeric(marine.winddirDegree),
      },
      weather: {
        temperature: parseNumeric(marine.tempC),
        pressure: parseNumeric(marine.pressure),
        humidity: parseNumeric(marine.humidity),
        visibility: computeNumeric(marine.visibility, v => v * 1000),
        description: marine.weatherDesc[0]?.value || 'Marine conditions',
      },
      dataSource: 'worldweatheronline',
      timestamp: new Date().toISOString(),
    };
  }
}
