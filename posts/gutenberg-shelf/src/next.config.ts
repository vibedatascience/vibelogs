import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  basePath: "/vibelogs/posts/gutenberg-shelf",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
