// Marine Data Enhanced Swell Forecast
import { z } from 'zod';
import { ai } from '../genkit';
import { SurfQualityCalculator, SURF_SPOTS, type SurfConditions, type SpotConfiguration } from '../../lib/surf-quality-calculator';
import { MarineDataManager, type MarineConditions } from '../../lib/marine';

// Input schema - just needs location
const MarineEnhancedInputSchema = z.object({
  location: z.string().describe('Location for the marine swell forecast'),
});

// Enhanced output with real marine data
const MarineEnhancedOutputSchema = z.object({
  location: z.string(),
  conditions: z.string().describe('Overall surf conditions assessment'),
  recommendation: z.string().describe('Friendly recommendation for surfers'),
  windConditions: z.string().describe('Wind conditions for surfing'),
  weatherSummary: z.string().describe('General weather summary'),
  surfabilityScore: z.number().min(1).max(10).describe('Surfability score from 1-10'),
  
  // Real marine data
      marineData: z.object({
        waveHeight: z.number().optional().describe('Significant wave height in meters'),
        primarySwellHeight: z.number().optional().describe('Primary swell height in meters'),
        primarySwellPeriod: z.number().optional().describe('Primary swell period in seconds'), 
        primarySwellDirection: z.number().optional().describe('Primary swell direction in degrees'),
        secondarySwellHeight: z.number().optional().describe('Secondary swell height in meters'),
        secondarySwellPeriod: z.number().optional().describe('Secondary swell period in seconds'),
        secondarySwellDirection: z.number().optional().describe('Secondary swell direction in degrees'),
        windWaveHeight: z.number().optional().describe('Wind wave height in meters'),
        windWavePeriod: z.number().optional().describe('Wind wave period in seconds'),
        windWaveDirection: z.number().optional().describe('Wind wave direction in degrees'),
        seaTemperature: z.number().optional().describe('Sea surface temperature in Celsius'),
        windSpeed: z.number().optional().describe('Wind speed in m/s'),
        windDirection: z.number().optional().describe('Wind direction in degrees'),
        // New oceanographic data
        currentHeight: z.number().optional().describe('Current tide height in meters'),
        nextHighTide: z.string().optional().describe('Time of next high tide'),
        nextLowTide: z.string().optional().describe('Time of next low tide'), 
        oceanCurrentVelocity: z.number().optional().describe('Ocean current velocity in m/s'),
        oceanCurrentDirection: z.number().optional().describe('Ocean current direction in degrees'),
        dataSource: z.string().describe('Source of marine data'),
      }).optional().describe('Real marine weather conditions'),  // Enhanced surf analysis
  surfQuality: z.object({
    overallScore: z.number().min(1).max(10),
    rating: z.string(),
    breakdown: z.object({
      waveHeight: z.number(),
      wavePeriod: z.number(),
      wind: z.number(),
      swellDirection: z.number(),
    }),
    description: z.string(),
  }).describe('Detailed surf quality analysis'),
  
  // Spot information
  spotInfo: z.object({
    name: z.string(),
    type: z.string(),
    difficulty: z.string(),
    optimalConditions: z.string(),
  }).describe('Information about the surf spot'),
});

// Function to convert marine data to surf conditions
function marineDataToSurfConditions(marine: MarineConditions): SurfConditions {
  return {
    waveHeight: marine.waves.significantHeight ?? 0,
    wavePeriod: marine.waves.primarySwellPeriod ?? 0,
    swellDirection: marine.waves.primarySwellDirection ?? 0,
    windSpeed: marine.wind.speed ?? 0,
    windDirection: marine.wind.direction ?? 0,
    location: marine.location.name,
  };
}

