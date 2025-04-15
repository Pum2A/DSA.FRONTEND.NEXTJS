/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5178/api/:path*", // Twój backend API
      },
    ];
  },
};

module.exports = nextConfig;
