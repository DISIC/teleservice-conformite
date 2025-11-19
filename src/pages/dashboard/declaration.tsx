import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
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
			onSuccess: (data) =>
				setGeneralFormDefaultValues({
					appKind: data.app_kind,
					appName: data.name,
					appUrl: data.url,
					organisation: data.administration,
					domain: "",
				}),
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
				<h2>Test Ara Informations</h2>
				<araForm.AppField
					name="id"
					children={(field) => <field.TextField label="Identifiant ARA" />}
				/>
				<araForm.Subscribe
					selector={(form) => [form.canSubmit]}
					children={(canSubmit) => (
						<Button type="submit" disabled={!canSubmit || isPending}>
							Valider
						</Button>
					)}
				/>
			</form>
			<form
				id="declaration-form"
				className={fr.cx("fr-pb-12w")}
				onSubmit={(e) => {
					e.preventDefault();
					declarationGeneralForm.handleSubmit();
				}}
			>
				<declarationGeneralForm.AppForm>
					<div className={classes.formWrapper}>
						<h2 className={fr.cx("fr-mb-0")}>Déclaration - section générale</h2>
						<DeclarationGeneralForm form={declarationGeneralForm} />
						<declarationGeneralForm.Subscribe
							selector={(store) => store.canSubmit}
							children={(canSubmit) => (
								<Button type="submit" disabled={!canSubmit}>
									Valider la déclaration
								</Button>
							)}
						/>
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
						<h2 className={fr.cx("fr-mb-0")}>Déclaration - section générale</h2>
						<DeclarationAuditForm form={declarationAuditForm} />
						<declarationAuditForm.Subscribe
							selector={(store) => store.canSubmit}
							children={(canSubmit) => (
								<Button type="submit" disabled={!canSubmit}>
									Valider la déclaration
								</Button>
							)}
						/>
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
	},
});
