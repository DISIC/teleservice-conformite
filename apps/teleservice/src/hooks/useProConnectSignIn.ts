import Cookies from "js-cookie";

import { authClient } from "~/lib/auth-client";

export function useProConnectSignIn(callbackURL = "/dashboard/declarations") {
	return async () => {
		const response = await authClient.signIn.oauth2({
			providerId: "proconnect",
			callbackURL,
		});

		const urlParams = new URLSearchParams(response?.data?.url);
		Cookies.set("oauth_state", urlParams.get("state") ?? "");
		Cookies.set("oauth_nonce", urlParams.get("nonce") ?? "");
	};
}
