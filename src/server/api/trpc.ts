import { initTRPC, TRPCError } from "@trpc/server";
/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "~/utils/auth";
import getPayloadClient from "../../payload/payloadClient";

export type BetterAuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
	const payload = await getPayloadClient({
		seed: false,
	});

	// Retrieve Better Auth session from incoming request headers
	const session = await auth.api.getSession({
		headers: new Headers(_opts.req.headers as HeadersInit),
	});

	return {
		payload,
		session,
		req: _opts.req,
	};
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});

const isAuthedAsUser = t.middleware(async ({ next, ctx }) => {
	const userId = Number(ctx.session?.user?.id);

	if (!userId || !ctx.session) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "Missing or invalid session",
		});
	}

	const user = await ctx.payload.findByID({
		collection: "users",
		id: userId,
	});

	if (!user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "User not found",
		});
	}

	return next({
		ctx: { session: ctx.session },
	});
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

export const userProtectedProcedure = t.procedure.use(isAuthedAsUser);
