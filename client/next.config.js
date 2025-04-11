/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'property-market-api.com', 
      'images.unsplash.com',
      'img.icons8.com'
    ],
  },
};

module.exports = nextConfig; 