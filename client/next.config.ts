// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "cms.padelix.co.id",
        pathname: "/uploads/**",
      },
    ],
  },
  compiler: {
    removeConsole: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' localhost:1337 cms.padelix.co.id data:; font-src 'self';",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://localhost:1337/uploads/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:1337/api/:path*",
      },
    ];
  },
};

export default nextConfig;
