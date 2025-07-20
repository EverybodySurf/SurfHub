// Smart Swell Forecast Router - Chooses best available forecaster
import { z } from 'zod';
import { ai } from '../genkit';

// Import all forecasters
import { swellForecastFlow, type SwellForecastInput, type SwellForecastOutput } from './swell-forecast';
import { enhancedSwellForecastFlow, type EnhancedSwellForecastInput, type EnhancedSwellForecastOutput } from './enhanced-swell-forecast';
import { marineEnhancedSwellForecastFlow, type MarineEnhancedInput, type MarineEnhancedOutput } from './marine-enhanced-swell-forecast';

// Unified input schema (supports all forecasters)
const SmartForecastInputSchema = z.object({
  location: z.string().describe('Location for the swell forecast'),
  // Optional weather data (for compatibility with original)
  temperature: z.number().optional().describe('Current temperature in Celsius'),
  humidity: z.number().optional().describe('Humidity percentage'),
  windSpeed: z.number().optional().describe('Wind speed in m/s'),
  windDirection: z.number().optional().describe('Wind direction in degrees'),
  pressure: z.number().optional().describe('Atmospheric pressure in hPa'),
  visibility: z.number().optional().describe('Visibility in meters'),
  cloudiness: z.number().optional().describe('Cloudiness percentage'),
  weatherDescription: z.string().optional().describe('Weather description'),
  // Preference for forecaster type
  preferredForecastType: z.enum(['auto', 'basic', 'enhanced', 'marine']).optional().default('auto'),
});

// Unified output schema (superset of all forecasters)
const SmartForecastOutputSchema = z.object({
  location: z.string(),
  conditions: z.string().describe('Overall surf conditions assessment'),
  recommendation: z.string().describe('Friendly recommendation for surfers'),
  windConditions: z.string().describe('Wind conditions for surfing'),
  weatherSummary: z.string().describe('General weather summary'),
  surfabilityScore: z.number().min(1).max(10).describe('Surfability score from 1-10'),
  
  // Enhanced fields (optional)
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
  }).optional().describe('Detailed surf quality analysis'),
  
  // Marine fields (optional)
  marineData: z.object({
    waveHeight: z.number().describe('Significant wave height in meters'),
    primarySwellHeight: z.number().describe('Primary swell height in meters'),
    primarySwellPeriod: z.number().describe('Primary swell period in seconds'),
    primarySwellDirection: z.number().describe('Primary swell direction in degrees'),
    windSpeed: z.number().describe('Wind speed in m/s'),
    windDirection: z.number().describe('Wind direction in degrees'),
    dataSource: z.string().describe('Source of marine data'),
  }).optional().describe('Real marine conditions'),
  
  // Spot information (optional)
  spotInfo: z.object({
    name: z.string(),
    type: z.string(),
    difficulty: z.string(),
    optimalConditions: z.string(),
  }).optional().describe('Information about the surf spot'),
  
  // Metadata
  forecastType: z.string().describe('Which forecaster was used'),
  dataQuality: z.string().describe('Quality level of the forecast data'),
  apiCostsUsed: z.boolean().describe('Whether paid APIs were used'),
});

export class SmartSwellForecaster {
  
  /**
   * Determine the best forecaster to use based on available APIs and user preference
   */
  static determineBestForecaster(preference: string = 'auto'): {
    type: 'marine' | 'enhanced' | 'basic';
    reason: string;
    quality: string;
  } {
    
    // Check available API keys
    const hasOpenWeather = !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const hasStormglass = !!process.env.STORMGLASS_API_KEY;
    const hasWorldWeather = !!process.env.WORLD_WEATHER_API_KEY;
    const hasMarineAPIs = hasStormglass || hasWorldWeather;
    
    // Handle explicit preferences
    if (preference === 'marine' && hasOpenWeather) {
      return {
        type: 'marine',
        reason: hasMarineAPIs ? 'User requested marine data with premium APIs available' : 'User requested marine data (will use OpenWeather fallback)',
        quality: hasMarineAPIs ? 'Premium' : 'Standard'
      };
    }
    
    if (preference === 'enhanced' && hasOpenWeather) {
      return {
        type: 'enhanced',
        reason: 'User requested enhanced forecasting with surf algorithms',
        quality: 'Good'
      };
    }
    
    if (preference === 'basic' && hasOpenWeather) {
      return {
        type: 'basic',
        reason: 'User requested basic weather-based forecasting',
        quality: 'Basic'
      };
    }
    
    // Auto-selection logic
    if (preference === 'auto' || preference === undefined) {
      if (hasOpenWeather && hasMarineAPIs) {
        return {
          type: 'marine',
          reason: 'Marine APIs available - using highest quality forecasting',
          quality: 'Premium'
        };
      }
      
      if (hasOpenWeather) {
        return {
          type: 'enhanced',
          reason: 'OpenWeather available - using enhanced algorithms',
          quality: 'Good'
        };
      }
    }
    
    // Fallback
    return {
      type: 'basic',
      reason: 'Limited API access - using basic forecasting',
      quality: 'Basic'
    };
  }
  
