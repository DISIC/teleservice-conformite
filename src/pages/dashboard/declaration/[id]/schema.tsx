import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import { useCommonStyles } from "~/components/style/commonStyles";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";
import { SchemaForm as DeclarationSchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions } from "~/utils/form/schema/schema";
import { guardDeclaration } from "~/utils/server-guards";

export default function SchemaPage({
	declaration: initialDeclaration,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { classes: commonClasses } = useCommonStyles();
	const router = useRouter();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [readOnly, setReadOnly] = useState(!!declaration?.actionPlan);

	const { mutateAsync: upsertSchema } = api.schema.upsert.useMutation({
		onSuccess: async ({ data: actionPlan }) => {
			if (!declaration.actionPlan) {
				const isComplete = declaration.audit && declaration.contact;
				router.push(
					`/dashboard/declaration/${declaration.id}${isComplete ? "/preview" : ""}`,
				);
			} else {
				setDeclaration((prev) => ({ ...prev, actionPlan }));
				setReadOnly(true);
			}
		},
		onError: (error) =>
			console.error(
				`Error updating schema for declaration with id ${declaration?.id}:`,
				error,
			),
	});

	const onEditInfos = () => {
		if (!readOnly) form.reset();
		setReadOnly((prev) => !prev);
	};

	const defaultValues: ZSchema = useMemo(() => {
		if (!declaration.actionPlan) return schemaFormOptions.defaultValues;

		const { currentYearSchemaUrl, previousYearsSchemaUrl } =
			declaration.actionPlan;

		return {
			hasDoneCurrentYearSchema: !!currentYearSchemaUrl,
			currentYearSchemaUrl: currentYearSchemaUrl ?? "",
			hasDonePreviousYearsSchema: !!previousYearsSchemaUrl,
			previousYearsSchemaUrl: previousYearsSchemaUrl ?? "",
		};
	}, [declaration.actionPlan]);

	const form = useAppForm({
		...schemaFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			await upsertSchema({ ...value, declarationId: declaration.id });
		},
	});

	return (
		<>
			<Head>
				<title>
					Schéma et plans d'actions - Déclaration de {declaration.name} -
					Téléservice Conformité
				</title>
			</Head>
			<DeclarationForm
				declaration={declaration}
				title="Schéma et plans d'actions"
				breadcrumbLabel={declaration?.name ?? ""}
				isEditable={!!declaration?.actionPlan}
				onToggleEdit={onEditInfos}
				readOnly={readOnly}
				isAiGenerated={declaration?.fromSource === "ai"}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					onInvalid={(_e) => {
						form.validate("submit");
					}}
				>
					<div className={commonClasses.whiteBackground}>
						<DeclarationSchemaForm form={form} readOnly={readOnly} />
					</div>
					<form.AppForm>
						<div className={commonClasses.actionButtonsContainer}>
							<form.CancelButton
								label="Retour"
								onClick={() =>
									router.push(`/dashboard/declaration/${declaration.id}`)
								}
								priority="tertiary"
								ariaLabel="Retour à la déclaration"
							/>
							{!readOnly && (
								<form.SubscribeButton
									label={
										declaration.actionPlan?.toVerify
											? "Valider les informations"
											: "Valider"
									}
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
