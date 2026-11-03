import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: [
    '*.trycloudflare.com',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: '/dashboard/vcs/reportes',
        destination: '/dashboard/vinculacion/proyectos-comunitarios',
        permanent: false,
      },
      {
        source: '/dashboard/vcs/asignaciones',
        destination: '/dashboard/vinculacion/asignaciones-existentes',
        permanent: false,
      },
      {
        source: '/dashboard/vcs/estudiante',
        destination: '/dashboard/vinculacion/mi-proyecto',
        permanent: false,
      },
      {
        source: '/dashboard/vcs/tutores',
        destination: '/dashboard/vinculacion/tutores',
        permanent: false,
      },
      {
        source: '/dashboard/vcs/evidencias',
        destination: '/dashboard/vinculacion/evidencias',
        permanent: false,
      },
      {
        source: '/dashboard/vcs/:path*',
        destination: '/dashboard/vinculacion/:path*',
        permanent: false,
      },
    ];
  },
}

export default nextConfig
