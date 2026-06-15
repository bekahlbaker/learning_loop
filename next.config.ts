import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@adaptive/shared'],
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

export default nextConfig