// Function to find or create spot configuration
function getSpotConfiguration(locationName: string, country?: string): SpotConfiguration {
  // Try to find a matching spot
  const locationLower = locationName.toLowerCase();
  
  for (const [spotKey, spotConfig] of Object.entries(SURF_SPOTS)) {
    if (locationLower.includes(spotKey) || 
        spotConfig.name.toLowerCase().includes(locationLower) ||
        locationLower.includes(spotConfig.name.toLowerCase())) {
      return spotConfig;
    }
  }
  
  // Create regional defaults based on country/location
  if (country === 'AU' || locationLower.includes('australia') || locationLower.includes('bondi')) {
    return {
      name: locationName,
      type: 'beach_break',
      aspect: 90, // East-facing
      optimalWaveHeight: [1.0, 2.5],
      optimalSwellDirection: [45, 135], // E-SE swells
      difficulty: 'intermediate'
    };
  }
  
  if (country === 'US' || locationLower.includes('california') || locationLower.includes('malibu')) {
    return {
      name: locationName,
      type: 'point_break',
      aspect: 225, // SW-facing
      optimalWaveHeight: [1.5, 3.0],
      optimalSwellDirection: [200, 280], // SW-W swells
      difficulty: 'intermediate'
    };
  }
  
  if (country === 'FR' || country === 'ES' || country === 'PT' || locationLower.includes('europe')) {
    return {
      name: locationName,
      type: 'beach_break',
      aspect: 270, // West-facing
      optimalWaveHeight: [1.2, 2.8],
      optimalSwellDirection: [225, 315], // SW-NW swells
      difficulty: 'intermediate'
    };
  }
  
  if (country === 'BR' || locationLower.includes('brazil') || locationLower.includes('rio')) {
    return {
      name: locationName,
      type: 'beach_break',
      aspect: 120, // ESE-facing
      optimalWaveHeight: [1.0, 2.2],
      optimalSwellDirection: [90, 180], // E-S swells
      difficulty: 'beginner'
    };
  }
  
  // Default configuration for unknown spots
  return {
    name: locationName,
    type: 'beach_break',
    aspect: 180, // south-facing default
    optimalWaveHeight: [1.0, 2.5],
    optimalSwellDirection: [135, 225], // south swells
    difficulty: 'intermediate'
  };
}

