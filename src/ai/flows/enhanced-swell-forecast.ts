// Enhanced AI Flow with Surf Quality Algorithms
import { z } from 'zod';
import { ai } from '../genkit';
import { SurfQualityCalculator, SURF_SPOTS, type SurfConditions, type SpotConfiguration } from '../../lib/surf-quality-calculator';

// Enhanced input schema with estimated wave data
const EnhancedSwellForecastInputSchema = z.object({
  location: z.string().describe('Location for the swell forecast'),
  // Weather data (from OpenWeatherMap)
  temperature: z.number().describe('Current temperature in Celsius'),
  humidity: z.number().describe('Humidity percentage'),
  windSpeed: z.number().describe('Wind speed in m/s'),
  windDirection: z.number().describe('Wind direction in degrees'),
  pressure: z.number().describe('Atmospheric pressure in hPa'),
  visibility: z.number().describe('Visibility in meters'),
  cloudiness: z.number().describe('Cloudiness percentage'),
  weatherDescription: z.string().describe('Weather description'),
});

// Enhanced output schema with surf quality analysis
const EnhancedSwellForecastOutputSchema = z.object({
  location: z.string(),
  conditions: z.string().describe('Overall surf conditions assessment'),
  recommendation: z.string().describe('Friendly recommendation for surfers'),
  windConditions: z.string().describe('Wind conditions for surfing'),
  weatherSummary: z.string().describe('General weather summary'),
  surfabilityScore: z.number().min(1).max(10).describe('Surfability score from 1-10'),
  
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
  
  estimatedWaveConditions: z.object({
    waveHeight: z.number().describe('Estimated wave height in meters'),
    wavePeriod: z.number().describe('Estimated wave period in seconds'),
    swellDirection: z.number().describe('Estimated swell direction in degrees'),
  }).describe('Estimated wave conditions based on weather data'),
});

// Function to estimate wave conditions from weather data
function estimateWaveConditions(weatherData: any, location: string): SurfConditions {
  // This is a simplified estimation - in reality you'd want marine data APIs
  
  // Estimate wave height based on wind speed and pressure
  let estimatedWaveHeight = Math.max(0.3, weatherData.windSpeed * 0.2);
  if (weatherData.pressure < 1010) estimatedWaveHeight *= 1.2; // low pressure = bigger waves
  
  // Estimate wave period based on wind conditions
  let estimatedPeriod = 6; // base period
  if (weatherData.windSpeed > 10) estimatedPeriod += 2; // stronger wind = longer period
  if (weatherData.pressure < 1005) estimatedPeriod += 3; // storm systems = longer period
  
  // Estimate swell direction (simplified - usually comes from weather systems)
  // In reality, you'd track storm positions and calculate great circle routes
  let estimatedSwellDirection = (weatherData.windDirection + 180) % 360; // opposite to wind
  
  return {
    waveHeight: estimatedWaveHeight,
    wavePeriod: estimatedPeriod,
    swellDirection: estimatedSwellDirection,
    windSpeed: weatherData.windSpeed,
    windDirection: weatherData.windDirection,
    location: location,
  };
}

// Function to find or create spot configuration
function getSpotConfiguration(location: string): SpotConfiguration {
  // Try to find a matching spot
  const locationLower = location.toLowerCase();
  
  for (const [spotKey, spotConfig] of Object.entries(SURF_SPOTS)) {
    if (locationLower.includes(spotKey) || spotConfig.name.toLowerCase().includes(locationLower)) {
      return spotConfig;
    }
  }
  
  // Default configuration for unknown spots
  return {
    name: location,
    type: 'beach_break',
    aspect: 180, // south-facing default
    optimalWaveHeight: [1.0, 2.5],
    optimalSwellDirection: [135, 225], // south swells
    difficulty: 'intermediate'
  };
}

