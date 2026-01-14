import { useRouter } from "next/router";

import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useAppForm } from "~/utils/form/context";
import { SchemaForm as DeclarationSchemaForm } from "~/utils/form/schema/form";
import { schemaFormOptions } from "~/utils/form/schema/schema";
import { api } from "~/utils/api";

export default function SchemaForm({
	declarationId,
}: { declarationId: number }) {
	const { classes } = useStyles();
	const router = useRouter();

	const { mutateAsync: createSchema } = api.schema.create.useMutation({
		onSuccess: async () => {
			router.push(`/dashboard/declaration/${declarationId}`);
		},
		onError: (error) => {
			console.error("Error adding schema:", error);
		},
	});

	const onClickCancel = () =>
		router.push(`/dashboard/declaration/${declarationId}`);

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

	const form = useAppForm({
		...schemaFormOptions,
		onSubmit: async ({ value, formApi }) => {
			await addSchema({
				currentYearSchemaUrl: value.currentYearSchemaUrl,
				previousYearsSchemaUrl: value.previousYearsSchemaUrl,
				declarationId,
			});
		},
	});

	return (
		<div className={classes.main}>
			<h2>Schéma et plans d'actions</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className={classes.formWrapper}>
					<p>Tous les champs sont obligatoires sauf précision contraire</p>
					<DeclarationSchemaForm form={form} />
				</div>
				<form.AppForm>
					<div className={classes.actionButtonsContainer}>
						<form.CancelButton
							label="Retour"
							onClick={onClickCancel}
							priority="tertiary"
						/>
						<form.SubscribeButton
							label="Continuer"
							iconId="fr-icon-arrow-right-line"
							iconPosition="right"
						/>
					</div>
				</form.AppForm>
			</form>
		</div>
	);
}

const useStyles = tss.withName(SchemaForm.name).create({
	main: {
		marginTop: fr.spacing("6v"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		padding: fr.spacing("4w"),
		marginBottom: fr.spacing("6w"),
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
});
