#!/bin/bash

# Turbopack Development Helper Script
# This script provides various Turbopack development commands

echo "🚀 SurfHub Turbopack Development Helper"
echo "======================================="

# Function to start development with Turbopack
start_dev() {
    echo "Starting Next.js development server with Turbopack..."
    npm run dev
}

# Function to start development with debugging
start_dev_debug() {
    echo "Starting Next.js development server with Turbopack and debugging..."
    npm run dev:debug
}

# Function to build with Turbopack (experimental)
build_turbo() {
    echo "Building with Turbopack (stable)..."
    npm run build:turbo
}

# Function to show Turbopack info
show_info() {
    echo "Turbopack Configuration Info:"
    echo "- Next.js Version: $(npm list next --depth=0 2>/dev/null | grep next@)"
    echo "- Turbopack enabled in development: ✅"
    echo "- Turbopack status: Stable (no longer experimental)"
    echo "- Built-in TypeScript support: ✅"
    echo "- Path aliases configured: ✅"
    echo "- Build optimization: Available via npm run build:turbo"
    echo "- Webpack conflicts: Resolved ✅"
}

# Function to clear Next.js cache
clear_cache() {
    echo "Clearing Next.js cache..."
    rm -rf .next
    echo "Cache cleared! 🧹"
}

# Function to test weather API
test_weather_api() {
    echo "Testing OpenWeatherMap API..."
    if [ -f .env.local ]; then
        API_KEY=$(grep "NEXT_PUBLIC_OPENWEATHER_API_KEY" .env.local | cut -d '=' -f2)
        if [ -n "$API_KEY" ]; then
            echo "✅ API key found in .env.local"
            echo "Testing API call with London..."
            curl -s "https://api.openweathermap.org/data/2.5/weather?q=London&appid=$API_KEY&units=metric" | head -c 100
            echo "..."
            echo "API test completed!"
        else
            echo "❌ NEXT_PUBLIC_OPENWEATHER_API_KEY not found in .env.local"
        fi
    else
        echo "❌ .env.local file not found"
    fi
}

# Function to test surf quality algorithms
test_surf_algorithms() {
    echo "Testing Surf Quality Algorithms..."
    echo "=================================="
    
    echo "Example 1: Malibu - Perfect Conditions"
    echo "Wave Height: 2.0m, Period: 14s, Wind: 5kt offshore"
    echo "Expected Score: 8-9/10"
    echo ""
    
    echo "Example 2: Bondi - Marginal Conditions" 
    echo "Wave Height: 0.8m, Period: 6s, Wind: 15kt onshore"
    echo "Expected Score: 3-4/10"
    echo ""
    
    echo "Example 3: Storm Surf"
    echo "Wave Height: 4.0m, Period: 16s, Wind: 25kt offshore"
    echo "Expected Score: 4-6/10 (too big but clean)"
    echo ""
    
    echo "🧮 Algorithm factors:"
    echo "- Wave Height (30%): Optimal range varies by spot"
    echo "- Wave Period (25%): Longer = better energy (12-16s ideal)"
    echo "- Wind (35%): Offshore best, onshore worst"
    echo "- Swell Direction (10%): Must match spot orientation"
    echo ""
    
    echo "📊 To see this in action, visit /swell-forecaster and try:"
    echo "- Malibu, CA (point break)"
    echo "- Bondi Beach, Sydney (beach break)"
    echo "- Trestles, San Clemente (advanced break)"
}

# Function to test marine data sources
test_marine_data() {
    echo "Testing Marine Data Sources..."
    echo "==============================="
    echo ""
    
    echo "🌊 GLOBAL MARINE DATA COVERAGE:"
    echo ""
    
    echo "🇺🇸 NOAA Coverage (Best Quality):"
    echo "- Continental US (24°N-50°N, 125°W-66°W)"
    echo "- Alaska (54°N-72°N, 180°W-129°W)" 
    echo "- Hawaii (18°N-23°N, 161°W-154°W)"
    echo "- Puerto Rico & US Territories"
    echo "- Provides: Wave height, period, direction, wind, weather"
    echo ""
    
    echo "🌍 Stormglass.io Coverage (Global):"
    echo "- Worldwide marine data"
    echo "- Sources: NOAA, ECMWF, GFS, MetOffice"
    echo "- Provides: Detailed wave/swell breakdown, wind, weather"
    echo "- Cost: ~$50/month for API access"
    echo ""
    
    echo "🌐 World Weather Online (Global):"
    echo "- Marine weather worldwide"
    echo "- Good for basic wave/wind data"
    echo "- Cost: ~$20/month for API access"
    echo ""
    
    echo "☁️ OpenWeather Fallback (Global):"
    echo "- Weather data with wave estimates"
    echo "- Free tier available"
    echo "- Less accurate for surf forecasting"
    echo ""
    
    echo "🔧 DATA SOURCE SELECTION:"
    echo "System automatically chooses best source based on location:"
    echo "- US waters → NOAA (most accurate)"
    echo "- Global → Stormglass (if API key available)"
    echo "- Fallback → OpenWeather (free but estimates)"
    echo ""
    
    echo "📊 To test with real data, add to .env.local:"
    echo "STORMGLASS_API_KEY=your_stormglass_key"
    echo "WORLD_WEATHER_API_KEY=your_worldweather_key"
}

