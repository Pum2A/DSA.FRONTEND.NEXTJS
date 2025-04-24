/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Dodajemy konfigurację dla obrazów
  images: {
    domains: [
      "www.geeksforgeeks.org",
      "miro.medium.com",
      "upload.wikimedia.org",
      "media.geeksforgeeks.org",
      "www.bigocheatsheet.com",
    ],
  },
  // Zachowujemy istniejącą konfigurację przekierowań
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
