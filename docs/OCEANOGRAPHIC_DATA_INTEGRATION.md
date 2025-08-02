# Oceanographic Data Integration

## Overview

SurfHub now provides comprehensive oceanographic data including ocean currents and tides alongside traditional surf forecasting parameters. This professional-grade marine data enhances surf reports with critical oceanographic information that affects wave quality, surfing conditions, and safety.

## Data Sources

### Open-Meteo Marine Weather API (Primary)
- **Ocean Currents**: Real-time surface current velocity and direction
- **Primary Coverage**: Global ocean coverage with 5km resolution
- **Cost**: Free for all locations
- **Data Quality**: Professional-grade marine meteorology

### NOAA Tides & Currents API (Coastal USA)
- **Tide Data**: Real-time tide heights and predictions
- **Coverage**: US coastal waters with official NOAA tide stations
- **Data**: Current height, next high/low tide predictions
- **Cost**: Free government data

## Implementation

### Core Marine Data Service (`global-marine-data.ts`)

#### Ocean Current Data
```typescript
// Extract ocean current from Open-Meteo marine API
const oceanCurrentVelocity = current.variables(13)?.value() || 0;
const oceanCurrentDirection = current.variables(14)?.value() || 0;

return {
  oceanCurrent: {
    velocity: oceanCurrentVelocity, // m/s
    direction: oceanCurrentDirection // degrees
  }
};
```

#### Tide Data Integration
```typescript
// NOAA tide data fetching with station lookup
async function getTideData(latitude: number, longitude: number) {
  // Find nearest NOAA tide station
  const stationsResponse = await fetch(
    `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&units=metric`
  );
  
  // Get current and predicted tide data
  const predictionsResponse = await fetch(
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${nearestStation.id}&product=predictions&begin_date=${today}&end_date=${tomorrow}&datum=MLLW&time_zone=gmt&units=metric&format=json`
  );
  
  return {
    currentHeight: calculateCurrentHeight(predictions),
    nextHighTide: findNextHighTide(predictions),
    nextLowTide: findNextLowTide(predictions)
  };
}
```

### AI Flow Integration

#### Smart Swell Forecast Schema
```typescript
// Extended marine data schema with oceanographic parameters
marineData: z.object({
  // Traditional surf parameters
  waveHeight: z.number(),
  primarySwellHeight: z.number(),
  windSpeed: z.number(),
  
  // New oceanographic data
  currentHeight: z.number().optional(),
  nextHighTide: z.string().optional(), 
  nextLowTide: z.string().optional(),
  oceanCurrentVelocity: z.number().optional(),
  oceanCurrentDirection: z.number().optional(),
}).optional()
```

#### Marine Enhanced Forecast
- Fully integrated oceanographic parameters
- Professional marine weather analysis
- Enhanced surf quality scoring with current/tide factors

### UI Components

#### Ocean Currents & Tides Section (`SwellForecastClient.tsx`)

**Ocean Current Display:**
```tsx
{forecast.marineData.oceanCurrentVelocity && (
  <div className="bg-card border border-border p-3 rounded-lg">
    <h5 className="font-semibold text-primary mb-2 text-sm">Ocean Current</h5>
    <div className="text-lg font-bold">{forecast.marineData.oceanCurrentVelocity.toFixed(2)} m/s</div>
    <div className="text-sm">{forecast.marineData.oceanCurrentDirection}°</div>
    <div className="text-xs">
      {velocity > 0.5 ? '🌊 Strong' : velocity > 0.2 ? '〰️ Moderate' : '🟢 Gentle'}
    </div>
  </div>
)}
```

**Tide Information Display:**
```tsx
{forecast.marineData.nextHighTide && (
  <div className="bg-card border border-border p-3 rounded-lg">
    <h5 className="font-semibold text-green-600 mb-2 text-sm">Next High Tide</h5>
    <div className="text-sm font-bold">
      {new Date(forecast.marineData.nextHighTide).toLocaleTimeString()}
    </div>
    <div className="text-xs">⬆️ Rising Water</div>
  </div>
)}
```

## Data Quality Indicators

### Ocean Current Quality
- **Strong Current**: > 0.5 m/s (significant impact on surfing)
- **Moderate Current**: 0.2-0.5 m/s (noticeable effect)
- **Gentle Current**: < 0.2 m/s (minimal impact)

### Tide Height Interpretation
- **High Tide**: > +0.5m (above mean sea level)
- **Mid Tide**: -0.5m to +0.5m (moderate range)
- **Low Tide**: < -0.5m (below mean sea level)

## Surfing Impact Analysis

### Ocean Currents
- **Rip Currents**: Enhanced detection through velocity analysis
- **Longshore Drift**: Direction indicates side currents along beach
- **Safety Considerations**: Strong currents (>0.5 m/s) require caution

### Tidal Effects
- **Wave Breaking**: Tide height affects how waves break at reef/beach breaks
- **Access Timing**: Low tide may expose hazards or improve access
- **Wave Quality**: Some spots work better on incoming/outgoing tides

## Technical Details

### Open-Meteo Parameters
```
ocean_current_velocity (m/s) - Surface current speed
ocean_current_direction (°) - Current direction (meteorological)
```

### NOAA Data Processing
```typescript
// Tide prediction analysis
const currentHeight = interpolateTideHeight(predictions, now);
const nextHigh = predictions.find(p => p.type === 'H' && new Date(p.t) > now);
const nextLow = predictions.find(p => p.type === 'L' && new Date(p.t) > now);
```

### Error Handling
- **API Failures**: Graceful degradation to surf-only data
- **Data Gaps**: Clear indicators when oceanographic data unavailable
- **Location Coverage**: Automatic detection of data availability

## Future Enhancements

### Planned Features
1. **Current Predictions**: Multi-hour current forecasts
2. **Tidal Charts**: Visual tide curve display
3. **Rip Current Warnings**: AI-enhanced safety alerts
4. **Historical Analysis**: Tide/current pattern analysis

### Enhanced Integrations
1. **Satellite Data**: Real-time sea surface temperature
2. **Wave Models**: Integration with wave forecasting models
3. **Local Knowledge**: Spot-specific tide/current effects

## Benefits

### For Surfers
- **Safety**: Current velocity warnings and tide timing
- **Wave Quality**: Understanding tidal effects on breaks  
- **Planning**: Optimal session timing based on tides
- **Local Conditions**: Professional oceanographic context

### For Surf Spots
- **Reef Breaks**: Critical tide height information
- **Beach Breaks**: Current and tide interaction analysis
- **Point Breaks**: Longshore current and swell direction correlation
- **Tidal Pools**: Low tide access and safety information

## Data Accuracy

### Open-Meteo Marine API
- **Resolution**: 5km global grid
- **Update Frequency**: Hourly updates
- **Validation**: Compared against buoy measurements
- **Coverage**: Global ocean coverage

### NOAA Tide Data
- **Accuracy**: Official government predictions
- **Validation**: Real-time station measurements
- **Coverage**: US coastal waters only
- **Resolution**: 6-minute intervals

---

*This oceanographic integration represents a significant enhancement to SurfHub's forecasting capabilities, providing professional-grade marine data that was previously only available through expensive commercial services.*
