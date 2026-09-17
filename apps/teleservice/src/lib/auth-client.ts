import { genericOAuthClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
import Cookies from "js-cookie";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
	basePath: "/api/better-auth",
	plugins: [genericOAuthClient(), nextCookies()],
});

export type Session = typeof authClient.$Infer.Session;

export async function signInWithProConnect(
	callbackURL = "/dashboard/declarations",
) {
	const response = await authClient.signIn.oauth2({
		providerId: "proconnect",
		callbackURL,
	});

	const urlParams = new URLSearchParams(response?.data?.url);
	Cookies.set("oauth_state", urlParams.get("state") ?? "");
	Cookies.set("oauth_nonce", urlParams.get("nonce") ?? "");
}
