import { NextRequest, NextResponse } from 'next/server';
import { getSwellForecast, type SwellForecastInput } from '@/ai/flows/swell-forecast';

export async function POST(request: NextRequest) {
  try {
    const input: SwellForecastInput = await request.json();
    
    // Validate input
    if (!input.surfSpot || input.surfSpot.length < 2) {
      return NextResponse.json(
        { error: 'Surf spot must be at least 2 characters.' },
        { status: 400 }
      );
    }

    console.log('API Route: Processing swell forecast request for:', input.surfSpot);
    
    const result = await getSwellForecast(input);
    
    console.log('API Route: Swell forecast generated successfully');
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API Route: Error fetching swell forecast:', error);
    
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
