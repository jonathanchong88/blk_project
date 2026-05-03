import { NextResponse } from 'next/server';

export function middleware(request) {
  const origin = request.headers.get('origin');
  
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://blk-project-frontend-dev.onrender.com',
    process.env.VITE_FRONTEND_URL,
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development');

  // Handle CORS preflight (OPTIONS) requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Handle normal requests
  const response = NextResponse.next();
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
