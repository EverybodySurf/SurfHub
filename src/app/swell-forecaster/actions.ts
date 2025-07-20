'use client';

import { type SmartForecastInput, type SmartForecastOutput } from '@/ai/flows/smart-swell-forecast'; 
export type { SmartForecastInput as SwellForecastInput, SmartForecastOutput as SwellForecastOutput };

interface ActionResult {
  data?: SmartForecastOutput;
  error?: string;
}

export async function fetchSwellForecastAction(input: SmartForecastInput): Promise<ActionResult> {
  try {
    const response = await fetch('/api/swell-forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to fetch forecast' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching swell forecast:', error);
    return { error: 'An unexpected error occurred while fetching the forecast.' };
  }
}
