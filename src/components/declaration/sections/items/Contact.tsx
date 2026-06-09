import { useRouter } from "next/router";
import { useMemo } from "react";
import { EntityLibraryPickerSlot } from "~/components/declaration/EntityLibraryPicker";
import { api } from "~/lib/api";
import { useEntityLibraryLink } from "~/utils/declaration/useEntityLibraryLink";
import { SECTION_TITLES, sectionHref } from "~/utils/declaration/sections";
import { validateDeclaration } from "~/utils/declaration/validateDeclaration";
import { useAppForm } from "~/forms/context";
import { ContactTypeForm } from "~/forms/contact/contactForm";
import {
	contactFormOptions,
	declarationToContactValues,
	type ZContactForm,
} from "~/forms/contact/contactSchema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";
import { logMutationError } from "~/utils/declaration-helper";
import type { SectionRenderProps } from "../Content";

type ContactSectionProps = SectionRenderProps & {
	/** Flips the page's "publish attempted" flag (terminal Section only). */
	onPublishAttempt: () => void;
};

export function ContactSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
	mode,
	onPublishAttempt,
}: ContactSectionProps) {
	const router = useRouter();
	const hasContact = !!declaration.contact;

	const libraryLink = useEntityLibraryLink({ kind: "contacts", declaration });

	const { mutateAsync: upsertContact, isPending } =
		api.contact.upsert.useMutation({
			onSuccess: ({ data: contact }) => {
				libraryLink.refetch();
				onDeclarationChange((prev) => ({ ...prev, contact }));
			},
			onError: logMutationError("upserting contact", declaration.id),
		});

	const { readOnly, afterSave, Frame } = useSectionForm({
		title: SECTION_TITLES.contact,
		declaration,
		isEditable: hasContact,
		isSaving: isPending,
		prevHref,
		nextHref,
		mode,
	});

	const defaultValues: ZContactForm = useMemo(
		() => declarationToContactValues(declaration),
		[declaration],
	);

	const form = useAppForm({
		...contactFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			const { data: contact } = await upsertContact({
				values: value,
				id: declaration.contact?.id,
				declarationId: declaration.id,
			});

			// Standalone: just exit edit mode. Sequential: Contact is the terminal
			// Section, so its save runs the declaration-wide publish gate.
			if (mode !== "sequential") {
				afterSave();
				return;
			}

			onPublishAttempt();
			const [firstError] = validateDeclaration({ ...declaration, contact });
			if (!firstError) {
				router.push(`/dashboard/declarations/${declaration.id}/preview`);
				return;
			}
			router.push(
				sectionHref(declaration.id, firstError.section, firstError.field),
				undefined,
				{ shallow: true, scroll: false },
			);
		},
	});

	return (
		<Frame
			form={form}
			before={
				<EntityLibraryPickerSlot link={libraryLink} readOnly={readOnly} />
			}
		>
			<ContactTypeForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
