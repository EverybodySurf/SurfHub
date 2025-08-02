# Swell Forecast System Documentation

## Overview

The Swell Forecast System is an AI-powered surf condition analyzer that provides real-time weather-based surf recommendations. It uses OpenWeatherMap API for weather data and Google's Gemini AI for intelligent surf condition analysis.

## System Architecture

```
Frontend (React/Next.js)
├── Swell Forecaster Page
├── Swell Forecast Client Component
└── Actions (API Communication)
        ↓
Backend API Routes
├── /api/swell-forecast
        ↓
AI Flow System
├── swell-forecast.ts (Genkit AI Flow)
        ↓
External APIs
├── OpenWeatherMap API (Weather Data)
└── Google Gemini AI (Forecast Generation)
```

## Core Components

### 1. Swell Forecaster Page
**File**: `/src/app/swell-forecaster/page.tsx`

**Purpose**: Main page that displays the swell forecaster interface

**Features**:
- SEO metadata configuration
- Page layout with header and description
- Renders the `SwellForecastClient` component

**Dependencies**:
- `SwellForecastClient` component
- Lucide React icons
- Next.js Metadata API

---

### 2. Swell Forecast Client Component
**File**: `/src/components/swell-forecaster/SwellForecastClient.tsx`

**Purpose**: Main interactive component for getting surf forecasts

**Features**:
- Location input form with validation
- Real-time weather data fetching
- AI forecast display with structured results
- Error handling and loading states
- Responsive design with shadcn/ui components

**Form Schema**:
```typescript
{
  location: string (min 2 characters)
}
```

**State Management**:
- `isLoading`: Boolean for loading state
- `forecast`: SwellForecastOutput object or null
- `error`: Error message string or null

**User Flow**:
1. User enters location (e.g., "Malibu, CA")
2. Component fetches weather data from OpenWeatherMap
3. Weather data is sent to AI forecast system
4. Results displayed in organized card format

**Dependencies**:
- React Hook Form with Zod validation
- shadcn/ui components (Card, Input, Button, Alert, Badge)
- Lucide React icons
- Custom actions for API communication

---

### 3. Actions (API Communication)
**File**: `/src/app/swell-forecaster/actions.ts`

**Purpose**: Client-side API communication layer

**Features**:
- Type-safe API calls to `/api/swell-forecast`
- Error handling and response formatting
- TypeScript type exports for components

**Types Exported**:
- `SwellForecastInput`: Input schema for AI flow
- `SwellForecastOutput`: Output schema from AI flow
- `ActionResult`: API response wrapper

**Function**:
```typescript
fetchSwellForecastAction(input: SwellForecastInput): Promise<ActionResult>
```

---

### 4. API Route Handler
**File**: `/src/app/api/swell-forecast/route.ts`

**Purpose**: Server-side API endpoint for processing forecast requests

**Features**:
- POST request handling
- Input validation
- Calls the AI flow system
- Error handling and response formatting

**Request Flow**:
1. Validates input location
2. Calls `swellForecastFlow` with weather data
3. Returns structured JSON response

**Error Handling**:
- Input validation errors (400)
- AI flow errors (500)
- Generic error fallback

---

### 5. AI Flow System
**File**: `/src/ai/flows/swell-forecast.ts`

**Purpose**: Core AI logic for generating surf forecasts

**Features**:
- Genkit AI integration with Google Gemini
- Structured input/output schemas
- Weather-based surf condition analysis
- Fallback responses for AI failures

**Input Schema** (Available Weather Data):
```typescript
{
  location: string
  temperature: number        // °C
  humidity: number          // %
  windSpeed: number         // m/s
  windDirection: number     // degrees
  pressure: number          // hPa
  visibility: number        // meters
  cloudiness: number        // %
  weatherDescription: string
}
```

**Output Schema**:
```typescript
{
  location: string
  conditions: string           // Overall assessment
  recommendation: string       // Surf recommendation
  windConditions: string      // Wind analysis
  weatherSummary: string      // Weather overview
  surfabilityScore: number    // 1-10 rating
}
```

**AI Prompt Strategy**:
- Friendly, encouraging tone
- Focus on available weather data
- Provide actionable recommendations
- Acknowledge limitations (no wave data)

---

## Environment Variables Required

### Frontend (.env.local)
```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
```

### Backend
```env
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

## API Dependencies

### OpenWeatherMap API
- **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **Purpose**: Real-time weather data
- **Plan**: Free tier (1000 calls/day)
- **Data Used**: Temperature, humidity, wind, pressure, visibility, clouds, weather description

### Google Gemini AI
- **Model**: `googleai/gemini-2.0-flash`
- **Purpose**: Intelligent surf condition analysis
- **Integration**: Through Genkit AI framework

## Data Flow

1. **User Input**: Location entered in form
2. **Weather Fetch**: OpenWeatherMap API called with location
3. **Data Transform**: Weather data mapped to AI flow input schema
4. **AI Processing**: Gemini AI generates surf forecast
5. **Response Display**: Structured forecast shown to user

## Commented Out Features

The system previously supported advanced marine data that's not available in the free OpenWeatherMap tier:

```typescript
// Unavailable with current API:
// uvIndex, tideHeight, waveHeight, wavePeriod, waveDirection
// swellHeight, swellPeriod, swellDirection, waterTemperature
// sunrise, sunset
```

These can be uncommented and implemented when upgrading to marine data APIs.

## Error Handling

### Client-Side
- Form validation errors
- Network request failures
- API response errors
- Loading states

### Server-Side
- Input validation (400 errors)
- AI flow failures (500 errors)
- Weather API failures
- Generic error fallback

## UI Components Used

### shadcn/ui Components
- `Card`: Main container components
- `Input`: Location input field
- `Button`: Submit and loading states
- `Alert`: Error message display
- `Badge`: Surfability score display
- `Label`: Form field labels

### Lucide Icons
- `MapPin`: Location indicator
- `MessageSquareText`: Forecast display
- `Wind`: Wind conditions
- `Cloud`: Weather summary
- `AlertTriangle`: Error states
- `Loader2`: Loading animation

## Development Notes

### Testing the System
1. Ensure environment variables are set
2. Test with various locations
3. Verify error handling with invalid locations
4. Check AI response quality

### Extending the System
1. **Marine Data**: Add wave/tide APIs when available
2. **Historical Data**: Implement forecast history
3. **Favorites**: Add location bookmarking
4. **Maps**: Integrate map-based location selection

### Performance Considerations
- Weather API calls are rate-limited
- AI generation can take 2-5 seconds
- Consider caching weather data for recent requests
- Implement request debouncing for location input

## File Structure Summary

```
src/
├── app/
│   ├── api/swell-forecast/
│   │   └── route.ts                 # API endpoint
│   └── swell-forecaster/
│       ├── actions.ts               # Client API communication
│       └── page.tsx                 # Main page
├── components/
│   └── swell-forecaster/
│       └── SwellForecastClient.tsx  # Main component
└── ai/
    └── flows/
        └── swell-forecast.ts        # AI flow logic
```

## Deployment Requirements

1. **Environment Variables**: Set in deployment platform
2. **API Keys**: Secure storage of OpenWeatherMap and Google AI keys
3. **Build Process**: Standard Next.js build process
4. **Dependencies**: All npm packages properly installed

This documentation provides a complete overview of the swell forecast system, making it easy for any developer to understand, maintain, and extend the functionality.
