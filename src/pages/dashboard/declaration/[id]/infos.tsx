import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import { useCommonStyles } from "~/components/style/commonStyles";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";
import { DeclarationGeneralForm } from "~/utils/form/declaration/form";
import {
	declarationMultiStepFormOptions,
	type ZDeclarationMultiStepFormSchema,
} from "~/utils/form/declaration/schema";
import { guardDeclaration } from "~/utils/server-guards";

export default function GeneralInformationsPage({
	declaration: initialDeclaration,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();
	const { classes: commonClasses } = useCommonStyles();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [readOnly, setReadOnly] = useState(true);

	const onEditInfos = () => {
		if (!readOnly) form.reset();
		setReadOnly((prev) => !prev);
	};

	const { mutateAsync: update } = api.declaration.update.useMutation({
		onSuccess: ({ data }) => {
			setDeclaration((prev) => ({ ...prev, ...data }));
			setReadOnly(true);
		},
		onError: (error) =>
			console.error(
				`Error updating declaration with id ${declaration?.id}:`,
				error,
			),
	});

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
					Informations générales - Déclaration de {declaration.name} -
					Téléservice Conformité
				</title>
			</Head>
			<DeclarationForm
				declaration={declaration}
				title="Informations générales"
				breadcrumbLabel={declaration?.name ?? ""}
				isEditable
				readOnly={readOnly}
				onToggleEdit={onEditInfos}
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
					<form.AppForm>
						<div className={commonClasses.actionButtonsContainer}>
							<form.CancelButton
								label="Retour"
								ariaLabel="Retour à la déclaration"
								onClick={() =>
									router.push(`/dashboard/declaration/${declaration.id}`)
								}
								priority="tertiary"
							/>
							{!readOnly && (
								<form.SubscribeButton
									label="Valider"
									iconId="fr-icon-check-line"
									iconPosition="right"
								/>
							)}
						</div>
					</form.AppForm>
				</form>
			</DeclarationForm>
		</>
	);
}

export const getServerSideProps = (async (context) =>
	guardDeclaration(context)) satisfies GetServerSideProps<{
	declaration: PopulatedDeclaration;
}>;
