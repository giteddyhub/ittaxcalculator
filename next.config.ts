import type { NextConfig } from "next";

const isGhPages = process.env.GH_PAGES === "true";
const repoName = "ittaxcalculator";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(isGhPages
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
};

export default nextConfig;
