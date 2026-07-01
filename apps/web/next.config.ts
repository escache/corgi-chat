import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@corgi-chat/ui", "@corgi-chat/core", "@corgi-chat/db"],
};

export default nextConfig;
