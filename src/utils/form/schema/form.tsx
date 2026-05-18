import Button from "@codegouvfr/react-dsfr/Button";
import { withForm } from "../context";
import { schemaFormOptions } from "./schema";

export const SchemaForm = withForm({
	...schemaFormOptions,
	props: { readOnly: true },
	render: function Render({ form, readOnly }) {
		return (
			<>
				<form.AppField name="schemaName">
					{(field) => (
						<field.TextField
							label="Nom du schéma pluriannuel"
							hintText="Ce nom vous aidera à retrouver ce schéma (ex: « Schéma pluriannuel 2024-2026 »)"
							readOnlyField={readOnly}
							required
						/>
					)}
				</form.AppField>
				<form.AppField name="schemaUrl">
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
				<form.Field name="actionPlanUrls" mode="array">
					{(arrayField) => (
						<div>
							<p className="fr-text--bold fr-mb-1w">Plans d'actions</p>
							{arrayField.state.value.map((_, index) => (
								<div
									key={`action-plan-${index}`}
									style={{
										display: "flex",
										alignItems: "flex-end",
										gap: "0.5rem",
									}}
								>
									<div style={{ flex: 1 }}>
										<form.AppField name={`actionPlanUrls[${index}].url`}>
											{(field) => (
												<field.TextField
													label={`Lien du plan d'actions ${index + 1}`}
													hintText="Format attendu : https://www.example.fr"
													nativeInputProps={{ type: "url" }}
													readOnlyField={readOnly}
													required
												/>
											)}
										</form.AppField>
									</div>
									{!readOnly && (
										<Button
											type="button"
											priority="tertiary no outline"
											iconId="fr-icon-delete-line"
											title="Supprimer ce plan d'actions"
											onClick={() => arrayField.removeValue(index)}
										/>
									)}
								</div>
							))}
							{!readOnly && (
								<Button
									type="button"
									priority="secondary"
									iconId="fr-icon-add-line"
									iconPosition="left"
									onClick={() => arrayField.pushValue({ url: "" })}
								>
									Ajouter un plan d'actions
								</Button>
							)}
						</div>
					)}
				</form.Field>
			</>
		);
	},
});
