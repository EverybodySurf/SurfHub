'use server';

/**
 * @fileOverview An AI agent that provides swell forecasts and cites sources.
 *
 * - swellForecastCiteSources - A function that handles the swell forecasting process with citations.
 * - SwellForecastCiteSourcesInput - The input type for the swellForecastCiteSources function.
 * - SwellForecastCiteSourcesOutput - The return type for the swellForecastCiteSources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SwellForecastCiteSourcesInputSchema = z.object({
  spotName: z.string().describe('The name of the surf spot.'),
  date: z.string().describe('The date for the swell forecast (YYYY-MM-DD).'),
  swellHeight: z.string().describe('Swell height in feet.'),
  wavePeriod: z.string().describe('Wave period in seconds.'),
  windSpeed: z.string().describe('Wind speed in mph.'),
  windDirection: z.string().describe('Wind direction (e.g., N, SW).'),
  tideInfo: z.string().describe('Tide information (e.g., high tide at 2:00 PM).'),
});
export type SwellForecastCiteSourcesInput = z.infer<typeof SwellForecastCiteSourcesInputSchema>;

const SwellForecastCiteSourcesOutputSchema = z.object({
  forecast: z.string().describe('The swell forecast for the specified surf spot and date.'),
  sources: z.array(z.string()).describe('A list of cited sources (blogs, forecasts, etc.).'),
});
export type SwellForecastCiteSourcesOutput = z.infer<typeof SwellForecastCiteSourcesOutputSchema>;

export async function swellForecastCiteSources(
  input: SwellForecastCiteSourcesInput
): Promise<SwellForecastCiteSourcesOutput> {
  return swellForecastCiteSourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'swellForecastCiteSourcesPrompt',
  input: {schema: SwellForecastCiteSourcesInputSchema},
  output: {schema: SwellForecastCiteSourcesOutputSchema},
  prompt: `You are a surf forecasting expert. Provide a swell forecast for {{spotName}} on {{date}} based on the following conditions:

Swell Height: {{swellHeight}}
Wave Period: {{wavePeriod}}
Wind Speed: {{windSpeed}}
Wind Direction: {{windDirection}}
Tide Info: {{tideInfo}}

Cite any expert blogs, forecasts, or historical performance data used to create your recommendation. Return sources as a list.

Format your response as a JSON object with "forecast" and "sources" fields.`,
});

const swellForecastCiteSourcesFlow = ai.defineFlow(
  {
    name: 'swellForecastCiteSourcesFlow',
    inputSchema: SwellForecastCiteSourcesInputSchema,
    outputSchema: SwellForecastCiteSourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
