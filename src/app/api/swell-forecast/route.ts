import { NextRequest, NextResponse } from 'next/server';
import { smartSwellForecastFlow, type SmartForecastInput } from '@/ai/flows/smart-swell-forecast';

export async function POST(request: NextRequest) {
  try {
    const input: SmartForecastInput = await request.json();
    
    // Validate input - location is required
    if (!input.location || input.location.length < 2) {
      return NextResponse.json(
        { error: 'Location must be at least 2 characters.' },
        { status: 400 }
      );
    }

    console.log('API Route: Processing smart swell forecast request for:', input.location);
    console.log('API Route: Preferred forecast type:', input.preferredForecastType || 'auto');
    
    const result = await smartSwellForecastFlow(input);
    
    console.log(`API Route: Smart forecast generated using ${result.forecastType} forecaster`);
    console.log(`API Route: Data quality: ${result.dataQuality}`);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API Route: Error fetching smart swell forecast:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to get forecast: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the forecast.' },
      { status: 500 }
    );
  }
}
