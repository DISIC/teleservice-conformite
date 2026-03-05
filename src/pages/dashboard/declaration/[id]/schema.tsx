import type { ParsedUrlQuery } from "node:querystring";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getPayload } from "payload";
import { useMemo, useState } from "react";
import DeclarationForm from "~/components/declaration/DeclarationForm";
import { useCommonStyles } from "~/components/style/commonStyles";
import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";
import { SchemaForm as DeclarationSchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions, type ZSchema } from "~/utils/form/schema/schema";

export default function SchemaPage({
	declaration: initialDeclaration,
}: {
	declaration: PopulatedDeclaration;
}) {
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

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	if (!id || typeof id !== "string") {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	const payload = await getPayload({ config });

	const declaration = await getDeclarationById(
		payload,
		Number.parseInt(id, 10),
	);

	if (!declaration) {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	return {
		props: {
			declaration: declaration,
		},
	};
};