  /**
   * Convert between different input formats
   */
  static prepareInputForForecaster(
    input: SmartForecastInput, 
    forecasterType: 'marine' | 'enhanced' | 'basic'
  ): any {
    
    switch (forecasterType) {
      case 'marine':
        return { location: input.location };
        
      case 'enhanced':
        return {
          location: input.location,
          temperature: input.temperature || 20,
          humidity: input.humidity || 70,
          windSpeed: input.windSpeed || 5,
          windDirection: input.windDirection || 270,
          pressure: input.pressure || 1013,
          visibility: input.visibility || 10000,
          cloudiness: input.cloudiness || 50,
          weatherDescription: input.weatherDescription || 'Clear conditions',
        };
        
      case 'basic':
        return {
          location: input.location,
          temperature: input.temperature || 20,
          humidity: input.humidity || 70,
          windSpeed: input.windSpeed || 5,
          windDirection: input.windDirection || 270,
          pressure: input.pressure || 1013,
          visibility: input.visibility || 10000,
          cloudiness: input.cloudiness || 50,
          weatherDescription: input.weatherDescription || 'Clear conditions',
        };
        
      default:
        return input;
    }
  }
}

export const smartSwellForecastFlow = ai.defineFlow(
  {
    name: 'smartSwellForecast',
    inputSchema: SmartForecastInputSchema,
    outputSchema: SmartForecastOutputSchema,
  },
  async (input) => {
    try {
      // Determine best forecaster
      const forecasterInfo = SmartSwellForecaster.determineBestForecaster(input.preferredForecastType);
      
      console.log(`Using ${forecasterInfo.type} forecaster: ${forecasterInfo.reason}`);
      
      // Prepare input for chosen forecaster
      const forecasterInput = SmartSwellForecaster.prepareInputForForecaster(input, forecasterInfo.type);
      
      let result: any;
      
      // Call appropriate forecaster
      switch (forecasterInfo.type) {
        case 'marine':
          result = await marineEnhancedSwellForecastFlow(forecasterInput);
          break;
          
        case 'enhanced':
          result = await enhancedSwellForecastFlow(forecasterInput);
          // Convert enhanced format to unified format
          result = {
            ...result,
            marineData: {
              waveHeight: result.estimatedWaveConditions.waveHeight,
              primarySwellHeight: result.estimatedWaveConditions.waveHeight * 0.8,
              primarySwellPeriod: result.estimatedWaveConditions.wavePeriod,
              primarySwellDirection: result.estimatedWaveConditions.swellDirection,
              windSpeed: 5, // Default
              windDirection: 270, // Default
              dataSource: 'estimated',
            }
          };
          break;
          
        case 'basic':
        default:
          result = await swellForecastFlow(forecasterInput);
          // Convert basic format to unified format
          result = {
            ...result,
            surfQuality: {
              overallScore: result.surfabilityScore,
              rating: result.surfabilityScore >= 8 ? 'Excellent' : 
                     result.surfabilityScore >= 6 ? 'Good' : 
                     result.surfabilityScore >= 4 ? 'Fair' : 'Poor',
              breakdown: {
                waveHeight: 0.5,
                wavePeriod: 0.5,
                wind: 0.5,
                swellDirection: 0.5,
              },
              description: result.recommendation,
            }
          };
          break;
      }
      
      // Add metadata
      return {
        ...result,
        forecastType: forecasterInfo.type,
        dataQuality: forecasterInfo.quality,
        apiCostsUsed: forecasterInfo.type === 'marine' && (!!process.env.STORMGLASS_API_KEY || !!process.env.WORLD_WEATHER_API_KEY),
      };
      
    } catch (error) {
      console.error('Smart forecast error:', error);
      
      // Ultimate fallback
      return {
        location: input.location,
        conditions: `Unable to generate forecast for ${input.location}. Please try again.`,
        recommendation: 'Forecast unavailable - please check location and try again.',
        windConditions: 'Data unavailable',
        weatherSummary: 'Data unavailable',
        surfabilityScore: 5,
        forecastType: 'fallback',
        dataQuality: 'Unavailable',
        apiCostsUsed: false,
      };
    }
  }
);

export type SmartForecastInput = z.infer<typeof SmartForecastInputSchema>;
export type SmartForecastOutput = z.infer<typeof SmartForecastOutputSchema>;
