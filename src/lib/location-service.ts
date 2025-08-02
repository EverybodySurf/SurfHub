// Enhanced Location Service - Multiple sources with surf spot support
import { z } from 'zod';

// Location result schema
export const LocationResultSchema = z.object({
  name: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  countryCode: z.string(),
  lat: z.number(),
  lon: z.number(),
  type: z.enum(['city', 'surf_spot', 'beach', 'location']),
  source: z.enum(['openweather', 'surfline', 'manual']),
  displayName: z.string(),
  description: z.string().optional(),
});

export type LocationResult = z.infer<typeof LocationResultSchema>;

// Known surf spots database (expandable)
const KNOWN_SURF_SPOTS = [
  // California
  { name: "Malibu", city: "Malibu", state: "CA", country: "United States", countryCode: "US", lat: 34.0259, lon: -118.7798, type: "surf_spot" as const },
  { name: "Huntington Beach", city: "Huntington Beach", state: "CA", country: "United States", countryCode: "US", lat: 33.6595, lon: -117.9988, type: "surf_spot" as const },
  { name: "Manhattan Beach", city: "Manhattan Beach", state: "CA", country: "United States", countryCode: "US", lat: 33.8847, lon: -118.4109, type: "surf_spot" as const },
  { name: "Santa Monica", city: "Santa Monica", state: "CA", country: "United States", countryCode: "US", lat: 34.0195, lon: -118.4912, type: "surf_spot" as const },
  { name: "Venice Beach", city: "Venice", state: "CA", country: "United States", countryCode: "US", lat: 33.9850, lon: -118.4695, type: "surf_spot" as const },
  { name: "Trestles", city: "San Clemente", state: "CA", country: "United States", countryCode: "US", lat: 33.3850, lon: -117.5981, type: "surf_spot" as const },
  { name: "Steamer Lane", city: "Santa Cruz", state: "CA", country: "United States", countryCode: "US", lat: 36.9506, lon: -122.0226, type: "surf_spot" as const },
  
  // Hawaii
  { name: "Pipeline", city: "Haleiwa", state: "HI", country: "United States", countryCode: "US", lat: 21.6620, lon: -158.0512, type: "surf_spot" as const },
  { name: "Sunset Beach", city: "Haleiwa", state: "HI", country: "United States", countryCode: "US", lat: 21.6756, lon: -158.0375, type: "surf_spot" as const },
  { name: "Waikiki", city: "Honolulu", state: "HI", country: "United States", countryCode: "US", lat: 21.2793, lon: -157.8311, type: "surf_spot" as const },
  
  // Australia
  { name: "Bondi Beach", city: "Sydney", state: "NSW", country: "Australia", countryCode: "AU", lat: -33.8915, lon: 151.2767, type: "surf_spot" as const },
  { name: "Bells Beach", city: "Torquay", state: "VIC", country: "Australia", countryCode: "AU", lat: -38.3736, lon: 144.2844, type: "surf_spot" as const },
  { name: "Superbank", city: "Gold Coast", state: "QLD", country: "Australia", countryCode: "AU", lat: -28.1658, lon: 153.5360, type: "surf_spot" as const },
  
  // Portugal
  { name: "Nazaré", city: "Nazaré", country: "Portugal", countryCode: "PT", lat: 39.6018, lon: -9.0719, type: "surf_spot" as const },
  { name: "Ericeira", city: "Ericeira", country: "Portugal", countryCode: "PT", lat: 38.9632, lon: -9.4156, type: "surf_spot" as const },
  
  // France
  { name: "Hossegor", city: "Hossegor", country: "France", countryCode: "FR", lat: 43.6618, lon: -1.3972, type: "surf_spot" as const },
  { name: "Biarritz", city: "Biarritz", country: "France", countryCode: "FR", lat: 43.4832, lon: -1.5586, type: "surf_spot" as const },
  
  // Spain
  { name: "Mundaka", city: "Mundaka", country: "Spain", countryCode: "ES", lat: 43.4073, lon: -2.6969, type: "surf_spot" as const },
  { name: "San Sebastian", city: "San Sebastian", country: "Spain", countryCode: "ES", lat: 43.3183, lon: -1.9812, type: "surf_spot" as const },
  
  // Indonesia
  { name: "Uluwatu", city: "Uluwatu", country: "Indonesia", countryCode: "ID", lat: -8.8290, lon: 115.0851, type: "surf_spot" as const },
  { name: "Padang Padang", city: "Uluwatu", country: "Indonesia", countryCode: "ID", lat: -8.8394, lon: 115.0866, type: "surf_spot" as const },
  
  // Morocco
  { name: "Taghazout", city: "Taghazout", country: "Morocco", countryCode: "MA", lat: 30.5441, lon: -9.7076, type: "surf_spot" as const },
  
  // Costa Rica
  { name: "Tamarindo", city: "Tamarindo", country: "Costa Rica", countryCode: "CR", lat: 10.2989, lon: -85.8436, type: "surf_spot" as const },
  { name: "Jaco", city: "Jaco", country: "Costa Rica", countryCode: "CR", lat: 9.6142, lon: -84.6274, type: "surf_spot" as const },
];

