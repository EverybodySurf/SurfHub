// Environment variable validation
export function validateEnvironmentVariables() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GEMINI_API_KEY',
    'OPENWEATHER_API_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '))
    
    // Only throw error in production runtime (not during build)
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || ''
  }
}
