import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./payload/auth";

const BETTER_AUTH_COOKIES = [
  "better-auth.session_token",
  "better-auth.session_data",
];

function stripBetterAuthCookies(cookieHeader: string | null) {
  if (!cookieHeader) return "";
  const parts = cookieHeader.split(";").map((c) => c.trim());
  const kept = parts.filter((c) => {
    const [name = ""] = c.split("=", 1);
    return !BETTER_AUTH_COOKIES.includes(name);
  });
  return kept.join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // To remove better auth cookies from admin and api requests to prevent user conflicts
  const isAdminShell = pathname === "/admin" || pathname.startsWith("/admin/");
  const isApi = pathname.startsWith("/api/");
  const referer = request.headers.get("referer") || "";
  const isFromAdmin = referer.includes("/admin");

  if (isAdminShell || (isApi && isFromAdmin)) {
    const headers = new Headers(request.headers);
    const original = headers.get("cookie");
    const filtered = stripBetterAuthCookies(original);

    if (filtered) headers.set("cookie", filtered);
    else headers.delete("cookie");

    // Important: we do NOT set any Set-Cookie in the response,
    // so the browser keeps the Better Auth cookie for the frontend.
    return NextResponse.next({
      request: { headers },
    });
  }

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
  runtime: "nodejs",
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
