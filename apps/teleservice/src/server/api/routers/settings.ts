import { createTRPCRouter, publicProcedure } from "../trpc";

export const settingsRouter = createTRPCRouter({
	faq: publicProcedure.query(async ({ ctx }) => {
		const settings = await ctx.payload.findGlobal({ slug: "settings" });
		return settings.faq ?? [];
	}),
});
