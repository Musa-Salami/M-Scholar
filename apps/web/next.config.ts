import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: { unoptimized: true },
  transpilePackages: ["@m-scholar/shared"],
};

export default nextConfig;
