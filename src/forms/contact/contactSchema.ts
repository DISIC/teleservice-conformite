import { formOptions } from "@tanstack/react-form";
import z from "zod";
import type { Contact } from "~/payload/payload-types";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export const contact = z
	.object({
		name: z.string().min(1, "Le nom du contact est requis"),
		url: z.url("Lien invalide (ex: https://www.example.fr)").or(z.literal("")),
		email: z.email("Email invalide").or(z.literal("")),
	})
	.superRefine((data, ctx) => {
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
	Omit<Contact, "id" | "entity" | "toVerify" | "createdAt" | "updatedAt">
>;

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
