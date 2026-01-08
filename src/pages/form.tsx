import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { useRouter } from "next/router";

import { useAppForm } from "~/utils/form/context";
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";
import {
	DeclarationGeneralForm,
	InitialDeclarationForm,
} from "~/utils/form/declaration/form";
import { api } from "~/utils/api";

export default function FormPage() {
	const { classes } = useStyles();
	const router = useRouter();

	const { mutateAsync: createDeclaration } = api.declaration.create.useMutation(
		{
			onSuccess: async (result) => {
				router.push(`/declaration/${result.data}`);
			},
			onError: (error) => {
				console.error("Error adding declaration:", error);
			},
		},
	);

	declarationMultiStepFormOptions.defaultValues.section = "initialDeclaration";

	const addDeclaration = async (generalData: any) => {
		try {
			const general = {
				...generalData,
			};

			await createDeclaration({ general });
		} catch (error) {
			console.error("Error adding declaration:", error);
		}
	};

	const form = useAppForm({
		...declarationMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "initialDeclaration") {
				formApi.setFieldValue("section", "general");
			} else {
				await addDeclaration(value.general);
			}
		},
	});

	const section = useStore(form.store, (state) => state.values.section);

	return (
		<div className={classes.main}>
			<h2>
				{section === "initialDeclaration"
					? "Votre déclaration d'accessibilité"
					: "Informations générales"}
			</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className={classes.formWrapper}>
					{section === "initialDeclaration" && (
						<InitialDeclarationForm form={form} />
					)}
					{section === "general" && (
						<DeclarationGeneralForm form={form} readOnly={false} />
					)}
					<form.AppForm>
						<div className={classes.actionButtonsContainer}>
							<form.CancelButton
								label="Retour"
								onClick={() => {
									router.back();
								}}
								priority="tertiary"
							/>
							<form.SubscribeButton
								label="Continuer"
								iconId="fr-icon-arrow-right-line"
								iconPosition="right"
							/>
						</div>
					</form.AppForm>
				</div>
			</form>
		</div>
	);
}

const useStyles = tss.withName(FormPage.name).create({
	main: {
		marginTop: fr.spacing("10v"),
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
