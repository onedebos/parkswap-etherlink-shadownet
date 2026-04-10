import type { NextConfig } from "next";
import path from "path";

/** This app directory only — not the parent monorepo. Keeps dev/build from inferring txpark-dex as root. */
const projectRoot = path.resolve(__dirname);
const localNodeModules = path.join(projectRoot, "node_modules");

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  webpack: (config) => {
    config.resolve.modules = [
      localNodeModules,
      ...(Array.isArray(config.resolve.modules) ? config.resolve.modules : []),
    ];
    return config;
  },
};

export default nextConfig;
