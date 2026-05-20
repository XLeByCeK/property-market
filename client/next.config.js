/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Yandex Object Storage (path-style и virtual-hosted)
      {
        protocol: 'https',
        hostname: 'storage.yandexcloud.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.storage.yandexcloud.net',
        pathname: '/**',
      },
      // Локальная разработка / API
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'property-market-api.com',
        pathname: '/**',
      },
      // Внешние источники, оставленные для совместимости
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api-maps.yandex.ru',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
