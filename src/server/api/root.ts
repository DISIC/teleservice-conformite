import { createTRPCRouter } from "~/server/api/trpc";
import { accessRightRouter } from "./routers/accesRight";
import { albertRouter } from "./routers/albert";
import { auditRouter } from "./routers/audit";
import { contactRouter } from "./routers/contact";
import { declarationRouter } from "./routers/declaration";
import { schemaRouter } from "./routers/schema";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	declaration: declarationRouter,
	audit: auditRouter,
	contact: contactRouter,
	schema: schemaRouter,
	albert: albertRouter,
	accessRight: accessRightRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
// export const createCaller = createCallerFactory(appRouter);
