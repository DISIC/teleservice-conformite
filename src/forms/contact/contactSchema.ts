import { formOptions } from "@tanstack/react-form";
import z from "zod";
import type { Contact } from "~/payload/payload-types";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

/** The contact field set with loose leaves — the single source of truth for
 *  which fields exist. Strict rules layer on top (`contact`); the autosave
 *  draft (`contactDraft`) loosens them. */
const contactFields = z.object({
	name: z.string(),
	url: z.string(),
	email: z.string(),
});

export const contact = contactFields.superRefine((data, ctx) => {
	if (!data.name)
		ctx.addIssue({
			code: "custom",
			path: ["name"],
			message: "Le nom du contact est requis",
		});
	if (data.url && !z.url().safeParse(data.url).success)
		ctx.addIssue({
			code: "custom",
			path: ["url"],
			message: "Lien invalide (ex: https://www.example.fr)",
		});
	if (data.email && !z.email().safeParse(data.email).success)
		ctx.addIssue({
			code: "custom",
			path: ["email"],
			message: "Email invalide",
		});
	if (!data.url && !data.email) {
		ctx.addIssue({
			code: "custom",
			message: "Renseignez au moins un email ou une URL de formulaire",
			path: ["email"],
		});
		ctx.addIssue({
			code: "custom",
			message: "Renseignez au moins un email ou une URL de formulaire",
			path: ["url"],
		});
	}
}) satisfies z.ZodType<
	Omit<Contact, "id" | "user" | "createdAt" | "updatedAt">
>;

/** Lenient autosave input: the contact field set with no required/format rules,
 *  so sequential autosave persists partial, in-progress values. Completeness is
 *  re-checked by `contact` at the publish gate. */
export const contactDraft = contactFields.partial();

export type ZContact = z.infer<typeof contact>;

export const contactForm = contact;

export type ZContactForm = z.infer<typeof contactForm>;

export const contactDefaultValues: ZContactForm = {
	name: "",
	url: "",
	email: "",
};

export const contactFormOptions = formOptions({
	defaultValues: contactDefaultValues,
	validators: {
		onChange: ({ formApi }) => formApi.parseValuesWithSchema(contactForm),
		onSubmit: ({ formApi }) => formApi.parseValuesWithSchema(contactForm),
	},
});

/** Maps a persisted declaration to this form's values. Keep in sync with the
 *  schema above so the publish gate validates the exact shape the form feeds. */
export function declarationToContactValues(
	declaration: PopulatedDeclaration,
): ZContactForm {
	if (!declaration.contact) return contactDefaultValues;
	return {
		name: declaration.contact.name ?? "",
		url: declaration.contact.url ?? "",
		email: declaration.contact.email ?? "",
	};
}
