import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Bypass middleware for admin and admin API routes
	const isAdminShell = pathname.startsWith("/admin");
	const isApi = pathname.startsWith("/api");

	if (isAdminShell || isApi) return NextResponse.next();

	if (pathname.endsWith("/publish") || pathname.endsWith("/accept-invite"))
		return NextResponse.next();

	// Cookie presence only: pages validate the session against the database themselves.
	const hasSessionCookie = getSessionCookie(request) !== null;

	if (hasSessionCookie) {
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
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|svg|ico)).*)",
	],
};
