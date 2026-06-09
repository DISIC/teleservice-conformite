import { useMemo } from "react";
import { api } from "~/lib/api";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/forms/context";
import { DeclarationGeneralForm } from "~/forms/declaration/declarationForm";
import {
	declarationGeneralFormOptions,
	declarationToGeneralValues,
	type ZDeclarationGeneral,
} from "~/forms/declaration/declarationSchema";
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
	const { mutateAsync: update, isPending } = api.declaration.update.useMutation(
		{
			onSuccess: ({ data }) =>
				onDeclarationChange((prev) => ({ ...prev, ...data })),
			onError: logMutationError("updating declaration", declaration.id),
		},
	);

	const { readOnly, afterSave, Frame } = useSectionForm({
		title: SECTION_TITLES.infos,
		declaration,
		isEditable: true,
		initialReadOnly: true,
		isSaving: isPending,
		prevHref,
		nextHref,
		mode,
	});

	const defaultValues: ZDeclarationGeneral = useMemo(
		() => declarationToGeneralValues(declaration),
		[declaration],
	);

	const form = useAppForm({
		...declarationGeneralFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await update({
				general: {
					...value.general,
					declarationId: declaration.id,
					entityId: declaration.entity?.id ?? -1,
				},
			});
			afterSave();
		},
	});

	return (
		<Frame form={form}>
			<DeclarationGeneralForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
