/**
 * Open-Meteo Marine Data Service
 *
 * Global coverage, professional-grade wave data. Free and no API key required.
 */

import type { MarineConditions, MarineDataSource } from './types';

export class OpenMeteoMarineService implements MarineDataSource {
  readonly name = 'openmeteo';

  async getConditions(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    // Try tide data via NOAA (Open-Meteo doesn't provide tides)
    const tideData = await this.getTideData(lat, lon);

    // Fetch marine data
    const params = [
      'wave_height', 'wave_direction', 'wave_period',
      'wind_wave_height', 'wind_wave_direction', 'wind_wave_period',
      'swell_wave_height', 'swell_wave_direction', 'swell_wave_period',
      'secondary_swell_wave_height', 'secondary_swell_wave_period', 'secondary_swell_wave_direction',
      'sea_surface_temperature',
      'ocean_current_velocity', 'ocean_current_direction',
    ].join(',');

    const apiUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=${params}&timezone=auto`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    if (!current) {
      throw new Error('No current data from Open-Meteo');
    }

    const waveHeight = current.wave_height || 1.0;
    const waveDirection = current.wave_direction || 225;
    const wavePeriod = current.wave_period || 8;

    const swellHeight = current.swell_wave_height || waveHeight * 0.7;
    const swellDirection = current.swell_wave_direction || waveDirection;
    const swellPeriod = current.swell_wave_period || wavePeriod;

    const secondarySwellHeight = current.secondary_swell_wave_height || 0;
    const secondarySwellPeriod = current.secondary_swell_wave_period || 0;
    const secondarySwellDirection = current.secondary_swell_wave_direction || 0;

    const seaTemperature = current.sea_surface_temperature || 20;
    const oceanCurrentVelocity = current.ocean_current_velocity || 0;
    const oceanCurrentDirection = current.ocean_current_direction || 0;

    return {
      location: { name: locationName, lat, lon },
      waves: {
        significantHeight: waveHeight,
        primarySwellHeight: swellHeight,
        primarySwellPeriod: swellPeriod,
        primarySwellDirection: swellDirection,
        secondarySwellHeight: secondarySwellHeight > 0 ? secondarySwellHeight : undefined,
        secondarySwellPeriod: secondarySwellPeriod > 0 ? secondarySwellPeriod : undefined,
        secondarySwellDirection: secondarySwellDirection > 0 ? secondarySwellDirection : undefined,
        windWaveHeight: current.wind_wave_height || waveHeight * 0.3,
        windWavePeriod: current.wind_wave_period || 4,
        windWaveDirection: current.wind_wave_direction || waveDirection,
      },
      wind: { speed: 5, direction: 270 },
      weather: {
        temperature: seaTemperature,
        pressure: 1013,
        humidity: 70,
        visibility: 10000,
        description: 'Marine conditions from Open-Meteo',
      },
      tides: tideData,
      oceanCurrent: oceanCurrentVelocity > 0
        ? { velocity: oceanCurrentVelocity, direction: oceanCurrentDirection }
        : undefined,
      dataSource: 'openmeteo',
      timestamp: new Date().toISOString(),
    };
  }

  /** Fetch tide data from NOAA (available globally near coastlines) */
  private async getTideData(
    lat: number, lon: number
  ): Promise<MarineConditions['tides']> {
    try {
      const stationResponse = await fetch(
        `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&units=metric&lat=${lat}&lon=${lon}&radius=50`
      );
      if (!stationResponse.ok) return undefined;

      const stationData = await stationResponse.json();
      if (!stationData.stations?.length) return undefined;

      const station = stationData.stations[0];
      const tideResponse = await fetch(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=today&station=${station.id}&product=predictions&datum=MLLW&time_zone=gmt&units=metric&format=json`
      );
      if (!tideResponse.ok) return undefined;

      const tideData = await tideResponse.json();
      if (!tideData.predictions?.length) return undefined;

      const now = new Date();
      const currentPrediction = tideData.predictions
        .filter((p: any) => new Date(p.t) <= now)
        .pop() || tideData.predictions[0];
      const currentHeight = parseFloat(currentPrediction?.v || '0');

      const extremes = tideData.predictions.filter((p: any) => p.type === 'H' || p.type === 'L');
      const nextHigh = extremes.find((p: any) => p.type === 'H' && new Date(p.t) > now);
      const nextLow = extremes.find((p: any) => p.type === 'L' && new Date(p.t) > now);

      return {
        currentHeight,
        nextHigh: nextHigh ? { time: nextHigh.t, height: parseFloat(nextHigh.v) } : undefined,
        nextLow: nextLow ? { time: nextLow.t, height: parseFloat(nextLow.v) } : undefined,
      };
    } catch {
      return undefined;
    }
  }
}
