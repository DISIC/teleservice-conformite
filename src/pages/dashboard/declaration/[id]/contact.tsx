import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import EntityLibraryPicker from "~/components/declaration/EntityLibraryPicker";
import { useCommonStyles } from "~/components/style/commonStyles";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { ContactTypeForm } from "~/utils/form/contact/form";
import {
	contactFormOptions,
	type ZContactForm,
} from "~/utils/form/contact/schema";
import { useAppForm } from "~/utils/form/context";
import { guardDeclaration } from "~/utils/server-guards";

export default function ContactPage({
	declaration: initialDeclaration,
}: {
	declaration: PopulatedDeclaration;
}) {
	const { classes: commonClasses } = useCommonStyles();
	const { push, reload } = useRouter();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [readOnly, setReadOnly] = useState(!!declaration?.contact);

	const onEditInfos = () => {
		if (!readOnly) form.reset();
		setReadOnly((prev) => !prev);
	};

	const { data: libraryItems = [], refetch: refetchLibrary } =
		api.entityLibrary.listContacts.useQuery(
			{ entityId: Number(declaration.entity?.id) },
			{ enabled: !!declaration.entity?.id },
		);

	const { mutateAsync: upsertContact } = api.contact.upsert.useMutation({
		onSuccess: ({ data }) => {
			refetchLibrary();
			if (!declaration.contact) {
				const isComplete = declaration.audit && declaration.schema;
				push(
					`/dashboard/declaration/${declaration.id}${isComplete ? "/preview" : ""}`,
				);
			} else {
				setDeclaration((prev) => ({ ...prev, contact: data }));
				setReadOnly(true);
			}
		},
		onError: (error) => console.error("Error upserting contact:", error),
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
					Contact - Déclaration de {declaration.name} - Téléservice Conformité
				</title>
			</Head>
			<DeclarationForm
				declaration={declaration}
				title="Contact"
				breadcrumbLabel={declaration?.name ?? ""}
				isEditable={!!declaration?.contact}
				readOnly={readOnly}
				onToggleEdit={onEditInfos}
				isAiGenerated={
					declaration.contact?.toVerify && declaration.fromSource === "ai"
				}
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
					<form.AppForm>
						<div className={commonClasses.actionButtonsContainer}>
							<form.CancelButton
								label="Retour"
								ariaLabel="Retour à la déclaration"
								onClick={() => push(`/dashboard/declaration/${declaration.id}`)}
								priority="tertiary"
							/>
							{!readOnly && (
								<form.SubscribeButton
									label={
										declaration.contact?.toVerify
											? "Valider les informations"
											: "Valider"
									}
									iconId="fr-icon-check-line"
									iconPosition="right"
								/>
							)}
						</div>
					</form.AppForm>
				</form>
			</DeclarationForm>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) =>
	guardDeclaration(context);
