import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://connect.facebook.net https://src.litix.io;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://firebasestorage.googleapis.com https://padelix.co.id https://image.mux.com https://www.facebook.com https://*.litix.io;
  font-src 'self' data:;
  connect-src 'self' https://www.facebook.com https://graph.facebook.com https://*.mux.com https://*.litix.io https://storage.googleapis.com;
  frame-src https://www.facebook.com;
  media-src 'self' blob: https://image.mux.com https://*.mux.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://www.facebook.com;
  worker-src 'self' blob:;
  frame-ancestors 'none';
  ${isDev ? "" : "upgrade-insecure-requests;"}
`;

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-site",
  },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.1.*"],
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "padelix.co.id",
      },
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
