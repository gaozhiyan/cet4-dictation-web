import type { NextConfig } from "next";
import TerserPlugin from "terser-webpack-plugin";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            ecma: 2017,
            safari10: true,
            compress: {
              drop_console: true,
            },
          },
        }),
      ];
    }
    return config;
  },
};

export default nextConfig;
