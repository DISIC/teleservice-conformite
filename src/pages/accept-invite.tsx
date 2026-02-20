import type { ParsedUrlQuery } from "node:querystring";
import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetServerSideProps, Redirect } from "next";
import SuperJSON from "superjson";
import getPayloadClient from "~/payload/payloadClient";
import { appRouter } from "~/server/api/root";
import { auth } from "~/utils/auth";

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
	) {
		return { redirect };
	}

	const payload = await getPayloadClient({
		seed: false,
	});

	const session = await auth.api.getSession({
		headers: context.req.headers as any,
	});

	const helpers = createServerSideHelpers({
		router: appRouter,
		ctx: { payload, session, req: context.req as any },
		transformer: SuperJSON,
	});

	const userExist = await payload.find({
		collection: "users",
		where: { email: { equals: email } },
		limit: 1,
	});

	if (userExist.totalDocs === 0) {
		const callback = await auth.api.signInWithOAuth2({
			body: {
				providerId: "proconnect",
				callbackURL: `/accept-invite?token=${token}&email=${email}`,
				errorCallbackURL: "/",
			},
			headers: context.req.headers as any,
			returnHeaders: true,
		});

		context.res.setHeader(
			"Set-Cookie",
			callback.headers.get("set-cookie") ?? "",
		);

		return { redirect: { destination: callback.response.url } };
	}

	try {
		await helpers.accessRight.validateInvite.fetch({ token });
		return { redirect };
	} catch (error) {
		console.error("Error validating invite:", error);
		return { redirect };
	}
}) as GetServerSideProps;
