import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useRouter } from "next/router";

import {
	type PopulatedDeclaration,
	getDeclarationById,
} from "~/server/api/utils/payload-helper";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import { DeclarationSchema } from "~/utils/form/readonly/form";
import { ReadOnlyDeclarationSchema } from "~/components/declaration/ReadOnlyDeclaration";
import VerifyGeneratedInfoPopUpMessage from "~/components/declaration/VerifyGeneratedInfoPopUpMessage";
import { SchemaForm as DeclarationSchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions } from "~/utils/form/schema/schema";
import { api } from "~/utils/api";

export default function SchemaPage({
	declaration: initialDeclaration,
}: { declaration: PopulatedDeclaration }) {
	const { classes, cx } = useStyles();
	const router = useRouter();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [editMode, setEditMode] = useState(false);
	const { id, currentYearSchemaUrl, previousYearsSchemaUrl } =
		declaration?.actionPlan || {};
	const declarationPagePath = `/dashboard/declaration/${declaration?.id}`;

	const { mutateAsync: createSchema } = api.schema.create.useMutation({
		onSuccess: async () => {
			if (declaration?.audit && declaration.contact) {
				router.push(`/dashboard/declaration/${declaration.id}/preview`);
				return;
			}

			router.push(`/dashboard/declaration/${declaration.id}`);
		},
		onError: (error) => {
			console.error("Error adding schema:", error);
		},
	});

	const addSchema = async ({
		currentYearSchemaUrl,
		previousYearsSchemaUrl,
		declarationId,
	}: {
		currentYearSchemaUrl: string;
		previousYearsSchemaUrl: string;
		declarationId: number;
	}) => {
		try {
			createSchema({
				currentYearSchemaUrl,
				previousYearsSchemaUrl,
				declarationId,
			});
		} catch (error) {
			console.error("Error adding schema:", error);
		}
	};

	const { mutateAsync: updateSchema } = api.schema.update.useMutation({
		onSuccess: async (result) => {
			setDeclaration((prev) => ({
				...prev,
				actionPlan: {
					...prev.actionPlan,
					...result.data,
				},
			}));
			setEditMode(false);
			router.push(declarationPagePath);
		},
		onError: async (error) => {
			console.error(
				`Error updating contact for declaration with id ${declaration?.id}:`,
				error,
			);
		},
	});

	const { mutateAsync: updateStatus } = api.schema.updateStatus.useMutation({
		onSuccess: async (result) => {
			setDeclaration((prev) => ({
				...prev,
				actionPlan: {
					...prev.actionPlan,
					...result.data,
				},
			}));
			setEditMode(false);
		},
		onError: async (error) => {
			console.error(
				`Error updating contact for declaration with id ${declaration?.id}:`,
				error,
			);
		},
	});

	const onEditInfos = () => {
		setEditMode((prev) => !prev);
	};

	readOnlyFormOptions.defaultValues.schema = {
		hasDoneCurrentYearSchema: !!currentYearSchemaUrl,
		hasDonePreviousYearsSchema: !!previousYearsSchemaUrl,
		currentYearSchemaUrl: currentYearSchemaUrl || "",
		previousYearsSchemaUrl: previousYearsSchemaUrl || "",
	};

	const updateDeclarationSchema = async ({
		currentYearSchemaUrl,
		previousYearsSchemaUrl,
	}: {
		currentYearSchemaUrl: string;
		previousYearsSchemaUrl: string;
	}) => {
		try {
			updateSchema({
				schemaId: id ?? -1,
				currentYearSchemaUrl,
				previousYearsSchemaUrl,
				declarationId: declaration.id,
			});
		} catch (error) {
			console.error("Error updating schema:", error);
		}
	};

	const updateSchemaStatus = async () => {
		try {
			await updateStatus({
				declarationId: declaration.id,
				id: declaration?.actionPlan?.id ?? -1,
				status: "default",
			});
		} catch (error) {
			return;
		}
	};

	const readOnlyForm = useAppForm({
		...readOnlyFormOptions,
		onSubmit: async ({ value, formApi }) => {
			const {
				hasDoneCurrentYearSchema,
				currentYearSchemaUrl = "",
				hasDonePreviousYearsSchema,
				previousYearsSchemaUrl = "",
			} = value.schema;

			updateDeclarationSchema({
				currentYearSchemaUrl: hasDoneCurrentYearSchema
					? currentYearSchemaUrl
					: "",
				previousYearsSchemaUrl: hasDonePreviousYearsSchema
					? previousYearsSchemaUrl
					: "",
			});
		},
	});

	const form = useAppForm({
		...schemaFormOptions,
		onSubmit: async ({ value, formApi }) => {
			await addSchema({
				currentYearSchemaUrl: value.currentYearSchemaUrl ?? "",
				previousYearsSchemaUrl: value.previousYearsSchemaUrl ?? "",
				declarationId: declaration.id,
			});
		},
	});

	return (
		<section id="schema" className={classes.main}>
			<div>
				<Breadcrumb
					homeLinkProps={{ href: "/dashboard" }}
					segments={[
						{
							label: declaration?.name ?? "",
							linkProps: { href: declarationPagePath },
						},
					]}
					currentPageLabel="Schéma et plans d'actions"
				/>
				<div>
					<h1>{declaration?.name ?? ""} - Schéma et plans d'actions</h1>
					{declaration?.actionPlan?.status === "unverified" && (
						<VerifyGeneratedInfoPopUpMessage />
					)}
				</div>
				<div className={cx(classes.editButtonWrapper, classes.whiteBackground)}>
					<h3 className={classes.description}>
						Verifiez les informations et modifiez-les si necessaire
					</h3>
					{declaration?.actionPlan && (
						<Button priority="secondary" onClick={onEditInfos}>
							{!editMode ? "Modifier" : "Annuler"}
						</Button>
					)}
				</div>
				<form
					onSubmit={(e) => {
						e.preventDefault();

						if (!declaration?.actionPlan) {
							form.handleSubmit();
						} else {
							readOnlyForm.handleSubmit();
						}
					}}
				>
					<div className={cx(classes.formWrapper, classes.whiteBackground)}>
						{!declaration?.actionPlan ? (
							<DeclarationSchemaForm form={form} />
						) : (
							<>
								{editMode ? (
									<>
										<DeclarationSchema form={readOnlyForm} />
									</>
								) : (
									<ReadOnlyDeclarationSchema
										declaration={declaration ?? null}
									/>
								)}
							</>
						)}
					</div>
					{editMode && (
						<form.AppForm>
							<form.SubscribeButton label={"Valider"} />
						</form.AppForm>
					)}
					{declaration?.actionPlan?.status === "unverified" && !editMode && (
						<div className={classes.validateButton}>
							<Button onClick={updateSchemaStatus}>
								Valider les informations
							</Button>
						</div>
					)}
					{!declaration?.actionPlan && (
						<form.AppForm>
							<div className={classes.actionButtonsContainer}>
								<form.CancelButton
									label="Retour"
									onClick={() =>
										router.push(`/dashboard/declaration/${declaration.id}`)
									}
									priority="tertiary"
								/>
								<form.SubscribeButton
									label="Continuer"
									iconId="fr-icon-arrow-right-line"
									iconPosition="right"
								/>
							</div>
						</form.AppForm>
					)}
				</form>
			</div>
		</section>
	);
}

const useStyles = tss.withName(SchemaPage.name).create({
	main: {
		marginBlock: fr.spacing("10v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		paddingBottom: fr.spacing("10v"),
		paddingInline: fr.spacing("10v"),
	},
	editButtonWrapper: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		padding: fr.spacing("10v"),
	},
	description: {
		fontSize: "1rem",
		color: "grey",
	},
	title: {
		fontSize: "1rem",
		color: fr.colors.decisions.text.mention.grey.default,
	},
	validateButton: {
		marginTop: fr.spacing("4w"),
		display: "flex",
		justifyContent: "flex-end",
	},
	whiteBackground: {
		backgroundColor: fr.colors.decisions.background.raised.grey.default,
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});

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

	const declaration = await getDeclarationById(payload, Number.parseInt(id));

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
