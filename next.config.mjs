/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
