import { useState } from "react";
import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";

import type { PopulatedDeclaration } from "~/utils/payload-helper";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { readOnlyFormOptions } from "~/utils/form/readonly/schema";
import SchemaForm from "~/components/declaration/SchemaForm";
import { getDeclarationById } from "~/utils/payload-helper";
import { DeclarationSchema } from "~/utils/form/readonly/form";
import { api } from "~/utils/api";
import { ReadOnlyDeclarationSchema } from "~/components/declaration/ReadOnlyDeclaration";

export default function SchemaPage({
	declaration,
}: { declaration: PopulatedDeclaration }) {
	const router = useRouter();
	const { classes } = useStyles();
	const [editMode, setEditMode] = useState(false);
	const { id, currentYearSchemaUrl, previousYearsSchemaUrl } =
		declaration?.actionPlan || {};

	const { mutateAsync: updateSchema } = api.schema.update.useMutation({
		onSuccess: async () => {
			router.reload();
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
			});
		} catch (error) {
			console.error("Error updating schema:", error);
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
				<div>
					<h1>Schéma et plans d'actions</h1>
					<div className={classes.headerAction}>
						<h3 className={classes.description}>
							Verifiez les informations et modifiez-les si necessaire
						</h3>
						<Button priority="secondary" onClick={onEditInfos}>
							{!editMode ? "Modifier" : "Annuler"}
						</Button>
					</div>
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
					</div>
				</form>
			</div>
		</section>
	);
}

const useStyles = tss.withName(SchemaPage.name).create({
	main: {
		marginTop: fr.spacing("10v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6w"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		padding: fr.spacing("4w"),
		marginBottom: fr.spacing("6w"),
	},
	headerAction: {
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
