import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";
import { Part } from "~/components/form/Part";
import { withForm } from "../context";
import { schemaFormOptions } from "./schemaSchema";

export const SchemaForm = withForm({
	...schemaFormOptions,
	props: { readOnly: true },
	render: function Render({ form, readOnly }) {
		const { classes } = useStyles();
		return (
			<Part readOnly={readOnly} grid={false}>
				<form.AppField name="name">
					{(field) => (
						<field.TextField
							label="Nom du schéma pluriannuel"
							hintText="Ce nom vous aidera à retrouver ce schéma (ex: « Schéma pluriannuel 2024-2026 »)"
							readOnlyField={readOnly}
							required
						/>
					)}
				</form.AppField>
				<form.AppField name="url">
					{(field) => (
						<field.TextField
							label="Lien du schéma pluriannuel"
							hintText={
								<>
									Si vous êtes en cours de création de ce schéma, laissez le
									champ vide et revenez modifier votre déclaration une fois le
									schéma terminé. <br /> Format attendu : https://www.example.fr
								</>
							}
							nativeInputProps={{ type: "url" }}
							readOnlyField={readOnly}
						/>
					)}
				</form.AppField>
				<hr className={classes.separator} />
				<form.Field name="actionPlanUrls" mode="array">
					{(arrayField) => (
						<div>
							<p className="fr-text--bold fr-mb-6v">Plans d'actions associés</p>
							{arrayField.state.value.map((_, index) => (
								<fieldset
									key={`action-plan-${index}`}
									className={classes.plan}
									aria-label={`Plan d'actions ${index + 1}`}
								>
									{!readOnly && (
										<Button
											className={classes.planRemove}
											type="button"
											priority="secondary"
											iconId="fr-icon-delete-line"
											title={`Supprimer le plan d'actions ${index + 1}`}
											onClick={() => arrayField.removeValue(index)}
											size="small"
										/>
									)}
									<form.AppField name={`actionPlanUrls[${index}].name`}>
										{(field) => (
											<field.TextField
												label="Nom du plan d'actions"
												hintText="Ce nom vous aidera à identifier ce plan d'actions"
												readOnlyField={readOnly}
												required
											/>
										)}
									</form.AppField>
									<form.AppField name={`actionPlanUrls[${index}].url`}>
										{(field) => (
											<field.TextField
												label="Lien du plan d'actions"
												hintText="Format attendu : https://www.example.fr"
												nativeInputProps={{ type: "url" }}
												readOnlyField={readOnly}
												required
											/>
										)}
									</form.AppField>
								</fieldset>
							))}
							{!readOnly && (
								<Button
									className={fr.cx("fr-mt-2v")}
									type="button"
									priority="secondary"
									iconId="fr-icon-add-line"
									iconPosition="left"
									onClick={() => arrayField.pushValue({ name: "", url: "" })}
									size="small"
								>
									Ajouter un plan d'action
								</Button>
							)}
						</div>
					)}
				</form.Field>
			</Part>
		);
	},
});

const useStyles = tss.withName("SchemaForm").create({
	separator: {
		border: "none",
		borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: 0,
		marginTop: fr.spacing("2v"),
		marginBottom: fr.spacing("6v"),
	},
	plan: {
		position: "relative",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: fr.spacing("4v"),
		marginBottom: fr.spacing("4v"),
		minWidth: 0,
	},
	planRemove: {
		position: "absolute",
		// Above the neighbouring field label, which otherwise catches the click.
		zIndex: 1,
		top: fr.spacing("4v"),
		right: fr.spacing("4v"),
	},
});
