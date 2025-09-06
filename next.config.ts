import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Conservative, modern CSP. Adjust if you add third-party scripts or inline scripts/styles.
const scriptSrc: string[] = ["script-src 'self'", "'unsafe-inline'", "blob:"];
if (!isProd) scriptSrc.push("'unsafe-eval'");

const ContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  scriptSrc.join(" "),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // Allow websocket connections during development for HMR
  !isProd ? "connect-src 'self' https: ws: wss:" : "connect-src 'self' https:",
  "media-src 'self' data: blob:",
  "frame-src 'self'",
  // Only upgrade in production to avoid noisy console warnings in dev over http
  isProd ? "upgrade-insecure-requests" : null,
]
  .filter(Boolean)
  .join("; ");

const securityHeaders: Array<{ key: string; value: string }> = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), autoplay=(self)" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Enable HSTS in production behind HTTPS (consider removing includeSubDomains/preload if not desired)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Origin-Agent-Cluster", value: "?1" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: false,
    // Lock down remote images by default; add allowlist entries as needed
    remotePatterns: [],
  },
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  productionBrowserSourceMaps: false,
  compiler: {
    // Keep console.error/warn in prod, strip other console calls
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
