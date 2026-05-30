/**
 * Marine Data — shared types for all source services
 */

export interface MarineConditions {
  location: {
    name: string;
    lat: number;
    lon: number;
    country?: string;
  };
  waves: {
    significantHeight: number;
    primarySwellHeight: number;
    primarySwellPeriod: number;
    primarySwellDirection: number;
    secondarySwellHeight?: number;
    secondarySwellPeriod?: number;
    secondarySwellDirection?: number;
    windWaveHeight: number;
    windWavePeriod: number;
    windWaveDirection: number;
  };
  wind: {
    speed: number;
    direction: number;
    gusts?: number;
  };
  weather: {
    temperature: number;
    pressure: number;
    humidity: number;
    visibility: number;
    description: string;
  };
  tides?: {
    currentHeight: number;
    nextHigh?: { time: string; height: number };
    nextLow?: { time: string; height: number };
  };
  oceanCurrent?: {
    velocity: number;
    direction: number;
  };
  dataSource: 'noaa' | 'stormglass' | 'worldweatheronline' | 'openweather' | 'openmeteo';
  timestamp: string;
}

export interface MarineDataSource {
  readonly name: string;
  getConditions(lat: number, lon: number, locationName: string): Promise<MarineConditions>;
}

/** Coverage area for geographic source selection */
export interface CoverageZone {
  name: string;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}
