/**
 * MarineDataManager — orchestrates per-source marine data services
 *
 * Follows the service layer pattern:
 * - Each data source is a standalone capability block
 * - This manager owns the selection/fallback logic
 * - Callers don't know or care which source provides the data
 *
 * Selection priority:
 *   1. NOAA (if location is in US waters)
 *   2. Stormglass (if API key provided)
 *   3. WorldWeatherOnline (if API key provided)
 *   4. Open-Meteo (global, free, no key needed)
 *   5. OpenWeather (estimated fallback, always available)
 */

import type { MarineConditions, MarineDataSource } from './types';
import { NoaaMarineService } from './noaa-service';
import { OpenMeteoMarineService } from './openmeteo-service';
import { StormglassMarineService } from './stormglass-service';
import { WorldWeatherOnlineService } from './worldweatheronline-service';
import { OpenWeatherFallbackService } from './openweather-fallback';

export class MarineDataManager {
  private sources: MarineDataSource[];

  constructor(
    openWeatherApiKey: string,
    stormglassApiKey?: string,
    worldWeatherApiKey?: string,
  ) {
    this.sources = [];

    const noaa = new NoaaMarineService();
    this.sources.push(noaa);

    if (stormglassApiKey) {
      this.sources.push(new StormglassMarineService(stormglassApiKey));
    }

    if (worldWeatherApiKey) {
      this.sources.push(new WorldWeatherOnlineService(worldWeatherApiKey));
    }

    // Global free sources
    this.sources.push(new OpenMeteoMarineService());

    // Always-available fallback
    this.sources.push(new OpenWeatherFallbackService(openWeatherApiKey));
  }

  /**
   * Get marine conditions from the best available source.
   * Tries sources in priority order, falling back on failure.
   */
  async getMarineConditions(
    lat: number,
    lon: number,
    locationName: string,
  ): Promise<MarineConditions> {
    const errors: Array<{ source: string; error: string }> = [];

    for (const source of this.sources) {
      try {
        // NOAA uses geographic coverage check
        if (source instanceof NoaaMarineService && !source.isInCoverage(lat, lon)) {
          console.log(`  → ${source.name}: outside coverage, skipping`);
          continue;
        }

        console.log(`  → Trying ${source.name}...`);
        const result = await source.getConditions(lat, lon, locationName);
        console.log(`  ✅ ${source.name} succeeded`);
        return result;
      } catch (error: any) {
        errors.push({ source: source.name, error: error.message });
        console.log(`  ❌ ${source.name} failed: ${error.message}`);
      }
    }

    // All sources failed — throw with full error context
    throw new Error(
      `All marine data sources failed:\n${errors.map(e => `  - ${e.source}: ${e.error}`).join('\n')}`
    );
  }

  /**
   * Resolve a place name to coordinates (geocoding via OpenWeather)
   */
  async getLocationCoordinates(locationName: string): Promise<{ lat: number; lon: number; country?: string }> {
    const fallback = this.sources.find(s => s instanceof OpenWeatherFallbackService) as OpenWeatherFallbackService;
    if (!fallback) {
      throw new Error('Fallback service not initialized');
    }
    return fallback.getCoordinates(locationName);
  }

  /**
   * Get marine conditions by place name (geocodes, then fetches)
   */
  async getMarineConditionsByName(locationName: string): Promise<MarineConditions> {
    const coords = await this.getLocationCoordinates(locationName);
    return this.getMarineConditions(coords.lat, coords.lon, locationName);
  }
}
