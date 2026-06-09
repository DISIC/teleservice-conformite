import { useMemo } from "react";
import EntityLibraryPicker from "~/components/declaration/EntityLibraryPicker";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import { useEntityLibraryLink } from "~/utils/declaration/useEntityLibraryLink";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import type { EditingMode } from "~/utils/declaration/status";
import { useAppForm } from "~/forms/context";
import { SchemaForm as DeclarationSchemaForm } from "~/forms/schema/schemaForm";
import {
	declarationToSchemaValues,
	schemaFormOptions,
	type ZSchema,
} from "~/forms/schema/schemaSchema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";

type SchemaSectionProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: (
		updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
	) => void;
	prevHref: string | null;
	nextHref: string | null;
	mode: EditingMode;
};

export function SchemaSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
	mode,
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

	const { readOnly, afterSave, Frame } = useSectionForm({
		title: SECTION_TITLES.schema,
		declaration,
		isEditable: hasSchema,
		isSaving: isPending,
		prevHref,
		nextHref,
		mode,
	});

	const defaultValues: ZSchema = useMemo(
		() => declarationToSchemaValues(declaration),
		[declaration],
	);

	const form = useAppForm({
		...schemaFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsertSchema({
				values: value,
				id: declaration.schema?.id,
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
			<DeclarationSchemaForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
