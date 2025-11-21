import { fr } from "@codegouvfr/react-dsfr";
import { useStore } from "@tanstack/react-form";
import { tss } from "tss-react";
import { MultiStep } from "~/components/MultiStep";
import { useAppForm } from "~/utils/form/context";
import {
	DeclarationAuditForm,
	DeclarationGeneralForm,
} from "~/utils/form/declaration/form";
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";

type Steps<T> = {
	slug: T;
	title: string;
};

export default function DashboardMultiStep() {
	const { classes } = useStyles();

	const form = useAppForm({
		...declarationMultiStepFormOptions,
		onSubmit: async ({ value, formApi }) => {
			if (value.section === "general") {
				formApi.setFieldValue("section", "audit");
			} else {
				alert(JSON.stringify(value, null, 2));
			}
		},
	});

	const section = useStore(form.store, (state) => state.values.section);

	const steps: Steps<typeof section>[] = [
		{ slug: "general", title: "Déclaration d’accessibilité existante" },
		{ slug: "audit", title: "Audit existant" },
	];

	return (
		<div className={classes.main}>
			<h2>Votre déclaration d'accessibilité</h2>
			<MultiStep steps={steps} currentStep={section}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className={classes.formWrapper}>
						{section === "general" && <DeclarationGeneralForm form={form} />}
						{section === "audit" && <DeclarationAuditForm form={form} />}
						<form.AppForm>
							<form.SubscribeButton
								label={section === "general" ? "Suivant" : "Soumettre"}
							/>
						</form.AppForm>
					</div>
				</form>
			</MultiStep>
		</div>
	);
}

const useStyles = tss.withName(DashboardMultiStep.name).create({
	main: {
		marginTop: fr.spacing("6v"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		backgroundColor: fr.colors.decisions.background.default.grey.hover,
		padding: fr.spacing("4w"),
		marginBottom: fr.spacing("6w"),
	},
});
