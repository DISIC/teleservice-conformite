import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "~/proxy";
import { computePublishedDeclarationSlug } from "~/server/api/utils/published-declaration-slug";

const signedIn = { cookie: "better-auth.session_token=abc.def" };
const signedInSecure = { cookie: "__Secure-better-auth.session_token=abc.def" };

function run(path: string, headers: Record<string, string> = {}) {
	const response = proxy(
		new NextRequest(new URL(path, "https://app.test"), { headers }),
	);
	return {
		status: response.status,
		location: response.headers.get("location"),
	};
}

describe("proxy", () => {
	it("lets a session cookie holder see the home page", () => {
		expect(run("/", signedIn).status).toBe(200);
		expect(run("/", signedInSecure).status).toBe(200);
	});

	it("sends a session cookie holder from other public pages to the dashboard", () => {
		expect(run("/unknown-page", signedIn)).toEqual({
			status: 307,
			location: "https://app.test/dashboard",
		});
		expect(run("/unknown-page", signedInSecure).location).toBe(
			"https://app.test/dashboard",
		);
	});

	it("lets a session cookie holder through to the dashboard", () => {
		expect(run("/dashboard/declarations", signedIn).status).toBe(200);
	});

	it("sends an anonymous visitor off the dashboard", () => {
		expect(run("/dashboard/declarations")).toEqual({
			status: 307,
			location: "https://app.test/",
		});
		expect(run("/").status).toBe(200);
	});

	it("never touches admin, api, public declaration and accept-invite routes", () => {
		for (const path of [
			"/admin/collections",
			"/api/trpc/x",
			`/declarations/${computePublishedDeclarationSlug("Mon service", 12)}`,
			"/declarations/12/publish",
			"/accept-invite",
		]) {
			expect(run(path, signedIn).status).toBe(200);
			expect(run(path).status).toBe(200);
		}
	});
});
