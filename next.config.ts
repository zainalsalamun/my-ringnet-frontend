import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    // Only used in local development (production uses NEXT_PUBLIC_API directly)
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:3000/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