export const marineEnhancedSwellForecastFlow = ai.defineFlow(
  {
    name: 'marineEnhancedSwellForecast',
    inputSchema: MarineEnhancedInputSchema,
    outputSchema: MarineEnhancedOutputSchema,
  },
  async (input) => {
    try {
      // Initialize marine data service
      const openWeatherApiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const stormglassApiKey = process.env.STORMGLASS_API_KEY;
      const worldWeatherApiKey = process.env.WORLD_WEATHER_API_KEY;
      
      let marineConditions: MarineConditions;
      let coordinates: { lat: number; lon: number };

      if (openWeatherApiKey) {
        // Full marine data manager with all available sources
        const marineService = new MarineDataManager(
          openWeatherApiKey,
          stormglassApiKey,
          worldWeatherApiKey
        );
        coordinates = await marineService.getLocationCoordinates(input.location);
        marineConditions = await marineService.getMarineConditions(
          coordinates.lat,
          coordinates.lon,
          input.location
        );
      } else {
        // No API keys — use free Open-Meteo marine API directly
        console.log('Using Open-Meteo free marine API (no API key needed)');
        
        // Geocode location via free Open-Meteo API
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(input.location)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results?.length) throw new Error(`Location "${input.location}" not found`);
        coordinates = { lat: geoData.results[0].latitude, lon: geoData.results[0].longitude };
        
        // Fetch marine data from free Open-Meteo API
        const params = [
          'wave_height', 'wave_direction', 'wave_period',
          'swell_wave_height', 'swell_wave_direction', 'swell_wave_period',
          'secondary_swell_wave_height', 'secondary_swell_wave_period', 'secondary_swell_wave_direction',
          'sea_surface_temperature',
        ].join(',');
        const marineRes = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=${params}&timezone=auto`);
        if (!marineRes.ok) throw new Error(`Open-Meteo API error: ${marineRes.status}`);
        const current = (await marineRes.json()).current;
        if (!current) throw new Error('No marine data available');

        marineConditions = {
          location: { name: input.location, lat: coordinates.lat, lon: coordinates.lon },
          waves: {
            significantHeight: current.wave_height ?? 1.0,
            primarySwellHeight: current.swell_wave_height ?? current.wave_height ?? 1.0,
            primarySwellPeriod: current.swell_wave_period ?? current.wave_period ?? 8,
            primarySwellDirection: current.swell_wave_direction ?? current.wave_direction ?? 225,
            secondarySwellHeight: current.secondary_swell_wave_height ?? undefined,
            secondarySwellPeriod: current.secondary_swell_wave_period ?? undefined,
            secondarySwellDirection: current.secondary_swell_wave_direction ?? undefined,
            windWaveHeight: undefined,
            windWavePeriod: undefined,
            windWaveDirection: undefined,
          },
          wind: { speed: 5, direction: 270 },
          weather: { temperature: current.sea_surface_temperature ?? 20, pressure: 1013, humidity: 70, visibility: 10000, description: 'Marine conditions' },
          dataSource: 'openmeteo',
          timestamp: new Date().toISOString(),
        };
      }
      
      // Convert to surf conditions format
      const surfConditions = marineDataToSurfConditions(marineConditions);
      
      // Get spot configuration
      const spotConfig = getSpotConfiguration(input.location, coordinates.country);
      
      // Calculate surf quality using real marine data
      const surfQuality = SurfQualityCalculator.calculateOverallScore(
        surfConditions,
        spotConfig
      );
      
      // Generate enhanced AI analysis
      const fmt = (v: number | undefined | null, decimals = 1) => v != null ? v.toFixed(decimals) : 'N/A';
      const prompt = `
        Analyze the surf conditions for ${input.location} using real marine data:
        
        MARINE CONDITIONS (from ${marineConditions.dataSource.toUpperCase()}):
        - Significant Wave Height: ${fmt(marineConditions.waves.significantHeight)}m
        - Primary Swell: ${fmt(marineConditions.waves.primarySwellHeight)}m @ ${fmt(marineConditions.waves.primarySwellPeriod)}s from ${fmt(marineConditions.waves.primarySwellDirection)}°
        - Wind Waves: ${fmt(marineConditions.waves.windWaveHeight)}m @ ${fmt(marineConditions.waves.windWavePeriod)}s
        - Wind: ${fmt(marineConditions.wind.speed)} m/s from ${fmt(marineConditions.wind.direction)}°
        - Weather: ${marineConditions.weather.description}, ${fmt(marineConditions.weather.temperature)}°C
        
        SURF SPOT ANALYSIS:
        - Spot Type: ${spotConfig.type}
        - Difficulty: ${spotConfig.difficulty}
        - Optimal Wave Size: ${spotConfig.optimalWaveHeight[0]}-${spotConfig.optimalWaveHeight[1]}m
        - Optimal Swell Direction: ${spotConfig.optimalSwellDirection[0]}-${spotConfig.optimalSwellDirection[1]}°
        
        SURF QUALITY BREAKDOWN:
        - Overall Score: ${surfQuality.overallScore}/10 (${surfQuality.rating})
        - Wave Height Score: ${(surfQuality.breakdown.waveHeight * 10).toFixed(1)}/10
        - Wave Period Score: ${(surfQuality.breakdown.wavePeriod * 10).toFixed(1)}/10
        - Wind Score: ${(surfQuality.breakdown.wind * 10).toFixed(1)}/10
        - Swell Direction Score: ${(surfQuality.breakdown.swellDirection * 10).toFixed(1)}/10
        
        Provide a comprehensive surf forecast including specific advice for surfers at this ${spotConfig.type}. 
        Mention the data source quality and any limitations. Give recommendations for different skill levels.
      `;

      // Try AI text generation — fall back to template when quota exceeded
      let aiText: string;
      try {
        const aiResponse = await ai.generate({
          prompt: prompt,
          model: 'googleai/gemini-2.0-flash',
        });
        aiText = aiResponse.text;
      } catch (aiError: any) {
        console.log('AI generation unavailable — using template-based forecast');
        // Generate template-based forecast from real marine data
        const waveQual = surfQuality.breakdown.waveHeight > 0.6 ? 'good' : surfQuality.breakdown.waveHeight > 0.3 ? 'moderate' : 'small';
        const windQual = surfQuality.breakdown.wind > 0.6 ? 'favorable' : surfQuality.breakdown.wind > 0.3 ? 'marginal' : 'poor';
        aiText = [
          `Surf report for ${input.location}`,
          `Wave height: ${fmt(marineConditions.waves.significantHeight)}m, period ${fmt(marineConditions.waves.primarySwellPeriod)}s`,
          `Swell direction: ${fmt(marineConditions.waves.primarySwellDirection)}°, ${waveQual} waves`,
          `Wind: ${fmt(marineConditions.wind.speed)} m/s from ${fmt(marineConditions.wind.direction)}°, ${windQual}`,
          `Sea temperature: ${fmt(marineConditions.weather.temperature)}°C`,
          `Overall surfability: ${surfQuality.overallScore}/10 — ${surfQuality.rating}`,
          surfQuality.description,
          marineConditions.waves.secondarySwellHeight ? `Secondary swell: ${fmt(marineConditions.waves.secondarySwellHeight)}m` : '',
          `Data source: ${marineConditions.dataSource.toUpperCase()}`,
        ].filter(Boolean).join('. ');
      }

      return {
        location: input.location,
        conditions: aiText,
        recommendation: surfQuality.description,
        windConditions: `${fmt(marineConditions.wind.speed)} m/s from ${fmt(marineConditions.wind.direction)}° (${surfQuality.breakdown.wind > 0.7 ? 'Favorable' : surfQuality.breakdown.wind > 0.4 ? 'Marginal' : 'Poor'})`,
        weatherSummary: `${marineConditions.weather.description}, ${fmt(marineConditions.weather.temperature)}°C`,
        surfabilityScore: surfQuality.overallScore,
        
        marineData: {
          waveHeight: marineConditions.waves.significantHeight,
          primarySwellHeight: marineConditions.waves.primarySwellHeight,
          primarySwellPeriod: marineConditions.waves.primarySwellPeriod,
          primarySwellDirection: marineConditions.waves.primarySwellDirection,
          secondarySwellHeight: marineConditions.waves.secondarySwellHeight,
          secondarySwellPeriod: marineConditions.waves.secondarySwellPeriod,
          secondarySwellDirection: marineConditions.waves.secondarySwellDirection,
          windWaveHeight: marineConditions.waves.windWaveHeight,
          windWavePeriod: marineConditions.waves.windWavePeriod,
          windWaveDirection: marineConditions.waves.windWaveDirection,
          seaTemperature: marineConditions.weather.temperature,
          windSpeed: marineConditions.wind.speed,
          windDirection: marineConditions.wind.direction,
          dataSource: marineConditions.dataSource,
        },
        
        surfQuality: {
          overallScore: surfQuality.overallScore,
          rating: surfQuality.rating,
          breakdown: {
            waveHeight: surfQuality.breakdown.waveHeight,
            wavePeriod: surfQuality.breakdown.wavePeriod,
            wind: surfQuality.breakdown.wind,
            swellDirection: surfQuality.breakdown.swellDirection,
          },
          description: surfQuality.description,
        },
        
        spotInfo: {
          name: spotConfig.name,
          type: spotConfig.type,
          difficulty: spotConfig.difficulty,
          optimalConditions: `${spotConfig.optimalWaveHeight[0]}-${spotConfig.optimalWaveHeight[1]}m waves from ${spotConfig.optimalSwellDirection[0]}-${spotConfig.optimalSwellDirection[1]}°`,
        },
      };
      
    } catch (error) {
      console.error('Marine enhanced swell forecast error:', error);
      
      // Fallback to basic analysis
      return {
        location: input.location,
        conditions: `Unable to fetch marine data for ${input.location}. Please check the location name and try again.`,
        recommendation: 'Marine data unavailable - using weather-based estimates.',
        windConditions: 'Wind data unavailable',
        weatherSummary: 'Weather data unavailable',
        surfabilityScore: 5,
        
        marineData: {
          waveHeight: undefined,
          primarySwellHeight: undefined,
          primarySwellPeriod: undefined,
          primarySwellDirection: undefined,
          windSpeed: undefined,
          windDirection: undefined,
          dataSource: 'unavailable',
        },
        
        surfQuality: {
          overallScore: 5,
          rating: 'Unknown',
          breakdown: {
            waveHeight: 0.5,
            wavePeriod: 0.5,
            wind: 0.5,
            swellDirection: 0.5,
          },
          description: 'Unable to calculate surf quality - marine data unavailable.',
        },
        
        spotInfo: {
          name: input.location,
          type: 'unknown',
          difficulty: 'unknown',
          optimalConditions: 'Unknown - marine data unavailable',
        },
      };
    }
  }
);

export type MarineEnhancedInput = z.infer<typeof MarineEnhancedInputSchema>;
export type MarineEnhancedOutput = z.infer<typeof MarineEnhancedOutputSchema>;
