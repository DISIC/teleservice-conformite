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
import SchemaForm from "~/components/declaration/SchemaForm";
import { DeclarationSchema } from "~/utils/form/readonly/form";
import { api } from "~/utils/api";
import { ReadOnlyDeclarationSchema } from "~/components/declaration/ReadOnlyDeclaration";
import VerifyGeneratedInfoPopUpMessage from "~/components/declaration/VerifyGeneratedInfoPopUpMessage";

export default function SchemaPage({
	declaration: initialDeclaration,
}: { declaration: PopulatedDeclaration }) {
	const { classes } = useStyles();
	const router = useRouter();
	const [declaration, setDeclaration] =
		useState<PopulatedDeclaration>(initialDeclaration);
	const [editMode, setEditMode] = useState(false);
	const { id, currentYearSchemaUrl, previousYearsSchemaUrl } =
		declaration?.actionPlan || {};
	const declarationPagePath = `/dashboard/declaration/${declaration?.id}`;

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

	const form = useAppForm({
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

	if (!declaration?.actionPlan) {
		return <SchemaForm declaration={declaration} />;
	}

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
					{declaration?.actionPlan.status === "unverified" && (
						<VerifyGeneratedInfoPopUpMessage />
					)}
				</div>
				<div className={classes.body}>
					<div className={classes.editButtonWrapper}>
						<h3 className={classes.description}>
							Verifiez les informations et modifiez-les si necessaire
						</h3>
						<Button priority="secondary" onClick={onEditInfos}>
							{!editMode ? "Modifier" : "Annuler"}
						</Button>
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<div className={classes.formWrapper}>
							{editMode ? (
								<>
									<DeclarationSchema form={form} />
									<form.AppForm>
										<form.SubscribeButton label={"Valider"} />
									</form.AppForm>
								</>
							) : (
								<ReadOnlyDeclarationSchema declaration={declaration ?? null} />
							)}
							{declaration.actionPlan.status === "unverified" && !editMode && (
								<div className={classes.validateButton}>
									<Button onClick={updateSchemaStatus}>
										Valider les informations
									</Button>
								</div>
							)}
						</div>
					</form>
				</div>
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
		marginBottom: fr.spacing("6w"),
	},
	editButtonWrapper: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
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
	body: {
		backgroundColor: fr.colors.decisions.background.raised.grey.default,
		padding: fr.spacing("10v"),
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
