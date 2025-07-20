// Marine Data Service - NOAA + Global Sources
import { z } from 'zod';

// Marine data interfaces
export interface MarineConditions {
  location: {
    name: string;
    lat: number;
    lon: number;
    country?: string;
  };
  waves: {
    significantHeight: number; // meters
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
    speed: number; // m/s
    direction: number; // degrees
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
  dataSource: 'noaa' | 'stormglass' | 'worldweatheronline' | 'openweather';
  timestamp: string;
}

export class GlobalMarineDataService {
  private noaaBaseUrl = 'https://api.weather.gov';
  private stormglassBaseUrl = 'https://api.stormglass.io/v2';
  private worldWeatherBaseUrl = 'https://api.worldweatheronline.com/premium/v1';
  
  constructor(
    private openWeatherApiKey: string,
    private stormglassApiKey?: string,
    private worldWeatherApiKey?: string
  ) {}

  /**
   * Get marine conditions from the best available source for the location
   */
  async getMarineConditions(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    // Determine best data source based on location
    const dataSource = this.selectBestDataSource(lat, lon);
    
    try {
      switch (dataSource) {
        case 'noaa':
          return await this.getNoaaData(lat, lon, locationName);
        case 'stormglass':
          return await this.getStormglassData(lat, lon, locationName);
        case 'worldweatheronline':
          return await this.getWorldWeatherOnlineData(lat, lon, locationName);
        default:
          return await this.getOpenWeatherMarineData(lat, lon, locationName);
      }
    } catch (error) {
      console.error(`Failed to get data from ${dataSource}, falling back to OpenWeather`, error);
      return await this.getOpenWeatherMarineData(lat, lon, locationName);
    }
  }

  /**
   * Select the best data source based on geographic location
   */
  private selectBestDataSource(lat: number, lon: number): string {
    // NOAA coverage areas (US waters and territories)
    const noaaCoverage = [
      { name: 'Continental US', latMin: 24, latMax: 50, lonMin: -125, lonMax: -66 },
      { name: 'Alaska', latMin: 54, latMax: 72, lonMin: -180, lonMax: -129 },
      { name: 'Hawaii', latMin: 18, latMax: 23, lonMin: -161, lonMax: -154 },
      { name: 'Puerto Rico', latMin: 17, latMax: 19, lonMin: -68, lonMax: -65 },
      { name: 'Pacific Territories', latMin: -15, latMax: 25, lonMin: 140, lonMax: 180 }
    ];

    // Check if location is in NOAA coverage
    for (const area of noaaCoverage) {
      if (lat >= area.latMin && lat <= area.latMax && 
          lon >= area.lonMin && lon <= area.lonMax) {
        return 'noaa';
      }
    }

    // For global coverage, prefer Stormglass if available
    if (this.stormglassApiKey) return 'stormglass';
    if (this.worldWeatherApiKey) return 'worldweatheronline';
    
    // Fallback to OpenWeather
    return 'openweather';
  }

