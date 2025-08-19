import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "ittaxcalculator";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(isProd
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
};

export default nextConfig;
