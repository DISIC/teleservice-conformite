import { useMemo } from "react";
import { LibraryPickerSlot } from "~/components/declaration/LibraryPicker";
import { api } from "~/lib/api";
import { useLibraryLink } from "~/utils/declaration/useLibraryLink";
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
	const hasSchema = !!declaration.schema?.name;
	const isLinked = declaration.schema?.parent != null;

	const libraryLink = useLibraryLink({ kind: "schema", declaration });

	const { mutateAsync: upsertSchema, isPending } =
		api.schema.upsert.useMutation({
			onSuccess: async ({ data: schema }) => {
				libraryLink.refetch();
				onDeclarationChange((prev) => ({ ...prev, schema }));
			},
			onError: logMutationError("upserting schema", declaration.id),
		});

	// Linked mode is read-only here (edits happen in the Library, then propagate);
	// the picker slot offers "Détacher" to switch to an editable custom copy.
	const { readOnly, afterSave, Frame } = useSectionForm({
		title: SECTION_TITLES.schema,
		declaration,
		isEditable: hasSchema && !isLinked,
		initialReadOnly: isLinked ? true : undefined,
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
				declarationId: declaration.id,
			});
			afterSave();
		},
	});

	return (
		<Frame
			form={form}
			before={<LibraryPickerSlot link={libraryLink} readOnly={readOnly} />}
		>
			<DeclarationSchemaForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
