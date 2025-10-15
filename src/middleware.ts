import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./payload/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const authSession = await auth.api.getSession({
    headers: await headers(),
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
  runtime: "nodejs",
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|admin).*)",
  ],
};
