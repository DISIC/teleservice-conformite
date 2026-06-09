import { useMemo } from "react";
import { EntityLibraryPickerSlot } from "~/components/declaration/EntityLibraryPicker";
import { api } from "~/lib/api";
import { useEntityLibraryLink } from "~/utils/declaration/useEntityLibraryLink";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/forms/context";
import { SchemaForm as DeclarationSchemaForm } from "~/forms/schema/schemaForm";
import {
	declarationToSchemaValues,
	schemaFormOptions,
	type ZSchema,
} from "~/forms/schema/schemaSchema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";
import { logMutationError } from "~/utils/declaration-helper";
import type { SectionRenderProps } from "../Content";

export function SchemaSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
	mode,
}: SectionRenderProps) {
	const hasSchema = !!declaration.schema;

	const libraryLink = useEntityLibraryLink({ kind: "schemas", declaration });

	const { mutateAsync: upsertSchema, isPending } =
		api.schema.upsert.useMutation({
			onSuccess: async ({ data: schema }) => {
				libraryLink.refetch();
				onDeclarationChange((prev) => ({ ...prev, schema }));
			},
			onError: logMutationError("upserting schema", declaration.id),
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

	return (
		<Frame
			form={form}
			before={
				<EntityLibraryPickerSlot link={libraryLink} readOnly={readOnly} />
			}
		>
			<DeclarationSchemaForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
