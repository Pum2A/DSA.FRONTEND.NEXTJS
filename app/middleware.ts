import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Sprawdź obecność JWT w ciasteczku
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Przekieruj na login z redirectem
    return NextResponse.redirect(new URL('/login?expired=1', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};