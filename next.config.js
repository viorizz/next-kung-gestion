/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable ESLint during builds to avoid the ESLint configuration issues
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;