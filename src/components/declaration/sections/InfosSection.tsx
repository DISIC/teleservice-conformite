import Head from "next/head";
import { useMemo, useState } from "react";
import { SectionShell } from "~/components/declaration/SectionShell";
import { useCommonStyles } from "~/components/style/commonStyles";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { SECTION_TITLES } from "~/utils/declaration/sections";
import { useAppForm } from "~/utils/form/context";
import { DeclarationGeneralForm } from "~/utils/form/declaration/form";
import {
	declarationMultiStepFormOptions,
	type ZDeclarationMultiStepFormSchema,
} from "~/utils/form/declaration/schema";

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
	const { classes: commonClasses } = useCommonStyles();
	const [readOnly, setReadOnly] = useState(true);

	const { mutateAsync: update, isPending } = api.declaration.update.useMutation(
		{
			onSuccess: ({ data }) => {
				onDeclarationChange((prev) => ({ ...prev, ...data }));
				setReadOnly(true);
			},
			onError: (error) =>
				console.error(
					`Error updating declaration with id ${declaration.id}:`,
					error,
				),
		},
	);

	const defaultValues: ZDeclarationMultiStepFormSchema = useMemo(
		() => ({
			section: "general",
			initialDeclaration: {},
			general: {
				organisation: declaration.entity?.name ?? "",
				kind: declaration.app_kind,
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
		},
	});

	return (
		<>
			<Head>
				<title>
					{SECTION_TITLES.infos} - Déclaration de {declaration.name} -
					Téléservice Conformité
				</title>
			</Head>
			<SectionShell
				title={SECTION_TITLES.infos}
				isEditable
				readOnly={readOnly}
				onEnterEdit={() => setReadOnly(false)}
				onCancelEdit={() => {
					form.reset();
					setReadOnly(true);
				}}
				onSave={() => form.handleSubmit()}
				isSaving={isPending}
				prevHref={prevHref}
				nextHref={nextHref}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					onInvalid={() => form.validate("submit")}
				>
					<div className={commonClasses.whiteBackground}>
						<DeclarationGeneralForm form={form} readOnly={readOnly} />
					</div>
				</form>
			</SectionShell>
		</>
	);
}
