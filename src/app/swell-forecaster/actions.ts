'use server';

import { getSwellForecast, type SwellForecastInput, type SwellForecastOutput } from '@/ai/flows/swell-forecast'; 
export type { SwellForecastInput, SwellForecastOutput };

interface ActionResult {
  data?: SwellForecastOutput;
  error?: string;
}

export async function fetchSwellForecastAction(input: SwellForecastInput): Promise<ActionResult> {
  try {
    const result = await getSwellForecast(input);
    return { data: result };
  } catch (error) {
    console.error('Error fetching swell forecast:', error);
    // It's better to return a generic error message to the client
    // and log the specific error on the server.
    if (error instanceof Error) {
        return { error: `Failed to get forecast: ${error.message}` };
    }
    return { error: 'An unexpected error occurred while fetching the forecast.' };
  }
}
