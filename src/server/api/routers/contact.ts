import { contactDraft } from "~/forms/contact/contactSchema";
import { createTRPCRouter } from "../trpc";
import { librarySectionUpsert } from "./librarySection";

export const contactRouter = createTRPCRouter({
	upsert: librarySectionUpsert("contact", contactDraft),
});
