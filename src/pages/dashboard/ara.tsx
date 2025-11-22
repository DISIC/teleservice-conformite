import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import z from "zod";
import { api } from "~/utils/api";
import { useAppForm } from "~/utils/form/context";
import {
	DeclarationAuditForm,
	DeclarationGeneralForm,
} from "~/utils/form/declaration/form";
import { declarationMultiStepFormOptions } from "~/utils/form/declaration/schema";

export default function Home() {
	const { classes } = useStyles();

	const { mutateAsync: getInfoFromAra, isPending } =
		api.declaration.getInfoFromAra.useMutation({
			onSuccess: (data) => {
				declarationMultiStepFormOptions.defaultValues = {
					section: "general",
					...data,
				};
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

	const generalForm = useAppForm({
		...declarationMultiStepFormOptions,
		onSubmit: async ({ value }) => console.log("Submitted values:", value),
	});

	const auditForm = useAppForm({
		...declarationMultiStepFormOptions,
		onSubmit: async ({ value }) => console.log("Submitted values:", value),
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
					<araForm.AppField name="id">
						{(field) => <field.TextField label="Identifiant ARA" />}
					</araForm.AppField>
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
					generalForm.handleSubmit();
				}}
			>
				<div className={classes.formWrapper}>
					<h2 className={fr.cx("fr-mb-0")}>
						Déclaration - Section Informations Générales
					</h2>
					<DeclarationGeneralForm form={generalForm} />
					<generalForm.AppForm>
						<generalForm.SubscribeButton label="Valider la déclaration" />
					</generalForm.AppForm>
				</div>
			</form>
			<form
				className={fr.cx("fr-pb-12w")}
				onSubmit={(e) => {
					e.preventDefault();
					auditForm.setFieldValue("section", "audit");
					auditForm.handleSubmit();
				}}
			>
				<div className={classes.formWrapper}>
					<h2 className={fr.cx("fr-mb-0")}>Déclaration - Section Audit</h2>
					<DeclarationAuditForm form={auditForm} isAchievedCondition />
					<auditForm.AppForm>
						<auditForm.SubscribeButton label="Valider l'audit" />
					</auditForm.AppForm>
				</div>
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
