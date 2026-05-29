import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: any, { dev }: { dev: boolean }) => {
    // Disable webpack's persistent file cache in dev to stop the ENOENT
    // "1.pack.gz" spam that happens when .next is wiped between starts.
    if (dev) {
      config.cache = false;
      // Suppress the chunk-info markers that the pack-file cache emits.
      config.infrastructureLogging = { level: "error" };
    }
    return config;
  },
};

export default nextConfig;
