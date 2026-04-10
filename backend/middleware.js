import { NextResponse } from 'next/server';

export function middleware(request) {
  // Handle CORS preflight (OPTIONS) requests globally
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin':
          process.env.VITE_FRONTEND_URL || 'https://blk-project-frontend-dev.onrender.com',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // For all other requests, add the CORS origin header and continue
  const response = NextResponse.next();
  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.VITE_FRONTEND_URL || 'https://blk-project-frontend-dev.onrender.com'
  );
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
