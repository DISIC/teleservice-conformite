import { formOptions } from "@tanstack/react-form";
import z from "zod";

export const contact = z.object({
	contactType: z.array(z.string()),
	contactLink: z
		.url("Lien invalide (ex: https://www.example.fr)")
		.optional()
		.or(z.literal("")),
	emailContact: z.email("Email invalide").or(z.literal("")),
});

export type ZContact = z.infer<typeof contact>;

export const contactDefaultValues: ZContact = {
	contactType: [],
	contactLink: undefined,
	emailContact: "",
};

export const contactFormOptions = formOptions({
	defaultValues: contactDefaultValues,
	validators: {
		onSubmit: ({ value, formApi }) => {
			return formApi.parseValuesWithSchema(contact as typeof contact);
		},
	},
});
