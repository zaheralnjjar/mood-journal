import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel يتكامل تلقائياً، لا حاجة لـ output: standalone
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
