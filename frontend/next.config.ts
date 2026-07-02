import type { NextConfig } from "next";

// The backend is proxied under the frontend's own origin (`/api/*`) so that all
// API traffic — including the OAuth state cookie — is same-origin. This keeps
// cookies first-party regardless of whether the backend is deployed on a
// different domain. Set BACKEND_INTERNAL_URL to the backend's address.
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
