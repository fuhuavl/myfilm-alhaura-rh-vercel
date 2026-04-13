import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROUTES = ["/admin"];
const USER_ROUTES = ["/watchlist"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isUserRoute = USER_ROUTES.some((r) => pathname.startsWith(r));

  if ((isAdminRoute || isUserRoute) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/watchlist/:path*"],
};
