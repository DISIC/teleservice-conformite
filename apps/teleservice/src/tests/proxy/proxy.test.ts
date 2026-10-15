import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "~/proxy";

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
	it("sends a session cookie holder from the home page to the dashboard", () => {
		expect(run("/", signedIn)).toEqual({
			status: 307,
			location: "https://app.test/dashboard",
		});
		expect(run("/", signedInSecure).location).toBe(
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

	it("never touches admin, api, publish and accept-invite routes", () => {
		for (const path of [
			"/admin/collections",
			"/api/trpc/x",
			"/declarations/12/publish",
			"/accept-invite",
		]) {
			expect(run(path, signedIn).status).toBe(200);
			expect(run(path).status).toBe(200);
		}
	});
});
