import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
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
import { SchemaForm as DeclarationSchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions } from "~/utils/form/schema/schema";
import { api } from "~/utils/api";
import DeclarationForm from "~/components/declaration/DeclarationForm";

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
		<DeclarationForm
			declaration={declaration}
			title="Schéma et plans d'actions"
			breadcrumbLabel={declaration?.name ?? ""}
			showValidateButton={
				(declaration?.actionPlan?.status === "fromAI" ||
					declaration?.actionPlan?.status === "fromAra") &&
				!editMode
			}
			onValidate={updateSchemaStatus}
			isEditable={!!declaration?.actionPlan}
			onToggleEdit={onEditInfos}
			editMode={editMode}
			showLayoutComponent={false}
		>
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
				<div className={classes.whiteBackground}>
					{!declaration?.actionPlan ? (
						<DeclarationSchemaForm form={form} />
					) : (
						<>
							{editMode ? (
								<DeclarationSchema form={readOnlyForm} />
							) : (
								<ReadOnlyDeclarationSchema declaration={declaration ?? null} />
							)}
						</>
					)}
				</div>
				{editMode && (
					<form.AppForm>
						<form.SubscribeButton label={"Valider"} />
					</form.AppForm>
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
		</DeclarationForm>
	);
}

const useStyles = tss.withName(SchemaPage.name).create({
	whiteBackground: {
		backgroundColor: fr.colors.decisions.background.raised.grey.default,
		paddingInline: fr.spacing("10v"),
		paddingBottom: fr.spacing("10v"),
		marginBottom: fr.spacing("6v"),
		width: "100%",
		display: "flex",
		flexDirection: "column",
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
