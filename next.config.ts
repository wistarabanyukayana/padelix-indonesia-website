// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
      {
        protocol: "https",
        hostname: "cms.padelix.co.id",
        pathname: "/uploads/**",
      },
    ],
  },
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
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
            value: "default-src 'self'; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://firebasestorage.googleapis.com data: blob:; font-src 'self'; media-src 'self' *.mux.com blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;