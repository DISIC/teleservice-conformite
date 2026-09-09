import Avatar from "@codegouvfr/react-dsfr/picto/Avatar";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import type { ComponentProps } from "react";
import { ContactTypeForm } from "~/forms/contact/contactForm";
import {
	contactForm,
	declarationToContactValues,
	type ZContactForm,
} from "~/forms/contact/contactSchema";
import { api } from "~/lib/api";
import { defineSection, type SourceModeOption } from "../defineSection";

type ContactFormApi = ComponentProps<typeof ContactTypeForm>["form"];

const CONTACT_OPTIONS: SourceModeOption[] = [
	{
		value: "linked",
		label: "Utiliser un contact de ma bibliothèque",
		hintText: "Réutilise un contact enregistré, mis à jour automatiquement.",
		illustration: <DocumentSearch fontSize="3rem" />,
	},
	{
		value: "custom",
		label: "Définir un contact pour cette déclaration",
		hintText: "Renseignez un contact propre à cette déclaration.",
		illustration: <Avatar fontSize="3rem" />,
	},
];

export const contactSection = defineSection<ZContactForm, ContactFormApi>({
	slug: "contact",
	schema: contactForm,
	toValues: declarationToContactValues,
	useSave: (declaration, options) => {
		const { mutateAsync, isPending } = api.contact.upsert.useMutation(options);
		return {
			save: (values) => mutateAsync({ declarationId: declaration.id, values }),
			isPending,
		};
	},
	renderForm: ({ form, readOnly }) => (
		<ContactTypeForm form={form} readOnly={readOnly} />
	),
	library: {
		kind: "contact",
		legend: "Renseigner un moyen de contact :",
		options: CONTACT_OPTIONS,
	},
});
