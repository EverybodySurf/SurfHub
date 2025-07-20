// Surf Quality Algorithm Implementation for SurfHub
// This module calculates surf quality scores based on environmental conditions

export interface SurfConditions {
  // Wave data
  waveHeight: number; // meters
  wavePeriod: number; // seconds
  swellDirection: number; // degrees (0-360)
  
  // Wind data
  windSpeed: number; // m/s
  windDirection: number; // degrees (0-360)
  
  // Tide data (when available)
  tideHeight?: number; // meters
  tideDirection?: 'rising' | 'falling' | 'high' | 'low';
  
  // Location
  location: string;
}

export interface SpotConfiguration {
  name: string;
  type: 'beach_break' | 'point_break' | 'reef_break' | 'river_mouth';
  aspect: number; // shore-facing direction in degrees
  optimalWaveHeight: [number, number]; // min, max in meters
  optimalSwellDirection: [number, number]; // min, max in degrees
  optimalTideRange?: [number, number]; // min, max in meters
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export class SurfQualityCalculator {
  
  static scoreWaveHeight(height: number, optimal: [number, number]): number {
    const [min, max] = optimal;
    
    if (height < min * 0.5) return 0.1; // way too small
    if (height < min) return (height / min) * 0.6; // too small
    if (height <= max) return 1.0; // perfect range
    if (height <= max * 1.5) return Math.max(0.4, 1 - ((height - max) / max) * 0.6); // getting big
    return 0.2; // too big
  }
  
  static scoreWavePeriod(period: number): number {
    // Period quality scoring
    if (period < 6) return 0.1; // wind chop
    if (period < 8) return 0.3; // poor energy
    if (period < 10) return 0.5; // moderate
    if (period < 12) return 0.7; // good
    if (period < 16) return 0.9; // very good
    return 1.0; // excellent groundswell
  }
  
  static scoreWind(
    windSpeed: number, 
    windDirection: number, 
    swellDirection: number,
    shoreAspect: number
  ): number {
    // Calculate if wind is offshore, onshore, or cross-shore
    const offshoreDirection = (shoreAspect + 180) % 360;
    const windAngleDiff = Math.min(
      Math.abs(windDirection - offshoreDirection),
      360 - Math.abs(windDirection - offshoreDirection)
    );
    
    const isOffshore = windAngleDiff <= 45;
    const isCrossShore = windAngleDiff > 45 && windAngleDiff <= 135;
    
    if (isOffshore) {
      // Offshore is best, but not too strong
      if (windSpeed <= 2) return 1.0; // perfect
      if (windSpeed <= 5) return 0.9; // very good
      if (windSpeed <= 8) return 0.7; // good but getting strong
      return 0.4; // too strong offshore
    } else if (isCrossShore) {
      // Cross-shore is okay if light
      if (windSpeed <= 3) return 0.7;
      if (windSpeed <= 6) return 0.5;
      return 0.3;
    } else {
      // Onshore wind (worst case)
      if (windSpeed <= 2) return 0.6; // light onshore acceptable
      if (windSpeed <= 5) return 0.4;
      return 0.2; // strong onshore kills surf
    }
  }
  
  static scoreSwellDirection(
    swellDirection: number, 
    optimalRange: [number, number]
  ): number {
    const [min, max] = optimalRange;
    
    // Handle wrap-around (e.g., optimal range 350-30 degrees)
    let inRange = false;
    if (min <= max) {
      inRange = swellDirection >= min && swellDirection <= max;
    } else {
      inRange = swellDirection >= min || swellDirection <= max;
    }
    
    if (inRange) return 1.0;
    
    // Calculate shortest angular distance to optimal range
    const distToMin = Math.min(
      Math.abs(swellDirection - min),
      360 - Math.abs(swellDirection - min)
    );
    const distToMax = Math.min(
      Math.abs(swellDirection - max),
      360 - Math.abs(swellDirection - max)
    );
    const minDistance = Math.min(distToMin, distToMax);
    
    if (minDistance <= 30) return 0.8; // close enough
    if (minDistance <= 60) return 0.5; // marginal
    if (minDistance <= 90) return 0.3; // poor but surfable
    return 0.1; // wrong direction
  }
  
  static calculateOverallScore(
    conditions: SurfConditions,
    spotConfig: SpotConfiguration
  ): {
    overallScore: number;
    breakdown: Record<string, number>;
    rating: string;
    description: string;
  } {
    
    const scores = {
      waveHeight: this.scoreWaveHeight(conditions.waveHeight, spotConfig.optimalWaveHeight),
      wavePeriod: this.scoreWavePeriod(conditions.wavePeriod),
      wind: this.scoreWind(
        conditions.windSpeed,
        conditions.windDirection,
        conditions.swellDirection,
        spotConfig.aspect
      ),
      swellDirection: this.scoreSwellDirection(
        conditions.swellDirection,
        spotConfig.optimalSwellDirection
      )
    };
    
    // Weighted scoring based on importance
    const weights = {
      waveHeight: 0.30,
      wavePeriod: 0.25,
      wind: 0.35,
      swellDirection: 0.10
    };
    
    const weightedScore = (Object.keys(scores) as Array<keyof typeof scores>).reduce((sum, key) => {
      return sum + (scores[key] * weights[key]);
    }, 0);
    
    // Convert to 1-10 scale
    const overallScore = Math.round(weightedScore * 10);
    
    // Generate rating and description
    const { rating, description } = this.generateRatingDescription(overallScore, scores);
    
    return {
      overallScore,
      breakdown: scores,
      rating,
      description
    };
  }
  
  static generateRatingDescription(
    score: number, 
    breakdown: Record<string, number>
  ): { rating: string; description: string } {
    
    const ratings = [
      { min: 9, rating: "Epic", description: "World-class conditions! Everything is firing." },
      { min: 8, rating: "Excellent", description: "Outstanding surf with great waves and conditions." },
      { min: 7, rating: "Very Good", description: "Really good surf worth making the effort for." },
      { min: 6, rating: "Good", description: "Solid surf with fun waves." },
      { min: 5, rating: "Fair", description: "Decent waves, some fun to be had." },
      { min: 4, rating: "Poor-Fair", description: "Marginal conditions, better than nothing." },
      { min: 3, rating: "Poor", description: "Poor conditions, not really worth it." },
      { min: 2, rating: "Very Poor", description: "Very poor surf, maybe for beginners only." },
      { min: 0, rating: "Flat/Blown Out", description: "No surf or completely blown out conditions." }
    ];
    
    const ratingInfo = ratings.find(r => score >= r.min) || ratings[ratings.length - 1];
    
    // Add specific feedback based on breakdown
    let details = [];
    if (breakdown.wind < 0.5) details.push("wind is problematic");
    if (breakdown.waveHeight < 0.4) details.push("waves are too small");
    if (breakdown.waveHeight > 0.9 && breakdown.wind > 0.7) details.push("great size and clean conditions");
    if (breakdown.wavePeriod > 0.8) details.push("excellent wave energy");
    
    const enhancedDescription = details.length > 0 
      ? `${ratingInfo.description} ${details.join(', ')}.`
      : ratingInfo.description;
    
    return {
      rating: ratingInfo.rating,
      description: enhancedDescription
    };
  }
}

// Example surf spot configurations
export const SURF_SPOTS: Record<string, SpotConfiguration> = {
  'malibu': {
    name: 'Malibu',
    type: 'point_break',
    aspect: 225, // SW facing
    optimalWaveHeight: [1.0, 2.5],
    optimalSwellDirection: [200, 280],
    difficulty: 'intermediate'
  },
  'trestles': {
    name: 'Trestles',
    type: 'beach_break',
    aspect: 225,
    optimalWaveHeight: [1.5, 3.0],
    optimalSwellDirection: [180, 270],
    difficulty: 'advanced'
  },
  'bondi': {
    name: 'Bondi Beach',
    type: 'beach_break', 
    aspect: 90, // East facing
    optimalWaveHeight: [1.0, 2.0],
    optimalSwellDirection: [45, 135],
    difficulty: 'beginner'
  }
};
