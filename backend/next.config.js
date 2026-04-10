/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required in Next.js 14 to enable the instrumentation.js hook
  experimental: {
    instrumentationHook: true,
  },

  // CORS headers for all API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.VITE_FRONTEND_URL || 'https://blk-project-frontend-dev.onrender.com',
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
