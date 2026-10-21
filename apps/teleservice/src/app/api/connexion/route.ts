import { auth } from "~/lib/auth";

const DEFAULT_CALLBACK_URL = "/dashboard/declarations";

// Only same-origin paths: an absolute URL here would make this an open redirect.
const safeCallbackURL = (value: string | null) =>
	value?.startsWith("/") && !value.startsWith("//")
		? value
		: DEFAULT_CALLBACK_URL;

// A relative Location: behind the proxy, `request.url` carries the internal host.
const backToHome = () =>
	new Response(null, { status: 303, headers: { Location: "/" } });

async function authorizationURL(response: Response) {
	if (!response.ok) {
		console.error(
			`ProConnect sign-in failed: ${response.status} ${await response.text()}`,
		);
		return undefined;
	}
	try {
		const { url } = (await response.json()) as { url?: string };
		if (!url) console.error("ProConnect sign-in returned no authorization URL");
		return url;
	} catch (error) {
		console.error("ProConnect sign-in returned an unreadable response", error);
		return undefined;
	}
}

export async function GET(request: Request) {
	const callbackURL = safeCallbackURL(
		new URL(request.url).searchParams.get("callbackURL"),
	);

	const response = await auth.api.signInWithOAuth2({
		body: { providerId: "proconnect", callbackURL },
		headers: request.headers,
		asResponse: true,
	});

	const url = await authorizationURL(response);
	if (!url) return backToHome();

	const headers = new Headers({ Location: url });
	for (const cookie of response.headers.getSetCookie()) {
		headers.append("Set-Cookie", cookie);
	}
	return new Response(null, { status: 302, headers });
}
