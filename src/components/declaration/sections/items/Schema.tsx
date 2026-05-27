import { useMemo } from "react";
import EntityLibraryPicker from "~/components/declaration/EntityLibraryPicker";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { useEntityLibraryLink } from "~/utils/declaration/useEntityLibraryLink";
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
	const hasSchema = !!declaration.schema;

	const libraryLink = useEntityLibraryLink({ kind: "schemas", declaration });

	const { mutateAsync: upsertSchema, isPending } =
		api.schema.upsert.useMutation({
			onSuccess: async ({ data: schema }) => {
				libraryLink.refetch();
				onDeclarationChange((prev) => ({ ...prev, schema }));
			},
			onError: (error) =>
				console.error(
					`Error upserting schema for declaration ${declaration.id}:`,
					error,
				),
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
			<DeclarationSchemaForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
