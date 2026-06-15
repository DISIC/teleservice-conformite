import { initTRPC, TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "~/lib/auth";
import getPayloadClient from "../../payload/payloadClient";

export type BetterAuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
	const payload = await getPayloadClient({
		seed: false,
	});

	const session = await auth.api.getSession({
		headers: new Headers(_opts.req.headers as HeadersInit),
	});

	return {
		payload,
		session,
		req: _opts.req,
	};
};

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

export const createTRPCCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const userProtectedProcedure = t.procedure.use(isAuthedAsUser);
