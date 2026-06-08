import { useMemo } from "react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/lib/api";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/forms/context";
import { DeclarationGeneralForm } from "~/forms/declaration/declarationForm";
import {
	declarationMultiStepFormOptions,
	type ZDeclarationMultiStepFormSchema,
} from "~/forms/declaration/declarationSchema";
import { useSectionForm } from "~/utils/declaration/useSectionForm";

type InfosSectionProps = {
	declaration: PopulatedDeclaration;
	onDeclarationChange: (
		updater: (prev: PopulatedDeclaration) => PopulatedDeclaration,
	) => void;
	prevHref: string | null;
	nextHref: string | null;
};

export function InfosSection({
	declaration,
	onDeclarationChange,
	prevHref,
	nextHref,
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

	const { readOnly, exitEdit, Frame } = useSectionForm({
		title: SECTION_TITLES.infos,
		declaration,
		isEditable: true,
		initialReadOnly: true,
		isSaving: isPending,
		prevHref,
		nextHref,
	});

	const defaultValues: ZDeclarationMultiStepFormSchema = useMemo(
		() => ({
			section: "general",
			initialDeclaration: {},
			general: {
				organisation: declaration.entity?.name ?? "",
				kind: declaration.app_kind,
				mobilePlatform: declaration.mobile_platform ?? undefined,
				name: declaration.name ?? "",
				url: declaration.url ?? "",
				domain: declaration.entity?.kind ?? "",
			},
		}),
		[declaration],
	);

	const form = useAppForm({
		...declarationMultiStepFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await update({
				general: {
					...value.general,
					declarationId: declaration.id,
					entityId: declaration.entity?.id ?? -1,
				},
			});
			exitEdit();
		},
	});

	return (
		<Frame form={form}>
			<DeclarationGeneralForm form={form} readOnly={readOnly} />
		</Frame>
	);
}
