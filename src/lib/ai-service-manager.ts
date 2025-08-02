// AI Service with robust error handling and fallbacks
import { z } from 'zod';

export interface AIServiceConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackEnabled: boolean;
}

export class AIServiceError extends Error {
  constructor(
    message: string, 
    public originalError?: any,
    public isRetryable = true,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class AIServiceManager {
  private config: AIServiceConfig;

  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 2000, // 2 seconds
      fallbackEnabled: true,
      ...config
    };
  }

  /**
   * Execute AI request with retry logic and error handling
   */
  async executeWithRetry<T>(
    aiRequest: () => Promise<T>,
    fallbackFn?: () => Promise<T>,
    context: string = 'AI Request'
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`${context}: Attempt ${attempt}/${this.config.maxRetries}`);
        
        const result = await aiRequest();
        console.log(`${context}: Success on attempt ${attempt}`);
        return result;
        
      } catch (error: any) {
        lastError = error;
        console.error(`${context}: Attempt ${attempt} failed:`, {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          traceId: error.traceId
        });

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);
        
        if (!isRetryable || attempt === this.config.maxRetries) {
          console.log(`${context}: ${isRetryable ? 'Max retries reached' : 'Non-retryable error'}`);
          break;
        }

        // Wait before retry with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        console.log(`${context}: Waiting ${delay}ms before retry...`);
        await this.sleep(delay);
      }
    }

    // If we get here, all retries failed - try fallback
    if (this.config.fallbackEnabled && fallbackFn) {
      try {
        console.log(`${context}: Attempting fallback...`);
        const fallbackResult = await fallbackFn();
        console.log(`${context}: Fallback successful`);
        return fallbackResult;
      } catch (fallbackError) {
        console.error(`${context}: Fallback also failed:`, fallbackError);
        throw new AIServiceError(
          `Both primary and fallback ${context.toLowerCase()} failed`,
          { primary: lastError, fallback: fallbackError },
          false
        );
      }
    }

    // Convert to our custom error type
    throw new AIServiceError(
      this.getErrorMessage(lastError, context),
      lastError,
      this.isRetryableError(lastError),
      lastError?.status
    );
  }

  /**
   * Determine if an error is worth retrying
   */
  private isRetryableError(error: any): boolean {
    // Google AI API specific errors
    if (error?.status) {
      switch (error.status) {
        case 503: // Service Unavailable (model overloaded)
        case 502: // Bad Gateway
        case 504: // Gateway Timeout
        case 429: // Too Many Requests
          return true;
        case 400: // Bad Request (usually not retryable)
        case 401: // Unauthorized
        case 403: // Forbidden
        case 404: // Not Found
          return false;
        default:
          return error.status >= 500; // Server errors are retryable
      }
    }

    // Network errors
    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNRESET') {
      return true;
    }

    // Timeout errors
    if (error?.message?.includes('timeout')) {
      return true;
    }

    // Default to retryable for unknown errors
    return true;
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any, context: string): string {
    if (error?.status) {
      switch (error.status) {
        case 503:
          return `AI service is temporarily overloaded. This usually resolves within a few minutes.`;
        case 429:
          return `Too many requests to AI service. Please wait a moment before trying again.`;
        case 401:
          return `AI service authentication failed. Please check your API configuration.`;
        case 400:
          return `Invalid request to AI service. This may indicate a configuration issue.`;
        default:
          return `AI service error (${error.status}): ${error.message}`;
      }
    }

    return `${context} failed: ${error?.message || 'Unknown error'}`;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a fallback response for surf forecasting
   */
  static createFallbackSurfForecast(input: any): any {
    return {
      location: input.location,
      conditions: `Weather-based surf conditions for ${input.location}. AI forecasting temporarily unavailable.`,
      recommendation: `Current weather: ${input.weatherDescription} with ${input.temperature}°C. Wind: ${input.windSpeed} m/s. Consider local surf conditions and check visual conditions before surfing.`,
      windConditions: `Wind: ${input.windSpeed} m/s from ${input.windDirection}°`,
      weatherSummary: `${input.weatherDescription}, ${input.temperature}°C, ${input.humidity}% humidity`,
      surfabilityScore: 5, // Neutral score when uncertain
      
      // Estimated marine data based on weather
      marineData: {
        waveHeight: Math.max(0.5, input.windSpeed * 0.15), // Rough estimation
        primarySwellHeight: Math.max(0.3, input.windSpeed * 0.12),
        primarySwellPeriod: Math.min(12, Math.max(6, 8 + input.windSpeed * 0.2)),
        primarySwellDirection: (input.windDirection + 180) % 360, // Opposite to wind
        windSpeed: input.windSpeed,
        windDirection: input.windDirection,
        dataSource: 'estimated_fallback',
      },

      // Basic surf quality
      surfQuality: {
        overallScore: 5,
        rating: 'Unknown - AI Unavailable',
        breakdown: {
          waveHeight: 0.5,
          wavePeriod: 0.5,
          wind: Math.max(0, 1 - (input.windSpeed / 20)), // Assume onshore wind is bad
          swellDirection: 0.5,
        },
        description: 'Surf quality assessment unavailable due to AI service issues. Please check local conditions and make your own assessment.',
      },

      // Metadata
      forecastType: 'fallback',
      dataQuality: 'Limited - AI Unavailable',
      apiCostsUsed: false,
      
      // Warning for user
      serviceWarning: {
        type: 'ai_unavailable',
        message: 'AI forecasting service is temporarily unavailable. This is a basic weather-based estimate.',
        suggestion: 'Try again in a few minutes for full AI analysis, or check local surf reports.',
      }
    };
  }
}

// Global instance
export const aiServiceManager = new AIServiceManager();
