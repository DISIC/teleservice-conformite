import { formOptions } from "@tanstack/react-form";
import z from "zod";
import type { Contact } from "~/payload/payload-types";

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
		onSubmit: ({ formApi }) => formApi.parseValuesWithSchema(contactForm),
	},
});
