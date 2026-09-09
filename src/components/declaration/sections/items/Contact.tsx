import type { ComponentProps } from "react";
import { api } from "~/lib/api";
import { ContactTypeForm } from "~/forms/contact/contactForm";
import {
	contactForm,
	declarationToContactValues,
	type ZContactForm,
} from "~/forms/contact/contactSchema";
import { SECTION_TITLES } from "~/domain/declaration/sections";
import { applySavedDeclaration } from "~/components/declaration/sections/applySavedDeclaration";
import { logMutationError } from "~/components/declaration/logMutationError";
import type { SectionRenderProps } from "../Content";
import { SourceModeSection, type SourceModeOption } from "../SourceModeSection";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import Avatar from "@codegouvfr/react-dsfr/picto/Avatar";

type ContactSectionProps = SectionRenderProps & {
	/** Flips the page's "publish attempted" flag (terminal Section only). */
	onPublishAttempt: () => void;
};

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

export function ContactSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
	mode,
	onPublishAttempt,
}: ContactSectionProps) {
	const { mutateAsync: upsertContact, isPending } =
		api.contact.upsert.useMutation({
			onError: logMutationError("upserting contact", declaration.id),
		});
	const applyContact = applySavedDeclaration(onDeclarationChange);

	return (
		<SourceModeSection<ZContactForm, ContactFormApi>
			kind="contact"
			title={SECTION_TITLES.contact}
			legend="Renseigner un moyen de contact :"
			declaration={declaration}
			onDeclarationChange={onDeclarationChange}
			mode={mode}
			prevHref={prevHref}
			nextHref={nextHref}
			schema={contactForm}
			toValues={declarationToContactValues}
			commit={async (values) =>
				applyContact(
					await upsertContact({ values, declarationId: declaration.id }),
				)
			}
			isSaving={isPending}
			options={CONTACT_OPTIONS}
			renderForm={({ form, readOnly }) => (
				<ContactTypeForm form={form} readOnly={readOnly} />
			)}
			onPublishAttempt={onPublishAttempt}
		/>
	);
}
