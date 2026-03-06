import { formOptions } from "@tanstack/react-form";
import z from "zod";
import type { Contact } from "~/payload/payload-types";

export const contact = z.object({
	url: z.url("Lien invalide (ex: https://www.example.fr)").or(z.literal("")),
	email: z.email("Email invalide").or(z.literal("")),
}) satisfies z.ZodType<
	Omit<Contact, "id" | "declaration" | "toVerify" | "createdAt" | "updatedAt">
>;

export type ZContact = z.infer<typeof contact>;

export const contactForm = contact
	.extend({
		contactType: z
			.array(z.enum(["onlineForm", "contactPoint"]))
			.min(1, "Sélectionnez au moins une option"),
	})
	.superRefine((data, ctx) => {
		if (data.contactType.includes("onlineForm") && !data.url) {
			ctx.addIssue({
				code: "custom",
				message: "L'URL du formulaire en ligne est requise",
				path: ["url"],
			});
		}
		if (data.contactType.includes("contactPoint") && !data.email) {
			ctx.addIssue({
				code: "custom",
				message: "L'email de contact est requis",
				path: ["email"],
			});
		}
	});

export type ZContactForm = z.infer<typeof contactForm>;

export const contactDefaultValues: ZContactForm = {
	contactType: [],
	url: "",
	email: "",
};

export const contactFormOptions = formOptions({
	defaultValues: contactDefaultValues,
	validators: {
		onSubmit: ({ formApi }) => formApi.parseValuesWithSchema(contactForm),
	},
});
