/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required in Next.js 14 to enable the instrumentation.js hook
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
