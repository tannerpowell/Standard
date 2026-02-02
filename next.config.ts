import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/training-1",
        destination: "/training",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/environmental",
        destination: "/environmental-services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
