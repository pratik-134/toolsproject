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
  async redirects() {
    return [
      {
        source: '/tools/document-pdf/pdf-to-image',
        destination: '/tools/document-pdf/pdf-to-jpg',
        permanent: true,
      },
      {
        source: '/tools/calculators/chmod-calculator',
        destination: '/tools/developer/chmod-calculator',
        permanent: true,
      },
      {
        source: '/tools/calculators/base-converter',
        destination: '/tools/developer/base-converter',
        permanent: true,
      },
      {
        source: '/tools/calculators/roman-numeral-converter',
        destination: '/tools/utilities/roman-numeral-converter',
        permanent: true,
      },
      {
        source: '/tools/url-cloud',
        destination: '/tools',
        permanent: true,
      },
    ];
  },
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