export const enhancedSwellForecastFlow = ai.defineFlow(
  {
    name: 'enhancedSwellForecast',
    inputSchema: EnhancedSwellForecastInputSchema,
    outputSchema: EnhancedSwellForecastOutputSchema,
  },
  async (input) => {
    try {
      // Estimate wave conditions from weather data
      const estimatedConditions = estimateWaveConditions(input, input.location);
      
      // Get spot configuration
      const spotConfig = getSpotConfiguration(input.location);
      
      // Calculate surf quality
      const surfQuality = SurfQualityCalculator.calculateOverallScore(
        estimatedConditions,
        spotConfig
      );
      
      // Generate AI analysis with surf quality context
      const prompt = `
        Analyze the surf conditions for ${input.location} with the following data:
        
        Weather Conditions:
        - Temperature: ${input.temperature}°C
        - Wind: ${input.windSpeed} m/s from ${input.windDirection}°
        - Weather: ${input.weatherDescription}
        - Pressure: ${input.pressure} hPa
        
        Estimated Surf Conditions:
        - Wave Height: ${estimatedConditions.waveHeight.toFixed(1)}m
        - Wave Period: ${estimatedConditions.wavePeriod}s
        - Swell Direction: ${estimatedConditions.swellDirection}°
        
        Surf Quality Analysis:
        - Overall Score: ${surfQuality.overallScore}/10 (${surfQuality.rating})
        - Wind Score: ${(surfQuality.breakdown.wind * 10).toFixed(1)}/10
        - Wave Height Score: ${(surfQuality.breakdown.waveHeight * 10).toFixed(1)}/10
        - Wave Period Score: ${(surfQuality.breakdown.wavePeriod * 10).toFixed(1)}/10
        
        Spot Type: ${spotConfig.type}
        
        Provide a comprehensive surf forecast including specific advice for surfers.
      `;

      const aiResponse = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-1.5-flash',
      });

      return {
        location: input.location,
        conditions: aiResponse.text,
        recommendation: surfQuality.description,
        windConditions: `Wind: ${input.windSpeed} m/s from ${input.windDirection}° (Score: ${(surfQuality.breakdown.wind * 10).toFixed(1)}/10)`,
        weatherSummary: `${input.weatherDescription}, ${input.temperature}°C, ${input.humidity}% humidity`,
        surfabilityScore: surfQuality.overallScore,
        surfQuality: {
          overallScore: surfQuality.overallScore,
          rating: surfQuality.rating,
          breakdown: {
            waveHeight: surfQuality.breakdown.waveHeight || 0,
            wavePeriod: surfQuality.breakdown.wavePeriod || 0,
            wind: surfQuality.breakdown.wind || 0,
            swellDirection: surfQuality.breakdown.swellDirection || 0,
          },
          description: surfQuality.description,
        },
        estimatedWaveConditions: {
          waveHeight: estimatedConditions.waveHeight,
          wavePeriod: estimatedConditions.wavePeriod,
          swellDirection: estimatedConditions.swellDirection,
        },
      };
    } catch (error) {
      console.error('Enhanced swell forecast error:', error);
      
      // Fallback to basic analysis
      return {
        location: input.location,
        conditions: `Weather-based surf assessment for ${input.location}`,
        recommendation: `Current weather: ${input.weatherDescription} with ${input.temperature}°C temperature. Wind conditions may affect surf quality.`,
        windConditions: `Wind conditions: ${input.windSpeed} m/s from ${input.windDirection}°`,
        weatherSummary: `${input.weatherDescription}, ${input.temperature}°C, ${input.humidity}% humidity`,
        surfabilityScore: 5,
        surfQuality: {
          overallScore: 5,
          rating: 'Unknown',
          breakdown: {
            waveHeight: 0.5,
            wavePeriod: 0.5,
            wind: 0.5,
            swellDirection: 0.5,
          },
          description: 'Unable to calculate detailed surf quality - using weather data only.',
        },
        estimatedWaveConditions: {
          waveHeight: 1.0,
          wavePeriod: 8,
          swellDirection: 180,
        },
      };
    }
  }
);

export type EnhancedSwellForecastInput = z.infer<typeof EnhancedSwellForecastInputSchema>;
export type EnhancedSwellForecastOutput = z.infer<typeof EnhancedSwellForecastOutputSchema>;
