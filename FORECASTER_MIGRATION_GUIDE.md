# 🔄 Swell Forecaster Migration Guide

## 🌊 **Current Architecture**

Your SurfHub now has **three forecasting levels** that work together:

### **📊 Forecaster Comparison**

| Forecaster | Data Quality | API Cost | Use Case |
|------------|-------------|----------|----------|
| **Original** | ⭐⭐⭐ Basic | Free | Fallback/Simple |
| **Enhanced** | ⭐⭐⭐⭐ Good | Free | Better analysis |
| **Marine Enhanced** | ⭐⭐⭐⭐⭐ Premium | $0-50/mo | Professional |
| **Smart (New)** | ⭐⭐⭐⭐⭐ Auto | Auto | Best available |

## 🤖 **Smart Forecaster (Recommended)**

The new **Smart Forecaster** automatically chooses the best available forecaster:

```typescript
// Automatically selects best forecaster based on available APIs
const result = await smartSwellForecastFlow({
  location: "Malibu, CA",
  preferredForecastType: "auto" // or "marine", "enhanced", "basic"
});
```

**Selection Logic**:
1. **Marine APIs available** → Marine Enhanced (best quality)
2. **OpenWeather only** → Enhanced (good algorithms)
3. **Limited access** → Original (basic fallback)

## 🔧 **Migration Options**

### **Option 1: Gradual Migration (Recommended)**

Keep all forecasters and use Smart Forecaster as your primary:

```typescript
// In your API route
import { smartSwellForecastFlow } from '@/ai/flows/smart-swell-forecast';

// This automatically uses the best available forecaster
const result = await smartSwellForecastFlow(input);
```

**Benefits**:
- ✅ Automatic fallbacks
- ✅ Future-proof
- ✅ No breaking changes
- ✅ Scales with API additions

### **Option 2: Direct Replacement**

Replace original with Enhanced Forecaster:

```typescript
// Replace in your API route
import { enhancedSwellForecastFlow } from '@/ai/flows/enhanced-swell-forecast';

const result = await enhancedSwellForecastFlow(input);
```

**Benefits**:
- ✅ Immediate improvement
- ✅ No additional API costs
- ✅ Better surf algorithms

### **Option 3: Premium Upgrade**

Use Marine Enhanced directly:

```typescript
// For premium forecasting
import { marineEnhancedSwellForecastFlow } from '@/ai/flows/marine-enhanced-swell-forecast';

const result = await marineEnhancedSwellForecastFlow({ location: input.location });
```

**Benefits**:
- ✅ Highest accuracy
- ✅ Real marine data
- ❌ Requires API keys

## 📝 **Recommended Implementation**

### **Step 1: Update Your API Route**

Replace your current API route with the Smart Forecaster:

```typescript
// src/app/api/swell-forecast/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { smartSwellForecastFlow, type SmartForecastInput } from '@/ai/flows/smart-swell-forecast';

export async function POST(request: NextRequest) {
  try {
    const input: SmartForecastInput = await request.json();
    
    if (!input.location || input.location.length < 2) {
      return NextResponse.json(
        { error: 'Location must be at least 2 characters.' },
        { status: 400 }
      );
    }

    console.log('API Route: Processing smart swell forecast request for:', input.location);
    
    const result = await smartSwellForecastFlow(input);
    
    console.log(`API Route: Forecast generated using ${result.forecastType} forecaster`);
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
```

### **Step 2: Update Your Frontend**

The Smart Forecaster output includes metadata about which forecaster was used:

```typescript
// In your SwellForecastClient.tsx
const result = await fetchSwellForecastAction(input);

if (result.data) {
  // Show additional info based on forecaster type
  console.log(`Forecast quality: ${result.data.dataQuality}`);
  console.log(`Using: ${result.data.forecastType} forecaster`);
  
  // Show marine data if available
  if (result.data.marineData) {
    console.log(`Wave data from: ${result.data.marineData.dataSource}`);
  }
}
```

## 🔮 **Future Roadmap**

### **Phase 1: Current** ✅
- Original, Enhanced, Marine, and Smart forecasters
- Automatic source selection
- Free tier with premium upgrades

### **Phase 2: Planned**
- Historical data analysis
- Tide integration
- Water temperature
- Crowd predictions

### **Phase 3: Advanced**
- Machine learning refinements
- Webcam analysis
- Storm tracking
- Custom spot configurations

## 💡 **Recommendation**

**Start with the Smart Forecaster** - it gives you the best available quality automatically and scales as you add API keys:

1. **Now**: Uses Enhanced forecasting (free, better algorithms)
2. **Later**: Add Stormglass key → Automatically upgrades to Marine data
3. **Future**: New APIs → Automatic integration

This approach gives you immediate improvement with a clear upgrade path! 🚀

## 🧪 **Testing Your Setup**

```bash
# Test the smart forecaster selection
./turbo-dev.sh test-marine

# Try in your app with different locations:
- "Malibu, CA" (US - could use NOAA)
- "Bondi Beach, Sydney" (Global - needs marine APIs)
- "Ericeira, Portugal" (Europe - tests regional configs)
```

The Smart Forecaster will tell you which forecaster it's using and why! 🌊
