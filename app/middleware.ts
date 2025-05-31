import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"]; // Dodaj inne chronione ścieżki
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(
    process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken"
  )?.value;

  if (accessToken && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !accessToken &&
    PROTECTED_ROUTES.some((path) => pathname.startsWith(path))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname); // Zapamiętaj, dokąd użytkownik chciał iść
    loginUrl.searchParams.set("expired", "1"); // Opcjonalny parametr informujący o wygaśnięciu sesji
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Dopasuj wszystkie ścieżki żądań oprócz tych, które zaczynają się od:
     * - api (ścieżki API)
     * - _next/static (pliki statyczne)
     * - _next/image (optymalizacja obrazów)
     * - favicon.ico (plik favicon)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