  /**
   * Get NOAA marine data (US waters)
   */
  private async getNoaaData(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    try {
      // NOAA Wave Watch III API
      const waveResponse = await fetch(
        `https://nomads.ncep.noaa.gov/cgi-bin/filter_wave_multi.pl?file=multi_1.glo_30m.t00z.f000.grib2&lev_surface=on&var_HTSGW=on&var_PERPW=on&var_DIRPW=on&var_WVHGT=on&var_WVPER=on&var_WVDIR=on&subregion=&leftlon=${lon-0.5}&rightlon=${lon+0.5}&toplat=${lat+0.5}&bottomlat=${lat-0.5}&dir=%2Fgfs.${this.getCurrentDateString()}`
      );

      // NOAA weather data
      const weatherResponse = await fetch(`${this.noaaBaseUrl}/points/${lat},${lon}`);
      const pointData = await weatherResponse.json();
      
      if (pointData.properties?.forecast) {
        const forecastResponse = await fetch(pointData.properties.forecast);
        const forecastData = await forecastResponse.json();
        
        const currentPeriod = forecastData.properties.periods[0];
        
        return {
          location: { name: locationName, lat, lon, country: 'US' },
          waves: {
            significantHeight: 1.5, // Default - would parse from GRIB2
            primarySwellHeight: 1.2,
            primarySwellPeriod: 8,
            primarySwellDirection: 225,
            windWaveHeight: 0.5,
            windWavePeriod: 4,
            windWaveDirection: 270
          },
          wind: {
            speed: this.parseWindSpeed(currentPeriod.windSpeed),
            direction: this.parseWindDirection(currentPeriod.windDirection)
          },
          weather: {
            temperature: currentPeriod.temperature,
            pressure: 1013, // Default
            humidity: 70,
            visibility: 10000,
            description: currentPeriod.shortForecast
          },
          dataSource: 'noaa',
          timestamp: new Date().toISOString()
        };
      }
      
      throw new Error('No NOAA forecast data available');
    } catch (error) {
      throw new Error(`NOAA API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Stormglass marine data (Global coverage)
   */
  private async getStormglassData(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    if (!this.stormglassApiKey) {
      throw new Error('Stormglass API key not provided');
    }

    try {
      const params = [
        'waveHeight',
        'wavePeriod', 
        'waveDirection',
        'swellHeight',
        'swellPeriod',
        'swellDirection',
        'windWaveHeight',
        'windWavePeriod',
        'windWaveDirection',
        'windSpeed',
        'windDirection',
        'airTemperature',
        'pressure'
      ].join(',');

      const response = await fetch(
        `${this.stormglassBaseUrl}/weather/point?lat=${lat}&lng=${lon}&params=${params}`,
        {
          headers: {
            'Authorization': this.stormglassApiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Stormglass API error: ${response.statusText}`);
      }

      const data = await response.json();
      const current = data.hours[0];

      return {
        location: { name: locationName, lat, lon },
        waves: {
          significantHeight: current.waveHeight?.noaa || current.waveHeight?.sg || 1.0,
          primarySwellHeight: current.swellHeight?.noaa || current.swellHeight?.sg || 0.8,
          primarySwellPeriod: current.swellPeriod?.noaa || current.swellPeriod?.sg || 8,
          primarySwellDirection: current.swellDirection?.noaa || current.swellDirection?.sg || 225,
          windWaveHeight: current.windWaveHeight?.noaa || current.windWaveHeight?.sg || 0.3,
          windWavePeriod: current.windWavePeriod?.noaa || current.windWavePeriod?.sg || 4,
          windWaveDirection: current.windWaveDirection?.noaa || current.windWaveDirection?.sg || 270
        },
        wind: {
          speed: current.windSpeed?.noaa || current.windSpeed?.sg || 5,
          direction: current.windDirection?.noaa || current.windDirection?.sg || 270
        },
        weather: {
          temperature: current.airTemperature?.noaa || current.airTemperature?.sg || 20,
          pressure: current.pressure?.noaa || current.pressure?.sg || 1013,
          humidity: 70,
          visibility: 10000,
          description: 'Marine conditions'
        },
        dataSource: 'stormglass',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Stormglass error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get World Weather Online marine data
   */
  private async getWorldWeatherOnlineData(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    if (!this.worldWeatherApiKey) {
      throw new Error('World Weather Online API key not provided');
    }

    try {
      const response = await fetch(
        `${this.worldWeatherBaseUrl}/marine.ashx?key=${this.worldWeatherApiKey}&q=${lat},${lon}&format=json&tp=1`
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
          windWaveDirection: parseFloat(marine.winddir16Point) || 270
        },
        wind: {
          speed: parseFloat(marine.windspeedKmph) * 0.277778, // Convert km/h to m/s
          direction: parseFloat(marine.winddirDegree) || 270
        },
        weather: {
          temperature: parseFloat(marine.tempC) || 20,
          pressure: parseFloat(marine.pressure) || 1013,
          humidity: parseFloat(marine.humidity) || 70,
          visibility: parseFloat(marine.visibility) * 1000 || 10000, // Convert km to m
          description: marine.weatherDesc[0].value || 'Marine conditions'
        },
        dataSource: 'worldweatheronline',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`World Weather Online error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fallback to OpenWeather with estimated marine data
   */
  private async getOpenWeatherMarineData(lat: number, lon: number, locationName: string): Promise<MarineConditions> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.openWeatherApiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Estimate marine conditions from weather data
      const windSpeed = data.wind?.speed || 5;
      const estimatedWaveHeight = Math.max(0.3, windSpeed * 0.15);
      const estimatedPeriod = Math.min(12, Math.max(4, windSpeed * 0.4 + 4));

      return {
        location: { name: locationName, lat, lon, country: data.sys?.country },
        waves: {
          significantHeight: estimatedWaveHeight,
          primarySwellHeight: estimatedWaveHeight * 0.7,
          primarySwellPeriod: estimatedPeriod,
          primarySwellDirection: ((data.wind?.deg || 270) + 180) % 360,
          windWaveHeight: estimatedWaveHeight * 0.3,
          windWavePeriod: Math.max(3, estimatedPeriod * 0.5),
          windWaveDirection: data.wind?.deg || 270
        },
        wind: {
          speed: windSpeed,
          direction: data.wind?.deg || 270
        },
        weather: {
          temperature: data.main?.temp || 20,
          pressure: data.main?.pressure || 1013,
          humidity: data.main?.humidity || 70,
          visibility: data.visibility || 10000,
          description: data.weather?.[0]?.description || 'Clear conditions'
        },
        dataSource: 'openweather',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`OpenWeather error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility methods
  private parseWindSpeed(windSpeed: string): number {
    const match = windSpeed.match(/(\d+)/);
    return match ? parseInt(match[1]) * 0.44704 : 5; // Convert mph to m/s
  }

  private parseWindDirection(windDirection: string): number {
    const directions: Record<string, number> = {
      'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
      'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
      'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
      'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    };
    return directions[windDirection] || 270;
  }

  private getCurrentDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Get location coordinates from place name
   */
  async getLocationCoordinates(locationName: string): Promise<{ lat: number; lon: number; country?: string }> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${this.openWeatherApiKey}`
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      if (data.length === 0) {
        throw new Error('Location not found');
      }

      return {
        lat: data[0].lat,
        lon: data[0].lon,
        country: data[0].country
      };
    } catch (error) {
      throw new Error(`Geocoding error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default GlobalMarineDataService;
