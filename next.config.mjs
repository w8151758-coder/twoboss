/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000, // 1年图片缓存
  },
  
  // 优化包导入 - 减少bundle大小
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
    'date-fns',
    'recharts',
    '@supabase/supabase-js',
  ],
  
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Standalone输出优化部署
  output: 'standalone',
  
  // HTTP响应头优化
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ]
  },
}

export default nextConfig
