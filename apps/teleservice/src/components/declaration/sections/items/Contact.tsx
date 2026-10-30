import MainSend from "@codegouvfr/react-dsfr/picto/MainSend";
import type { ComponentProps } from "react";
import DocumentUser from "~/components/ui/picto/DocumentUser";
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
		label: "Utiliser un point de contact existant",
		hintText: "Enregistré dans vos documents.",
		illustration: <DocumentUser fontSize="3rem" viewBox="0 0 56 56" />,
	},
	{
		value: "custom",
		label: "Définir un point de contact",
		illustration: <MainSend fontSize="3rem" />,
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
		legend: "Renseigner un point de contact :",
		hintText:
			"Un point de contact permet aux usagers de signaler un défaut d’accessibilité. Il sera affiché publiquement sur la déclaration d’accessibilité. Les voies de recours seront ajoutées automatiquement à la déclaration, vous n’avez rien à faire.",
		options: CONTACT_OPTIONS,
	},
});
