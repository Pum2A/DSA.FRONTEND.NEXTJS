import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This array contains all paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/lessons',
  '/modules',
  '/profile',
  '/quizzes',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;
  
  // Check if the path is protected and user is not authenticated
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
  
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }
  
  // Check if user is trying to access login/register while already authenticated
  if ((path === '/login' || path === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (leave API handling to the actual endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};