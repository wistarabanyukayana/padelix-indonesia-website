// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "cms.padelix.co.id",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
