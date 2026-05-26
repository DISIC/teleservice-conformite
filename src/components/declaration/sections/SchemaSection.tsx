import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import EntityLibraryPicker from "~/components/declaration/EntityLibraryPicker";
import { SectionShell } from "./SectionShell";
import { useCommonStyles } from "~/components/style/commonStyles";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/utils/form/context";
import { SchemaForm as DeclarationSchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions, type ZSchema } from "~/utils/form/schema/schema";

type SchemaSectionProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: (
		updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
	) => void;
	prevHref: string | null;
	nextHref: string | null;
};

export function SchemaSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
}: SchemaSectionProps) {
	const { classes: commonClasses } = useCommonStyles();
	const { reload } = useRouter();
	const hasSchema = !!declaration.schema;
	const [readOnly, setReadOnly] = useState(hasSchema);

	const { data: libraryItems = [], refetch: refetchLibrary } =
		api.entityLibrary.listSchemas.useQuery(
			{ entityId: Number(declaration.entity?.id) },
			{ enabled: !!declaration.entity?.id },
		);

	const { mutateAsync: upsertSchema, isPending } =
		api.schema.upsert.useMutation({
			onSuccess: async ({ data: schema }) => {
				refetchLibrary();
				onDeclarationChange((prev) => ({ ...prev, schema }));
				setReadOnly(true);
			},
			onError: (error) =>
				console.error(
					`Error upserting schema for declaration ${declaration.id}:`,
					error,
				),
		});

	const { mutateAsync: linkExisting } = api.schema.linkExisting.useMutation({
		onSuccess: async () => reload(),
	});

	const defaultValues: ZSchema = useMemo(() => {
		if (!declaration.schema) return schemaFormOptions.defaultValues;
		return {
			schemaName: declaration.schema.schemaName ?? "",
			schemaUrl: declaration.schema.schemaUrl ?? "",
			actionPlanUrls: (declaration.schema.actionPlanUrls ?? []).map((item) => ({
				name: item.name ?? "",
				url: item.url ?? "",
			})),
		};
	}, [declaration.schema]);

	const form = useAppForm({
		...schemaFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsertSchema({
				values: value,
				id: declaration.schema?.id,
				declarationId: declaration.id,
			});
		},
	});

	return (
		<>
			<Head>
				<title>
					{SECTION_TITLES.schema} - Déclaration de {declaration.name} -
					Téléservice Conformité
				</title>
			</Head>
			<SectionShell
				title={SECTION_TITLES.schema}
				isEditable={hasSchema}
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
						label="Utiliser un schéma existant de l'administration"
						placeholder="Sélectionner un schéma"
						items={libraryItems.map((s) => ({
							id: s.id,
							label: s.schemaName,
							hint: s.schemaUrl || "",
						}))}
						selectedId={declaration.schema?.id ?? null}
						onSelect={(id) =>
							linkExisting({ schemaId: id, declarationId: declaration.id })
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
						<DeclarationSchemaForm form={form} readOnly={readOnly} />
					</div>
				</form>
			</SectionShell>
		</>
	);
}
