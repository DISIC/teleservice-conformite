import type { ParsedUrlQuery } from "node:querystring";
import type { GetServerSideProps, NextApiRequest, Redirect } from "next";
import getPayloadClient from "~/payload/payloadClient";
import { appRouter } from "~/server/api/root";
import { createTRPCCallerFactory } from "~/server/api/trpc";
import { authPages } from "~/utils/auth";

interface Params extends ParsedUrlQuery {
	token: string;
	email: string;
}

export default function AcceptInvite() {
	return null;
}

export const getServerSideProps = (async (context) => {
	const { token, email } = context.query as Params;

	const redirect: Redirect = {
		destination: "/",
		permanent: false,
	};

	if (
		!token ||
		typeof token !== "string" ||
		!email ||
		typeof email !== "string"
	)
		return { redirect };

	const payload = await getPayloadClient({
		seed: false,
	});

	const session = await authPages.api.getSession({
		headers: context.req.headers as HeadersInit,
	});

	const createCaller = createTRPCCallerFactory(appRouter);

	const caller = createCaller({
		payload,
		session,
		req: context.req as NextApiRequest,
	});

	const userExist = await payload.find({
		collection: "users",
		where: { email: { equals: email } },
		limit: 1,
	});

	if (
		userExist.totalDocs === 0 ||
		(userExist.totalDocs === 1 && session === null)
	) {
		const callback = await authPages.api.signInWithOAuth2({
			body: {
				providerId: "proconnect",
				callbackURL: `/accept-invite?token=${token}&email=${email}`,
				errorCallbackURL: "/",
			},
			headers: context.req.headers as HeadersInit,
			returnHeaders: true,
		});

		context.res.setHeader(
			"Set-Cookie",
			callback.headers.get("set-cookie") ?? "",
		);

		const authUrl = new URL(callback.response.url);
		authUrl.searchParams.set("login_hint", email);

		return { redirect: { destination: authUrl.toString() } };
	}

	try {
		await caller.accessRight.validateInvite({ token });
		return { redirect };
	} catch (error) {
		console.error("Error validating invite:", error);
		return { redirect };
	}
}) as GetServerSideProps;
