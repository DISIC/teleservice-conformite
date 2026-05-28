import { useMemo } from "react";
import EntityLibraryPicker from "~/components/declaration/EntityLibraryPicker";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import { useEntityLibraryLink } from "~/utils/declaration/useEntityLibraryLink";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/forms/context";
import { ContactTypeForm } from "~/forms/contact/contactForm";
import {
	contactFormOptions,
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
};

export function ContactSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
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

	const { readOnly, exitEdit, Frame } = useSectionForm({
		title: SECTION_TITLES.contact,
		declaration,
		isEditable: hasContact,
		isSaving: isPending,
		prevHref,
		nextHref,
	});

	const defaultValues: ZContactForm = useMemo(() => {
		if (!declaration.contact) return contactFormOptions.defaultValues;
		return {
			name: declaration.contact.name ?? "",
			url: declaration.contact.url ?? "",
			email: declaration.contact.email ?? "",
		};
	}, [declaration.contact]);

	const form = useAppForm({
		...contactFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsertContact({
				values: value,
				id: declaration.contact?.id,
				declarationId: declaration.id,
			});
			exitEdit();
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
