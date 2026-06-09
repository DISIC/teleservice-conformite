import { useMemo } from "react";
import EntityLibraryPicker from "~/components/declaration/EntityLibraryPicker";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import { useEntityLibraryLink } from "~/utils/declaration/useEntityLibraryLink";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import type { EditingMode } from "~/utils/declaration/status";
import { useAppForm } from "~/forms/context";
import { ContactTypeForm } from "~/forms/contact/contactForm";
import {
	contactFormOptions,
	declarationToContactValues,
	type ZContactForm,
} from "~/forms/contact/contactSchema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";

type ContactSectionProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: (
		updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
	) => void;
	prevHref: string | null;
	nextHref: string | null;
	mode: EditingMode;
};

export function ContactSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
	mode,
}: ContactSectionProps) {
	const hasContact = !!declaration.contact;

	const libraryLink = useEntityLibraryLink({ kind: "contacts", declaration });

	const { mutateAsync: upsertContact, isPending } =
		api.contact.upsert.useMutation({
			onSuccess: ({ data: contact }) => {
				libraryLink.refetch();
				onDeclarationChange((prev) => ({ ...prev, contact }));
			},
			onError: (error) =>
				console.error(
					`Error upserting contact for declaration ${declaration.id}:`,
					error,
				),
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
			await upsertContact({
				values: value,
				id: declaration.contact?.id,
				declarationId: declaration.id,
			});
			afterSave();
		},
	});

	const libraryPicker = !readOnly && libraryLink.items.length > 0 && (
		<EntityLibraryPicker
			label={libraryLink.label}
			placeholder={libraryLink.placeholder}
			items={libraryLink.items}
			selectedId={libraryLink.selectedId}
			onSelect={libraryLink.onSelect}
		/>
	);

	return (
		<Frame form={form} before={libraryPicker}>
			<ContactTypeForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
