import { z } from 'zod';
import { ai } from '../genkit';

// Input schema - only request data we can actually get from OpenWeatherMap free tier
const SwellForecastInputSchema = z.object({
  location: z.string().describe('Location for the swell forecast'),
  // Only include basic weather data we can actually get
  temperature: z.number().describe('Current temperature in Celsius'),
  humidity: z.number().describe('Humidity percentage'),
  windSpeed: z.number().describe('Wind speed in m/s'),
  windDirection: z.number().describe('Wind direction in degrees'),
  pressure: z.number().describe('Atmospheric pressure in hPa'),
  visibility: z.number().describe('Visibility in meters'),
  cloudiness: z.number().describe('Cloudiness percentage'),
  weatherDescription: z.string().describe('Weather description'),
  
  // These are commented out because they're not available in free OpenWeatherMap API
  // uvIndex: z.number().describe('UV index'),
  // tideHeight: z.number().describe('Current tide height in meters'),
  // waveHeight: z.number().describe('Wave height in meters'),
  // wavePeriod: z.number().describe('Wave period in seconds'),
  // waveDirection: z.number().describe('Wave direction in degrees'),
  // swellHeight: z.number().describe('Swell height in meters'),
  // swellPeriod: z.number().describe('Swell period in seconds'),
  // swellDirection: z.number().describe('Swell direction in degrees'),
  // waterTemperature: z.number().describe('Water temperature in Celsius'),
  // sunrise: z.string().describe('Sunrise time'),
  // sunset: z.string().describe('Sunset time'),
});

// Output schema - simplified to match available data
const SwellForecastOutputSchema = z.object({
  location: z.string(),
  conditions: z.string().describe('Overall surf conditions assessment'),
  recommendation: z.string().describe('Friendly recommendation for surfers'),
  windConditions: z.string().describe('Wind conditions for surfing'),
  weatherSummary: z.string().describe('General weather summary'),
  surfabilityScore: z.number().min(1).max(10).describe('Surfability score from 1-10'),
  
  // Commented out fields that require marine data we don't have
  // waveAnalysis: z.string().describe('Wave height and period analysis'),
  // swellAnalysis: z.string().describe('Swell direction and period analysis'),
  // tideInfo: z.string().describe('Tide information and timing'),
  // uvWarning: z.string().describe('UV exposure warning'),
  // waterConditions: z.string().describe('Water temperature and conditions'),
});

export const swellForecastFlow = ai.defineFlow(
  {
    name: 'swellForecast',
    inputSchema: SwellForecastInputSchema,
    outputSchema: SwellForecastOutputSchema,
  },
  async (input: z.infer<typeof SwellForecastInputSchema>) => {
    const prompt = `
You are a friendly surf forecaster providing surf conditions for ${input.location}.

Based on the available weather data, provide a helpful and encouraging surf forecast:

Current Conditions:
- Temperature: ${input.temperature}°C
- Weather: ${input.weatherDescription}
- Wind: ${input.windSpeed} m/s from ${input.windDirection}°
- Humidity: ${input.humidity}%
- Pressure: ${input.pressure} hPa
- Visibility: ${input.visibility}m
- Cloud cover: ${input.cloudiness}%

Please provide:
1. A friendly overall assessment of surf conditions
2. Wind conditions and how they affect surfing
3. A general weather summary for the session
4. An encouraging recommendation for surfers
5. A surfability score (1-10) based on available conditions

Keep the tone positive and helpful. If conditions aren't ideal, suggest alternatives or what to look for. Remember that we don't have specific wave or marine data, so focus on the weather conditions that affect surfing.

Format your response as a JSON object matching the required schema.
`;

    const result = await ai.generate({
      prompt,
      output: {
        schema: SwellForecastOutputSchema,
      },
    });
    
    // Parse the result and ensure it matches our schema
    try {
      return result.output || {
        location: input.location,
        conditions: 'Surf conditions based on current weather',
        recommendation: 'Check local surf reports for wave conditions',
        windConditions: `Wind: ${input.windSpeed} m/s from ${input.windDirection}°`,
        weatherSummary: `${input.weatherDescription}, ${input.temperature}°C`,
        surfabilityScore: 5,
      };
    } catch (error) {
      // Fallback response if parsing fails
      return {
        location: input.location,
        conditions: `Weather-based surf assessment for ${input.location}`,
        recommendation: `Current weather: ${input.weatherDescription} with ${input.temperature}°C temperature. Check local surf reports for wave conditions.`,
        windConditions: `Wind conditions: ${input.windSpeed} m/s from ${input.windDirection}°`,
        weatherSummary: `${input.weatherDescription}, ${input.temperature}°C, ${input.humidity}% humidity`,
        surfabilityScore: 5,
      };
    }
  }
);

export type SwellForecastInput = z.infer<typeof SwellForecastInputSchema>;
export type SwellForecastOutput = z.infer<typeof SwellForecastOutputSchema>;
