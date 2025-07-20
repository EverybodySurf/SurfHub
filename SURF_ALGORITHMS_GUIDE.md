# 🏄‍♂️ Surf Quality Algorithms - Complete Guide

## 🌊 **How Surf Quality Algorithms Work**

Surf quality algorithms attempt to quantify the subjective concept of "good surf" by analyzing multiple environmental factors and combining them into a numerical score. They're used by surf forecasting websites like Surfline, Magicseaweed, and others.

## 🧮 **Core Algorithm Components**

### **1. Wave Height Scoring (25-30% weight)**

Wave height is crucial, but it's not "bigger = better." Each surf spot has an optimal wave size range:

```javascript
// Example: Beach break optimal range
function scoreWaveHeight(height, spotType) {
  const ranges = {
    'beach_break': [1.0, 2.5],    // meters
    'point_break': [1.5, 3.0],
    'reef_break': [2.0, 4.0],
    'big_wave': [4.0, 8.0]
  };
  
  const [min, max] = ranges[spotType];
  
  if (height < min * 0.5) return 0.1;  // Way too small
  if (height < min) return 0.6;        // Too small but surfable
  if (height <= max) return 1.0;       // Perfect size
  if (height <= max * 1.5) return 0.6; // Getting big
  return 0.2;                          // Too big/dangerous
}
```

### **2. Wave Period/Energy (20-25% weight)**

Wave period indicates the energy and quality of waves:

- **6-8 seconds**: Wind chop/poor energy (score: 0.3)
- **8-12 seconds**: Moderate energy (score: 0.6) 
- **12-16 seconds**: Good groundswell (score: 0.9)
- **16+ seconds**: Excellent long-period swell (score: 1.0)

```javascript
function scoreWavePeriod(period) {
  if (period < 8) return 0.3;   // Wind-generated waves
  if (period < 12) return 0.6;  // Short-period swell
  if (period < 16) return 0.9;  // Long-period swell
  return 1.0;                   // Epic groundswell
}
```

### **3. Wind Conditions (30-35% weight)**

Wind is often the most important factor for surf quality:

**Offshore Wind** (best):
- Grooms wave faces, creates barrels
- 0-5 knots = perfect (score: 1.0)
- 5-10 knots = very good (score: 0.8)
- 10+ knots = too strong (score: 0.4)

**Onshore Wind** (worst):
- Creates choppy, messy conditions
- Any onshore wind significantly reduces quality

**Cross-shore Wind** (neutral):
- Minimal impact on wave quality

```javascript
function scoreWind(windSpeed, windDir, shoreAspect) {
  const isOffshore = Math.abs(windDir - (shoreAspect + 180)) < 45;
  
  if (isOffshore) {
    if (windSpeed <= 5) return 1.0;     // Perfect offshore
    if (windSpeed <= 10) return 0.8;    // Good offshore
    return 0.4;                         // Too windy
  } else {
    // Onshore penalty
    return Math.max(0.2, 0.8 - windSpeed * 0.1);
  }
}
```

### **4. Swell Direction (10-15% weight)**

Each surf spot works best with specific swell directions:

- **Malibu**: Works best with SW swells (225-270°)
- **Pipeline**: Needs NW swells (300-330°)
- **Bondi**: Best with E-SE swells (90-135°)

```javascript
function scoreSwellDirection(swellDir, optimalRange) {
  const [min, max] = optimalRange;
  const inRange = swellDir >= min && swellDir <= max;
  
  if (inRange) return 1.0;              // Perfect direction
  
  const distance = Math.min(
    Math.abs(swellDir - min),
    Math.abs(swellDir - max)
  );
  
  if (distance <= 30) return 0.8;       // Close enough
  if (distance <= 60) return 0.5;       // Marginal
  return 0.2;                           // Wrong direction
}
```

### **5. Tide Influence (5-15% weight)**

Many spots are tide-dependent:

- **Low tide**: May be too shallow or expose rocks
- **Mid tide**: Often ideal for most spots
- **High tide**: May close out or lack power

## 🏄‍♂️ **Real-World Examples**

### **Example 1: Perfect Malibu Day**
```
Wave Height: 2.0m (score: 1.0) - Perfect size for Malibu
Wave Period: 14s (score: 0.9) - Excellent groundswell  
Wind: 5kt offshore (score: 1.0) - Perfect grooming
Swell Direction: 240° (score: 1.0) - Optimal SW swell

Overall Score: 9.7/10 = "Epic"
```

### **Example 2: Blown Out Conditions**
```
Wave Height: 1.5m (score: 0.8) - Good size
Wave Period: 7s (score: 0.3) - Wind chop
Wind: 20kt onshore (score: 0.2) - Destroying waves
Swell Direction: 180° (score: 0.5) - Wrong direction

Overall Score: 3.2/10 = "Poor"
```

### **Example 3: Too Big Day**
```
Wave Height: 5.0m (score: 0.3) - Dangerous size
Wave Period: 16s (score: 1.0) - Amazing energy
Wind: 2kt offshore (score: 1.0) - Perfect conditions
Swell Direction: 225° (score: 1.0) - Perfect direction

Overall Score: 6.1/10 = "Good" (for experts only)
```

## 🎯 **Algorithm Variations**

### **Spot-Specific Adjustments**

Different surf breaks require different algorithms:

**Beach Breaks**:
- More forgiving with wave size
- Wind has huge impact
- Sandbar changes affect quality

**Point Breaks**:
- Specific swell direction requirements
- Can handle larger sizes
- Wind protection from headlands

**Reef Breaks**:
- Precise tide requirements
- Dangerous when too big
- Very direction-sensitive

### **Skill Level Adjustments**

**Beginner Algorithm**:
- Heavily penalize large waves
- Prefer gentle, forgiving conditions
- Emphasize safety factors

**Expert Algorithm**:
- Reward powerful, challenging waves
- Less penalty for large size
- Value wave quality over ease

## 🔧 **Implementation in SurfHub**

Your SurfHub project now includes:

1. **SurfQualityCalculator**: Complete algorithm implementation
2. **Spot Configurations**: Pre-configured famous surf spots
3. **Enhanced AI Flow**: Combines algorithms with AI analysis
4. **Testing Tools**: `./turbo-dev.sh test-surf` for examples

## 📊 **Limitations & Future Improvements**

### **Current Limitations**:
- Estimates wave conditions from weather data
- Limited spot database
- No real marine/buoy data
- Simplified tide calculations

### **Potential Improvements**:
- Integrate NOAA wave data
- Add crowd factor scoring
- Include water temperature
- Real-time webcam analysis
- Machine learning refinements

## 🌊 **Try It Out**

Visit your swell forecaster at `/swell-forecaster` and test these locations:
- **Malibu, CA** - See how point break algorithms work
- **Bondi Beach, Sydney** - Beach break example
- **Trestles, San Clemente** - Advanced break analysis

The algorithms will provide detailed breakdowns showing how each factor contributes to the overall surf quality score!
