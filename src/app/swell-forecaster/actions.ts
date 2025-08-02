'use client';

import { type SmartForecastInput, type SmartForecastOutput } from '@/ai/flows/smart-swell-forecast'; 
export type { SmartForecastInput as SwellForecastInput, SmartForecastOutput as SwellForecastOutput };

interface ActionResult {
  data?: SmartForecastOutput;
  error?: string;
}

export async function fetchSwellForecastAction(input: SmartForecastInput): Promise<ActionResult> {
  try {
    console.log('Action: Making request to /api/swell-forecast with input:', input);
    
    const response = await fetch('/api/swell-forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    console.log('Action: Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Action: Error response data:', errorData);
      return { error: errorData.error || 'Failed to fetch forecast' };
    }

    const result = await response.json();
    console.log('Action: Success response data:', result);
    return result;
  } catch (error) {
    console.error('Action: Exception during fetch:', error);
    return { error: 'An unexpected error occurred while fetching the forecast.' };
  }
}
