import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only used in local development (production uses NEXT_PUBLIC_API directly)
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:3000/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
