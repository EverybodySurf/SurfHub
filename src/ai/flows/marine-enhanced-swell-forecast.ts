// Marine Data Enhanced Swell Forecast
import { z } from 'zod';
import { ai } from '../genkit';
import { SurfQualityCalculator, SURF_SPOTS, type SurfConditions, type SpotConfiguration } from '../../lib/surf-quality-calculator';
import GlobalMarineDataService, { type MarineConditions } from '../../lib/global-marine-data';

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
    waveHeight: z.number().describe('Significant wave height in meters'),
    primarySwellHeight: z.number().describe('Primary swell height in meters'),
    primarySwellPeriod: z.number().describe('Primary swell period in seconds'),
    primarySwellDirection: z.number().describe('Primary swell direction in degrees'),
    windSpeed: z.number().describe('Wind speed in m/s'),
    windDirection: z.number().describe('Wind direction in degrees'),
    dataSource: z.string().describe('Source of marine data'),
  }).describe('Real marine conditions'),
  
  // Enhanced surf analysis
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
    waveHeight: marine.waves.significantHeight,
    wavePeriod: marine.waves.primarySwellPeriod,
    swellDirection: marine.waves.primarySwellDirection,
    windSpeed: marine.wind.speed,
    windDirection: marine.wind.direction,
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
      
      if (!openWeatherApiKey) {
        throw new Error('OpenWeather API key not configured');
      }
      
      const marineService = new GlobalMarineDataService(
        openWeatherApiKey,
        stormglassApiKey,
        worldWeatherApiKey
      );
      
      // Get location coordinates
      const coordinates = await marineService.getLocationCoordinates(input.location);
      
      // Get marine conditions
      const marineConditions = await marineService.getMarineConditions(
        coordinates.lat,
        coordinates.lon,
        input.location
      );
      
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
      const prompt = `
        Analyze the surf conditions for ${input.location} using real marine data:
        
        MARINE CONDITIONS (from ${marineConditions.dataSource.toUpperCase()}):
        - Significant Wave Height: ${marineConditions.waves.significantHeight.toFixed(1)}m
        - Primary Swell: ${marineConditions.waves.primarySwellHeight.toFixed(1)}m @ ${marineConditions.waves.primarySwellPeriod}s from ${marineConditions.waves.primarySwellDirection}°
        - Wind Waves: ${marineConditions.waves.windWaveHeight.toFixed(1)}m @ ${marineConditions.waves.windWavePeriod}s
        - Wind: ${marineConditions.wind.speed.toFixed(1)} m/s from ${marineConditions.wind.direction}°
        - Weather: ${marineConditions.weather.description}, ${marineConditions.weather.temperature}°C
        
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

      const aiResponse = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-1.5-flash',
      });

      return {
        location: input.location,
        conditions: aiResponse.text,
        recommendation: surfQuality.description,
        windConditions: `${marineConditions.wind.speed.toFixed(1)} m/s from ${marineConditions.wind.direction}° (${surfQuality.breakdown.wind > 0.7 ? 'Favorable' : surfQuality.breakdown.wind > 0.4 ? 'Marginal' : 'Poor'})`,
        weatherSummary: `${marineConditions.weather.description}, ${marineConditions.weather.temperature}°C`,
        surfabilityScore: surfQuality.overallScore,
        
        marineData: {
          waveHeight: marineConditions.waves.significantHeight,
          primarySwellHeight: marineConditions.waves.primarySwellHeight,
          primarySwellPeriod: marineConditions.waves.primarySwellPeriod,
          primarySwellDirection: marineConditions.waves.primarySwellDirection,
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
          waveHeight: 1.0,
          primarySwellHeight: 0.8,
          primarySwellPeriod: 8,
          primarySwellDirection: 180,
          windSpeed: 5,
          windDirection: 270,
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
