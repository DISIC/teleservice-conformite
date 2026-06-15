import { useMemo } from "react";
import { LibraryPickerSlot } from "~/components/declaration/LibraryPicker";
import { api } from "~/lib/api";
import { useLibraryLink } from "~/utils/declaration/useLibraryLink";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { usePublishAttempt } from "~/utils/declaration/usePublishAttempt";
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
	const hasContact = !!declaration.contact?.name;
	const isLinked = declaration.contact?.parent != null;

	const libraryLink = useLibraryLink({ kind: "contact", declaration });

	const { attemptPublish } = usePublishAttempt({
		declaration,
		onPublishAttempt,
	});

	const { mutateAsync: upsertContact, isPending } =
		api.contact.upsert.useMutation({
			onSuccess: ({ data: contact }) => {
				libraryLink.refetch();
				onDeclarationChange((prev) => ({ ...prev, contact }));
			},
			onError: logMutationError("upserting contact", declaration.id),
		});

	// Linked mode is read-only here (edits happen in the Library, then propagate);
	// the picker slot offers "Détacher" to switch to an editable custom copy.
	const { readOnly, afterSave, Frame } = useSectionForm({
		title: SECTION_TITLES.contact,
		declaration,
		isEditable: hasContact && !isLinked,
		initialReadOnly: isLinked ? true : undefined,
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
				declarationId: declaration.id,
			});

			// Standalone: just exit edit mode. Sequential: Contact is the terminal
			// Section, so its save runs the declaration-wide publish gate against
			// the freshly-upserted contact.
			if (mode !== "sequential") {
				afterSave();
				return;
			}

			attemptPublish({ contact });
		},
	});

	return (
		<Frame
			form={form}
			before={<LibraryPickerSlot link={libraryLink} readOnly={readOnly} />}
		>
			<ContactTypeForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
