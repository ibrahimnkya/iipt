import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@tiips/db", "@tiips/types"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent server-side bundling of client-only OCR libraries
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "tesseract.js",
        "pdfjs-dist",
      ];
    }
    // pdfjs-dist ships a canvas opt-in dependency – ignore it if not available
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
