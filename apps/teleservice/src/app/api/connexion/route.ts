import { auth } from "~/lib/auth";

const DEFAULT_CALLBACK_URL = "/dashboard/declarations";

// Only same-origin paths: an absolute URL here would make this an open redirect.
const safeCallbackURL = (value: string | null) =>
	value?.startsWith("/") && !value.startsWith("//")
		? value
		: DEFAULT_CALLBACK_URL;

export async function GET(request: Request) {
	const callbackURL = safeCallbackURL(
		new URL(request.url).searchParams.get("callbackURL"),
	);

	const response = await auth.api.signInWithOAuth2({
		body: { providerId: "proconnect", callbackURL },
		headers: request.headers,
		asResponse: true,
	});

	const { url } = (await response.json()) as { url?: string };
	if (!url) return Response.redirect(new URL("/", request.url), 303);

	const headers = new Headers({ Location: url });
	for (const cookie of response.headers.getSetCookie()) {
		headers.append("Set-Cookie", cookie);
	}
	return new Response(null, { status: 302, headers });
}
