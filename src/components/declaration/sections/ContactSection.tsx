import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import EntityLibraryPicker from "~/components/declaration/EntityLibraryPicker";
import { useCommonStyles } from "~/components/style/commonStyles";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/utils/form/context";
import { ContactTypeForm } from "~/utils/form/contact/form";
import {
	contactFormOptions,
	type ZContactForm,
} from "~/utils/form/contact/schema";
import { SectionShell } from "./SectionShell";

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
	const { classes: commonClasses } = useCommonStyles();
	const { reload } = useRouter();
	const hasContact = !!declaration.contact;
	const [readOnly, setReadOnly] = useState(hasContact);

	const { data: libraryItems = [], refetch: refetchLibrary } =
		api.entityLibrary.listContacts.useQuery(
			{ entityId: Number(declaration.entity?.id) },
			{ enabled: !!declaration.entity?.id },
		);

	const { mutateAsync: upsertContact, isPending } =
		api.contact.upsert.useMutation({
			onSuccess: ({ data: contact }) => {
				refetchLibrary();
				onDeclarationChange((prev) => ({ ...prev, contact }));
				setReadOnly(true);
			},
			onError: (error) =>
				console.error(
					`Error upserting contact for declaration ${declaration.id}:`,
					error,
				),
		});

	const { mutateAsync: linkExisting } = api.contact.linkExisting.useMutation({
		onSuccess: async () => reload(),
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
		onSubmit: async ({ value }) =>
			await upsertContact({
				values: value,
				id: declaration.contact?.id,
				declarationId: declaration.id,
			}),
	});

	const currentContactEntityId =
		declaration.contact?.entity &&
		typeof declaration.contact.entity === "object"
			? declaration.contact.entity.id
			: typeof declaration.contact?.entity === "number"
				? declaration.contact.entity
				: null;

	return (
		<>
			<Head>
				<title>
					{SECTION_TITLES.contact} - Déclaration de {declaration.name} -
					Téléservice Conformité
				</title>
			</Head>
			<SectionShell
				title={SECTION_TITLES.contact}
				isEditable={hasContact}
				readOnly={readOnly}
				onEnterEdit={() => setReadOnly(false)}
				onCancelEdit={() => {
					form.reset();
					setReadOnly(true);
				}}
				onSave={() => form.handleSubmit()}
				isSaving={isPending}
				prevHref={prevHref}
				nextHref={nextHref}
			>
				{!readOnly && libraryItems.length > 0 && (
					<EntityLibraryPicker
						label="Utiliser un contact existant de l'administration"
						placeholder="Sélectionner un contact"
						items={libraryItems.map((c) => ({
							id: c.id,
							label: c.name,
							hint: c.email || c.url || "",
						}))}
						selectedId={
							currentContactEntityId ? (declaration.contact?.id ?? null) : null
						}
						onSelect={(id) =>
							linkExisting({ contactId: id, declarationId: declaration.id })
						}
					/>
				)}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					onInvalid={() => form.validate("submit")}
				>
					<div className={commonClasses.whiteBackground}>
						<ContactTypeForm form={form} readOnly={readOnly} />
					</div>
				</form>
			</SectionShell>
		</>
	);
}
