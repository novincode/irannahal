import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.NEXTAUTH_URL}/api/auth/:path*`,
      },
    ]
  },
};

export default nextConfig;
