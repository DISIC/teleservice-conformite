import { fr } from "@codegouvfr/react-dsfr";
import { useState } from "react";
import { tss } from "tss-react";
import z from "zod";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";
import {
	DeclarationAuditForm,
	DeclarationGeneralForm,
} from "~/utils/form/declaration/form";
import {
	declarationAudit,
	declarationAuditDefaultValues,
	declarationGeneral,
	declarationGeneralDefaultValues,
} from "~/utils/form/declaration/schema";

export default function Home() {
	const { classes } = useStyles();

	const [generalFormDefaultValues, setGeneralFormDefaultValues] = useState(
		declarationGeneralDefaultValues,
	);
	const [auditFormDefaultValues, setAuditFormDefaultValues] = useState(
		declarationAuditDefaultValues,
	);

	const { mutateAsync: getInfoFromAra, isPending } =
		api.declaration.getInfoFromAra.useMutation({
			onSuccess: (data) => {
				setGeneralFormDefaultValues({ ...data.declaration });
				setAuditFormDefaultValues({ isAchieved: true, ...data.audit });
			},
			onError: (error) => console.error("error", error),
		});

	const araForm = useAppForm({
		defaultValues: { id: "" },
		validators: {
			onSubmit: z.object({
				id: z.string().min(1, "L'identifiant ARA est requis"),
			}),
		},
		onSubmit: async ({ value }) => getInfoFromAra(value),
	});

	const declarationGeneralForm = useAppForm({
		defaultValues: generalFormDefaultValues,
		validators: { onSubmit: declarationGeneral },
		onSubmit: async ({ value }) => {
			console.log("Submitted values:", value);
		},
	});

	const declarationAuditForm = useAppForm({
		defaultValues: auditFormDefaultValues,
		validators: { onSubmit: declarationAudit },
		onSubmit: async ({ value }) => {
			console.log("Submitted values:", value);
		},
	});

	return (
		<div className={classes.main}>
			<form
				id="ara-form"
				className={fr.cx("fr-mb-6v")}
				onSubmit={(e) => {
					e.preventDefault();
					araForm.handleSubmit();
				}}
			>
				<araForm.AppForm>
					<h2>Test Ara Informations</h2>
					<araForm.AppField
						name="id"
						children={(field) => <field.TextField label="Identifiant ARA" />}
					/>
					<araForm.SubscribeButton
						label={isPending ? "Chargement..." : "Importer depuis ARA"}
					/>
				</araForm.AppForm>
			</form>
			<form
				id="declaration-form"
				className={fr.cx("fr-pb-6w")}
				onSubmit={(e) => {
					e.preventDefault();
					declarationGeneralForm.handleSubmit();
				}}
			>
				<declarationGeneralForm.AppForm>
					<div className={classes.formWrapper}>
						<h2 className={fr.cx("fr-mb-0")}>Déclaration - Section générale</h2>
						<DeclarationGeneralForm form={declarationGeneralForm} />
						<declarationGeneralForm.SubscribeButton label="Valider la déclaration" />
					</div>
				</declarationGeneralForm.AppForm>
			</form>
			<form
				className={fr.cx("fr-pb-12w")}
				onSubmit={(e) => {
					e.preventDefault();
					declarationAuditForm.handleSubmit();
				}}
			>
				<declarationAuditForm.AppForm>
					<div className={classes.formWrapper}>
						<h2 className={fr.cx("fr-mb-0")}>Déclaration - Section audit</h2>
						<DeclarationAuditForm form={declarationAuditForm} />
						<declarationAuditForm.SubscribeButton label="Valider l'audit" />
					</div>
				</declarationAuditForm.AppForm>
			</form>
		</div>
	);
}

const useStyles = tss.withName(Home.name).create({
	main: {
		marginTop: fr.spacing("6v"),
	},
	formWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("3w"),
		backgroundColor: fr.colors.decisions.background.default.grey.hover,
		padding: fr.spacing("4w"),
	},
});
