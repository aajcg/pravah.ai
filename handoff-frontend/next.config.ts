import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:4000";

    return [
      {
        source: "/handoff/:path*",
        destination: `${backend}/handoff/:path*`,
      },
      {
        source: "/chat",
        destination: `${backend}/chat`,
      },
      {
        source: "/health",
        destination: `${backend}/health`,
      },
    ];
  },
};

export default nextConfig;