export class LocationService {
  private openWeatherApiKey: string;

  constructor(apiKey: string) {
    this.openWeatherApiKey = apiKey;
  }

  /**
   * Search for locations with multiple results support
   */
  async searchLocations(query: string): Promise<LocationResult[]> {
    const results: LocationResult[] = [];

    try {
      // 1. First check known surf spots
      const surfSpotResults = this.searchSurfSpots(query);
      results.push(...surfSpotResults);

      // 2. Search OpenWeatherMap geocoding for cities/locations
      const cityResults = await this.searchCities(query);
      results.push(...cityResults);

      // 3. Remove duplicates and rank results
      const uniqueResults = this.deduplicateAndRank(results, query);

      return uniqueResults.slice(0, 5); // Return top 5 results
    } catch (error) {
      console.error('Location search error:', error);
      throw new Error('Failed to search for locations');
    }
  }

  /**
   * Search known surf spots
   */
  private searchSurfSpots(query: string): LocationResult[] {
    const queryLower = query.toLowerCase().trim();
    
    return KNOWN_SURF_SPOTS
      .filter(spot => 
        spot.name.toLowerCase().includes(queryLower) ||
        spot.city.toLowerCase().includes(queryLower)
      )
      .map(spot => ({
        name: spot.name,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        countryCode: spot.countryCode,
        lat: spot.lat,
        lon: spot.lon,
        type: spot.type,
        source: 'manual' as const,
        displayName: spot.state 
          ? `${spot.name} - ${spot.city}, ${spot.state}, ${spot.country}`
          : `${spot.name} - ${spot.city}, ${spot.country}`,
        description: `Famous surf spot in ${spot.city}`
      }));
  }

  /**
   * Search cities using OpenWeatherMap Geocoding API
   */
  private async searchCities(query: string): Promise<LocationResult[]> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.openWeatherApiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch geocoding data');
      }

      const geoData = await response.json();

      return geoData.map((location: any) => ({
        name: location.name,
        city: location.name,
        state: location.state,
        country: location.country,
        countryCode: location.country,
        lat: location.lat,
        lon: location.lon,
        type: 'city' as const,
        source: 'openweather' as const,
        displayName: location.state 
          ? `${location.name}, ${location.state}, ${location.country}`
          : `${location.name}, ${location.country}`,
        description: `City in ${location.country}`
      }));
    } catch (error) {
      console.error('City search error:', error);
      return [];
    }
  }

  /**
   * Remove duplicates and rank results by relevance
   */
  private deduplicateAndRank(results: LocationResult[], query: string): LocationResult[] {
    const queryLower = query.toLowerCase().trim();
    
    // Remove duplicates based on coordinates (within 0.1 degree)
    const unique = results.filter((result, index, self) => 
      index === self.findIndex(r => 
        Math.abs(r.lat - result.lat) < 0.1 && 
        Math.abs(r.lon - result.lon) < 0.1
      )
    );

    // Rank by relevance
    return unique.sort((a, b) => {
      // Exact name matches first
      const aExactMatch = a.name.toLowerCase() === queryLower;
      const bExactMatch = b.name.toLowerCase() === queryLower;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Surf spots preferred over cities
      if (a.type === 'surf_spot' && b.type !== 'surf_spot') return -1;
      if (a.type !== 'surf_spot' && b.type === 'surf_spot') return 1;

      // Name starts with query
      const aStartsWith = a.name.toLowerCase().startsWith(queryLower);
      const bStartsWith = b.name.toLowerCase().startsWith(queryLower);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Alphabetical
      return a.displayName.localeCompare(b.displayName);
    });
  }

  /**
   * Get weather data for a specific location
   */
  async getWeatherData(location: LocationResult) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${this.openWeatherApiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data for ${location.displayName}`);
    }

    return response.json();
  }
}

// Utility function to create location display name
export function createLocationDisplayName(location: LocationResult): string {
  if (location.type === 'surf_spot') {
    return location.state 
      ? `🏄‍♂️ ${location.name} - ${location.city}, ${location.state}, ${location.country}`
      : `🏄‍♂️ ${location.name} - ${location.city}, ${location.country}`;
  }
  
  return location.state 
    ? `📍 ${location.city}, ${location.state}, ${location.country}`
    : `📍 ${location.city}, ${location.country}`;
}
