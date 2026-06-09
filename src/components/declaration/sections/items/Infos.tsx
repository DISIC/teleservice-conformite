import { useMemo } from "react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import type { EditingMode } from "~/utils/declaration/status";
import { useAppForm } from "~/forms/context";
import { DeclarationGeneralForm } from "~/forms/declaration/declarationForm";
import {
	declarationGeneralFormOptions,
	declarationToGeneralValues,
	type ZDeclarationGeneral,
} from "~/forms/declaration/declarationSchema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";

type InfosSectionProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: (
		updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
	) => void;
	prevHref: string | null;
	nextHref: string | null;
	mode: EditingMode;
};

export function InfosSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
	mode,
}: InfosSectionProps) {
	const { mutateAsync: update, isPending } = api.declaration.update.useMutation(
		{
			onSuccess: ({ data }) =>
				onDeclarationChange((prev) => ({ ...prev, ...data })),
			onError: (error) =>
				console.error(
					`Error updating declaration with id ${declaration.id}:`,
					error,
				),
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
