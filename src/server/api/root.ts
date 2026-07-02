import { createTRPCRouter } from "~/server/api/trpc";
import { accessRightRouter } from "./routers/accessRight";
import { albertRouter } from "./routers/albert";
import { auditRouter } from "./routers/audit";
import { declarationRouter } from "./routers/declaration";
import { contactRouter, libraryRouter, schemaRouter } from "./routers/library";

export const appRouter = createTRPCRouter({
	declaration: declarationRouter,
	audit: auditRouter,
	contact: contactRouter,
	schema: schemaRouter,
	library: libraryRouter,
	albert: albertRouter,
	accessRight: accessRightRouter,
});

export type AppRouter = typeof appRouter;
