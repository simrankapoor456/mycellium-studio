import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "frame-src 'none'",
  ].join("; ") },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
] as const;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
  async headers() {
    return [
      { source: "/(.*)", headers: [...securityHeaders] },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/dashboard", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/projects/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
      { source: "/settings/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default nextConfig;