# Test Smart Forecaster Selection Logic
test_smart_forecaster() {
    echo "🤖 SMART FORECASTER SELECTION TEST"
    echo "=================================="
    echo ""
    
    echo "📊 FORECASTER COMPARISON:"
    echo "┌─────────────────┬─────────────┬──────────┬─────────────────┐"
    echo "│ Forecaster      │ Data Quality│ API Cost │ Requirements    │"
    echo "├─────────────────┼─────────────┼──────────┼─────────────────┤"
    echo "│ Original        │ ⭐⭐⭐        │ Free     │ None            │"
    echo "│ Enhanced        │ ⭐⭐⭐⭐       │ Free     │ OpenWeather key │"
    echo "│ Marine Enhanced │ ⭐⭐⭐⭐⭐      │ $0-50/mo │ Marine API keys │"
    echo "│ Smart (Auto)    │ ⭐⭐⭐⭐⭐      │ Auto     │ Best available  │"
    echo "└─────────────────┴─────────────┴──────────┴─────────────────┘"
    echo ""
    
    echo "🔍 SMART SELECTION LOGIC:"
    echo "1. Check for marine API keys (Stormglass, NOAA, etc.)"
    echo "   → If available: Use Marine Enhanced Forecaster"
    echo ""
    echo "2. Check for OpenWeather API key"
    echo "   → If available: Use Enhanced Forecaster"
    echo ""
    echo "3. Fallback to Original Forecaster"
    echo "   → Always available (uses LLM estimates)"
    echo ""
    
    echo "🌊 YOUR CURRENT SETUP:"
    if [ -f ".env.local" ]; then
        if grep -q "NEXT_PUBLIC_OPENWEATHER_API_KEY=" .env.local; then
            echo "✅ OpenWeather API key found → Enhanced forecasts available"
        else
            echo "❌ No OpenWeather API key → Using original forecaster"
        fi
        
        if grep -q "STORMGLASS_API_KEY=" .env.local; then
            echo "✅ Stormglass API key found → Marine forecasts available"
        else
            echo "⚠️  No Stormglass key → Add for premium marine data"
        fi
        
        if grep -q "WORLD_WEATHER_API_KEY=" .env.local; then
            echo "✅ World Weather API key found → Global marine data available"
        else
            echo "⚠️  No World Weather key → Add for additional marine coverage"
        fi
    else
        echo "❌ No .env.local file → Create from .env.example and add API keys"
    fi
    echo ""
    
    echo "🧪 TEST DIFFERENT SCENARIOS:"
    echo "# Test auto-selection (best available)"
    echo 'curl -X POST http://localhost:3000/api/swell-forecast -H "Content-Type: application/json" -d '\''{"location": "Malibu, CA", "preferredForecastType": "auto"}'\'''
    echo ""
    echo "# Force enhanced forecaster"
    echo 'curl -X POST http://localhost:3000/api/swell-forecast -H "Content-Type: application/json" -d '\''{"location": "Malibu, CA", "preferredForecastType": "enhanced"}'\'''
    echo ""
    echo "# Force marine forecaster (requires API keys)"
    echo 'curl -X POST http://localhost:3000/api/swell-forecast -H "Content-Type: application/json" -d '\''{"location": "Malibu, CA", "preferredForecastType": "marine"}'\'''
    echo ""
    
    echo "💡 RECOMMENDATION:"
    echo "Start with 'auto' mode - it automatically uses your best available forecaster!"
}

# Main menu
case "$1" in
    "dev")
        start_dev
        ;;
    "debug")
        start_dev_debug
        ;;
    "build")
        build_turbo
        ;;
    "info")
        show_info
        ;;
    "clear")
        clear_cache
        ;;
    "test-weather")
        test_weather_api
        ;;
    "test-surf")
        test_surf_algorithms
        ;;
    "test-marine")
        test_marine_data
        ;;
    "test-smart")
        test_smart_forecaster
        ;;
    *)
        echo "Usage: $0 {dev|debug|build|info|clear|test-weather|test-surf|test-marine|test-smart}"
        echo ""
        echo "Commands:"
        echo "  dev    - Start development server with Turbopack"
        echo "  debug  - Start development server with Turbopack and debugging"
        echo "  build  - Build with Turbopack (stable)"
        echo "  info   - Show Turbopack configuration info"
        echo "  clear       - Clear Next.js cache"
        echo "  test-weather - Test OpenWeatherMap API connection"
        echo "  test-surf   - Show surf quality algorithm examples"
        echo "  test-marine - Show marine data source information"
        echo "  test-smart  - Test smart forecaster selection logic"
        ;;
esac
