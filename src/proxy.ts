import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./utils/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass middleware for admin and admin API routes
  const isAdminShell = pathname === "/admin" || pathname.startsWith("/admin/");
  const isApi = pathname.startsWith("/api/");
  const referer = request.headers.get("referer") || "";
  const isFromAdmin = referer.includes("/admin");

  if (isAdminShell || (isApi && isFromAdmin)) return NextResponse.next();

  // Classic middleware
  const authSession = await auth.api.getSession({
    headers: request.headers,
  });

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
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
