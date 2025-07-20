import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Turbopack configuration (now stable in Next.js 15+)
  turbopack: {
    resolveAlias: {
      // Add any custom aliases here if needed
      '@': './src',
    },
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.app.github.dev',
        '*.github.dev',
        '3000-firebase-studio-1748440712172.cluster-pgviq6mvsncnqxx6kr7pbz65v6.cloudworkstations.dev',
        'scaling-zebra-wrvpgv6rvrrv3g4r7-3000.app.github.dev'
      ]
    }
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Note: Webpack configuration removed as it conflicts with Turbopack
  // Turbopack handles module resolution and build optimizations automatically
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
