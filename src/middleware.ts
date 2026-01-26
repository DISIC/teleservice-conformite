import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./utils/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass middleware for admin and admin API routes
  const isAdminShell = pathname.startsWith("/admin");
  const isApi = pathname.startsWith("/api");

  if (isAdminShell || isApi) return NextResponse.next();

  // Classic middleware
  const authSession = await auth.api.getSession({
    headers: request.headers,
  });

  if (pathname.endsWith("/publish")) return NextResponse.next();
  
  if (authSession) {
    if (!pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
