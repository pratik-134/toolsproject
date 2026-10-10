import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emptyModulePath = path.resolve(__dirname, 'lib/empty-module.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  serverExternalPackages: ['@prisma/client', 'prisma', 'docx', '@react-pdf/renderer', '@huggingface/transformers'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), display-capture=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' blob: data: https:; media-src 'self' blob: data:; connect-src 'self' blob: data: https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co; worker-src 'self' blob:; frame-src 'self' blob:;",
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/brand/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/apple-icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/tools/builders/resume-builder',
        destination: '/editor',
        permanent: true,
      },
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
        source: '/tools/document-pdf/pdf-protect',
        destination: '/tools/document-pdf/pdf-encryptor',
        permanent: true,
      },
      {
        source: '/tools/document-pdf/pdf-unlock',
        destination: '/tools/document-pdf/pdf-decryptor',
        permanent: true,
      },
      {
        source: '/tools/document-pdf/markdown-note-maker',
        destination: '/tools/document-pdf/direct-markdown-editor',
        permanent: true,
      },
      {
        source: '/tools/document-pdf/pdf-merge',
        destination: '/tools/document-pdf/pdf-merger',
        permanent: true,
      },
      {
        source: '/tools/document-pdf/pdf-split',
        destination: '/tools/document-pdf/pdf-splitter',
        permanent: true,
      },
      {
        source: '/tools/image/image-compressor',
        destination: '/tools/image/batch-image-compressor',
        permanent: true,
      },
      {
        source: '/tools/security/password-generator',
        destination: '/tools/utilities/password-generator',
        permanent: true,
      },
      {
        source: '/tools/developer/csv-json',
        destination: '/tools/developer/csv-json-converter',
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: emptyModulePath,
      encoding: emptyModulePath,
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
