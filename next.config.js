/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 60 * 60, // default 60
  reactStrictMode: false,
  swcMinify: true,

  output: 'standalone',

  images: {
    domains: ['static.wikia.nocookie.net', 'static-cdn.jtvnw.net'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024, 1536, 2048],
  }
}

module.exports = nextConfig
