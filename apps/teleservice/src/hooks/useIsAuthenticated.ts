import { authClient } from "~/lib/auth-client";

export function useIsAuthenticated(hasSessionCookie: boolean | undefined) {
	const { data: authSession, isPending } = authClient.useSession();
	return isPending ? !!hasSessionCookie : !!authSession;
}
