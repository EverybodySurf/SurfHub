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
    significantHeight: number | undefined;
    primarySwellHeight: number | undefined;
    primarySwellPeriod: number | undefined;
    primarySwellDirection: number | undefined;
    secondarySwellHeight?: number | undefined;
    secondarySwellPeriod?: number | undefined;
    secondarySwellDirection?: number | undefined;
    windWaveHeight: number | undefined;
    windWavePeriod: number | undefined;
    windWaveDirection: number | undefined;
  };
  wind: {
    speed: number | undefined;
    direction: number | undefined;
    gusts?: number | undefined;
  };
  weather: {
    temperature: number | undefined;
    pressure: number | undefined;
    humidity: number | undefined;
    visibility: number | undefined;
    description: string;
  };
  tides?: {
    currentHeight: number;
    nextHigh?: { time: string; height: number };
    nextLow?: { time: string; height: number };
  };
  oceanCurrent?: {
    velocity: number | undefined;
    direction: number | undefined;
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
