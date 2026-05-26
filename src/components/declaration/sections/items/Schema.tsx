import { useRouter } from "next/router";
import { useMemo } from "react";
import EntityLibraryPicker from "~/components/declaration/EntityLibraryPicker";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/utils/form/context";
import { SchemaForm as DeclarationSchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions, type ZSchema } from "~/utils/form/schema/schema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";

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
	const { reload } = useRouter();
	const hasSchema = !!declaration.schema;

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

	const { readOnly, exitEdit, Frame } = useSectionForm({
		title: SECTION_TITLES.schema,
		declaration,
		isEditable: hasSchema,
		isSaving: isPending,
		prevHref,
		nextHref,
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
			exitEdit();
		},
	});

	const libraryPicker = !readOnly && libraryItems.length > 0 && (
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
	);

	return (
		<Frame form={form} before={libraryPicker}>
			<DeclarationSchemaForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
