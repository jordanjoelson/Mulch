import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    // Pin the workspace root to this project. Without this, a stray
    // package-lock.json in C:\Users\jjoel makes Turbopack infer the whole
    // home folder as the root and watch/index it, pegging CPU and hanging.
    root: process.cwd(),
  },
};

export default nextConfig;
