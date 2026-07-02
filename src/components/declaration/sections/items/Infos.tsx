import { useMemo } from "react";
import { api } from "~/lib/api";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/forms/context";
import { sectionFormOptions } from "~/forms/formOptions";
import { DeclarationGeneralForm } from "~/forms/declaration/declarationForm";
import {
	declarationGeneralRefined,
	declarationToGeneralValues,
	type ZDeclarationGeneral,
} from "~/forms/declaration/declarationSchema";
import { useLiveSectionForm } from "~/utils/declaration/useLiveSectionForm";
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
		...sectionFormOptions(
			isSequential,
			defaultValues,
			declarationGeneralRefined,
		),
		onSubmit: async ({ value }) => {
			await save(value);
			afterSave();
		},
	});

	useLiveSectionForm(form, { mode, save });

	return (
		<Frame form={form}>
			<DeclarationGeneralForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
