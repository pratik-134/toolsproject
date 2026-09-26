import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emptyModulePath = path.resolve(__dirname, 'lib/empty-module.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['@prisma/client', 'prisma', 'docx', '@react-pdf/renderer'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: emptyModulePath,
      encoding: emptyModulePath,
    };
    return config;
  },
};

export default nextConfig;
