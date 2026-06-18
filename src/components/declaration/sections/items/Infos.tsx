import { useMemo } from "react";
import { useStore } from "@tanstack/react-form";
import { api } from "~/lib/api";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/forms/context";
import { changeFormOptions, submitFormOptions } from "~/forms/formOptions";
import { DeclarationGeneralForm } from "~/forms/declaration/declarationForm";
import {
	declarationGeneralRefined,
	declarationToGeneralValues,
	type ZDeclarationGeneral,
} from "~/forms/declaration/declarationSchema";
import { useAutosave } from "~/utils/declaration/useAutosave";
import { useSectionForm } from "~/utils/declaration/useSectionForm";
import { logMutationError } from "~/utils/declaration-helper";
import type { SectionRenderProps } from "../Content";

export function InfosSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
	mode,
}: SectionRenderProps) {
	const isSequential = mode === "sequential";
	const { mutateAsync: update, isPending } = api.declaration.update.useMutation(
		{
			onSuccess: ({ data }) =>
				onDeclarationChange((prev) => ({ ...prev, ...data })),
			onError: logMutationError("updating declaration", declaration.id),
		},
	);

	const { readOnly, afterSave, Frame } = useSectionForm({
		title: SECTION_TITLES.infos,
		isEditable: true,
		initialReadOnly: true,
		// Sequential mode autosaves silently — no pending indicator.
		isSaving: isSequential ? false : isPending,
		prevHref,
		nextHref,
		mode,
	});

	const defaultValues = useMemo(
		() => declarationToGeneralValues(declaration),
		[declaration],
	);

	const save = (value: ZDeclarationGeneral) =>
		update({
			general: {
				...value.general,
				declarationId: declaration.id,
				entityId: declaration.entity?.id ?? -1,
			},
		});

	const form = useAppForm({
		...(isSequential
			? changeFormOptions(defaultValues, declarationGeneralRefined)
			: submitFormOptions(defaultValues, declarationGeneralRefined)),
		onSubmit: async ({ value }) => {
			await save(value);
			afterSave();
		},
	});

	const values = useStore(form.store, (state) => state.values);
	useAutosave({ enabled: isSequential, values, save });

	return (
		<Frame form={form}>
			<DeclarationGeneralForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
