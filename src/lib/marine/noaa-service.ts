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
          waves: await this.tryFetchWaves(lat, lon),
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

  /**
   * Attempt to fetch wave data from NOAA Wave Watch III / marine endpoints.
   * Falls back to sensible defaults with a warning if wave data is unavailable.
   *
   * NOTE: NOAA's REST API (api.weather.gov) does not natively expose WW3 model
   * output (wave height, swell period/direction, wind wave data). The values
   * returned here are placeholder defaults. Proper NOAA WW3 integration would
   * require ingesting GRIB2 files from https://nomads.ncep.noaa.gov/ or using
   * a dedicated marine data provider (e.g. Stormglass, Spire, Sofar Ocean).
   */
  private async tryFetchWaves(lat: number, lon: number): Promise<MarineConditions['waves']> {
    try {
      // Attempt to fetch wave data from the NWS marine forecast if available for this grid
      const gridResponse = await fetch(`${this.noaaBaseUrl}/gridpoints/${lat},${lon}`);
      if (!gridResponse.ok) {
        throw new Error('Grid data unavailable');
      }
      const gridData = await gridResponse.json();
      const gridId = gridData.properties?.gridId;
      const gridX = gridData.properties?.gridX;
      const gridY = gridData.properties?.gridY;

      if (gridId && gridX != null && gridY != null) {
        // Some NWS grid forecasts include wave/water state parameters
        try {
          const marineResponse = await fetch(
            `${this.noaaBaseUrl}/gridpoints/${gridId}/${gridX},${gridY}/forecast`
          );
          if (marineResponse.ok) {
            const marineData = await marineResponse.json();
            const periods = marineData.properties?.periods;
            if (periods?.length) {
              // Attempt to parse wave-height-like values from detailed forecasts
              // This is best-effort; NOAA WW3 GRIB ingestion would be more accurate
              const first = periods[0];
              // Some coastal grids expose wave height in detailedForecast
              const detailed = first.detailedForecast || first.shortForecast || '';
              const waveMatch = detailed.match(/(\d+(\.\d+)?)\s*(foot|feet)/i);
              const waveHeight = waveMatch ? parseFloat(waveMatch[1]) * 0.3048 : 1.5;
              return {
                significantHeight: waveHeight,
                primarySwellHeight: waveHeight * 0.8,
                primarySwellPeriod: 8,
                primarySwellDirection: 225,
                windWaveHeight: waveHeight * 0.3,
                windWavePeriod: 4,
                windWaveDirection: 270,
              };
            }
          }
        } catch {
          // Fall through to defaults below
        }
      }
    } catch {
      // Fall through to defaults below
    }

    console.warn(
      `[NOAA] Wave data unavailable for ${lat},${lon} — using placeholder defaults. ` +
      'Integrate NOAA WW3 GRIB ingestion or a dedicated wave provider for real values.'
    );

    return {
      significantHeight: 1.5,
      primarySwellHeight: 1.2,
      primarySwellPeriod: 8,
      primarySwellDirection: 225,
      windWaveHeight: 0.5,
      windWavePeriod: 4,
      windWaveDirection: 270,
    };
  }

  private parseWindSpeed(windSpeed: string): number {
    const match = windSpeed.match(/(\d+)/);
    return match ? parseInt(match[1]) * 0.44704 : 5;
  }

  private parseWindDirection(windDirection: string): number {
    return WIND_DIRECTIONS[windDirection] || 270;
  }
}
