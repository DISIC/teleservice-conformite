import Button from "@codegouvfr/react-dsfr/Button";

import { rgaaVersionOptions } from "~/payload/collections/Audit";
import {
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/collections/Audit";
import { withForm } from "../context";
import { auditMultiStepFormOptions } from "./schema";

export const AuditDateForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="date">
					{(field) => (
						<field.TextField
							kind="date"
							label="Date de réalisation de l'audit"
							max={new Date().toISOString().split("T")[0]}
						/>
					)}
				</form.AppField>
				<form.AppField name="realisedBy">
					{(field) => (
						<field.TextField
							label="Entité ou personne ayant réalisé l’audit"
							description='Exemple : "Agence Audit", "Mme Hélène Belanyt"'
						/>
					)}
				</form.AppField>
				<form.AppField name="rgaa_version">
					{(field) => (
						<field.RadioField
							label="Version du référentiel RGAA utilisée"
							options={rgaaVersionOptions.map((option) => ({
								label: option.label,
								value: option.value,
							}))}
						/>
					)}
				</form.AppField>
				<form.AppField name="rate">
					{(field) => (
						<field.NumberField
							label="Pourcentage de critères du RGAA respectés"
						/>
					)}
				</form.AppField>
			</>
		);
	},
});

export const ToolsForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="technologies">
					{(field) => (
						<field.CheckboxGroupField
							label="Outils utilisés pour évaluer l’accessibilité"
							options={[...toolOptions]}
						/>
					)}
				</form.AppField>
				<form.AppField name="testEnvironments">
					{(field) => (
						<field.CheckboxGroupField
							label="Environnement de tests"
							options={[...testEnvironmentOptions]}
						/>
					)}
				</form.AppField>
			</>
		);
	},
});

export const CompliantElementsForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<form.AppField name="compliantElements" mode="array">
				{(field) => (
					<div
						style={{ display: "flex", flexDirection: "column", gap: "30px" }}
					>
						<h2>
							Éléments ayant fait l’objet de la vérification de conformité
						</h2>
						{field.state.value.map((item, index) => (
							<div
								key={index}
								style={{
									display: "grid",
									gridTemplateColumns: "1fr auto",
									gap: "30px",
									borderBottom:
										field.state.value.length === 1 ? "" : "1px solid grey",
									paddingBottom: "30px",
									width: "100%",
								}}
							>
								<div>
									<form.AppField name={`compliantElements[${index}].name`}>
										{(subField) => (
											<subField.TextField
												label="Nom de l’élément"
												description="Exemples : Nom de page comme “Accueil” ou “Service>Immatriculation>Renouveler”"
											/>
										)}
									</form.AppField>
									<form.AppField name={`compliantElements[${index}].url`}>
										{(subField) => (
											<subField.TextField
												label="URL (facultative)"
												description="Il est nécessaire de renseigner l’URL pour un site web. Elle reste facultative pour un intranet, extranet ou si elle ne peut pas être communiquée pour des raisons de sécurité. Format attendu : https://www.nomdelapage/accueil"
											/>
										)}
									</form.AppField>
								</div>
								<Button
									type="button"
									priority="secondary"
									iconId="fr-icon-delete-bin-line"
									onClick={() => field.removeValue(index)}
									title="Supprimer l'élément"
								/>
							</div>
						))}
						<Button
							type="button"
							onClick={() => field.pushValue({ name: "", url: "" })}
						>
							Ajouter un élément
						</Button>
					</div>
				)}
			</form.AppField>
		);
	},
});

export const NonCompliantElementsForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<form.AppField name="hasNonCompliantElements">
				{(field) => (
					<>
						<field.RadioField
							label="Votre audit a-t-il identifié des éléments non conformes ?"
							options={[
								{ label: "Oui", value: true },
								{ label: "Non", value: false },
							]}
						/>
						{field.state.value && (
							<form.AppField name="nonCompliantElements">
								{(field) => (
									<field.TextField
										label="Éléments non conforme"
										description="Précisez les points non conformes et leur volume en utilisant les mentions “quelques / la plupart des / aucun(e)”. Vous pouvez trouver ces informations dans votre déclaration existante ou votre audit. Exemples : - Aucune image n’a de texte équivalent - Quelques vidéos n’ont pas de sous-titres"
										kind="text"
										textArea
									/>
								)}
							</form.AppField>
						)}
					</>
				)}
			</form.AppField>
		);
	},
});

export const DisproportionnedChargeForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<form.AppField name="hasDisproportionnedCharge">
				{(field) => (
					<>
						<field.RadioField
							label="Avez-vous une dérogation pour charge disproportionnée ?"
							description="Certains contenus peuvent bénéficier d’une dérogation si la charge de travail ou le coût est disproportionné. Cette dérogation est soumise à des conditions strictes : Qu’est-ce qu’une charge disproportionnée ?"
							options={[
								{ label: "Oui", value: true },
								{ label: "Non", value: false },
							]}
						/>
						{field.state.value && (
							<form.AppField name="disproportionnedCharge" mode="array">
								{(field) => (
									<>
										<h2>
											Éléments avec dérogation pour charge disproportionnée
										</h2>
										{field.state.value.map((item, index) => (
											<div
												key={index}
												style={{
													display: "grid",
													gridTemplateColumns: "1fr auto",
													gap: "30px",
													borderBottom:
														field.state.value.length === 1
															? ""
															: "1px solid grey",
													paddingBottom: "30px",
													width: "100%",
												}}
											>
												<div>
													<form.AppField
														name={`disproportionnedCharge[${index}].name`}
													>
														{(subField) => (
															<subField.TextField
																label="Nom de l’élément"
																description="Exemple : “Carte IGN de la région”"
															/>
														)}
													</form.AppField>
													<form.AppField
														name={`disproportionnedCharge[${index}].reason`}
													>
														{(subField) => (
															<subField.TextField label="Raison de la dérogation" />
														)}
													</form.AppField>
													<form.AppField
														name={`disproportionnedCharge[${index}].duration`}
													>
														{(subField) => (
															<subField.TextField
																label="Durée de la dérogation (facultatif)"
																description="Si la durée est illimitée, renseignez “illimitée”"
															/>
														)}
													</form.AppField>
													<form.AppField
														name={`disproportionnedCharge[${index}].alternative`}
													>
														{(subField) => (
															<subField.TextField
																label="Alternative accessible proposée"
																description="Exemple : “Application mobile avec lecture du relief”"
															/>
														)}
													</form.AppField>
												</div>
												<Button
													type="button"
													priority="secondary"
													iconId="fr-icon-delete-bin-line"
													onClick={() => field.removeValue(index)}
													title="Supprimer l'élément"
												/>
											</div>
										))}
										<Button
											type="button"
											onClick={() =>
												field.pushValue({
													name: "",
													reason: "",
													duration: "",
													alternative: "",
												})
											}
										>
											Ajouter un élément
										</Button>
									</>
								)}
							</form.AppField>
						)}
					</>
				)}
			</form.AppField>
		);
	},
});

export const OptionElementsForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<form.AppField name="hasOptionalElements">
				{(field) => (
					<>
						<field.RadioField
							label="Avez-vous des contenus non soumis à l’obligation d’accessibilité ?"
							description="Certaines catégories de contenus ne sont pas soumises à l’obligation d’accessibilité :"
							options={[
								{ label: "Oui", value: true },
								{ label: "Non", value: false },
							]}
						/>
						{field.state.value && (
							<form.AppField name="optionalElements">
								{(field) => (
									<field.TextField
										label="Éléments exemptés"
										description="Format attendu : Listez les éléments exemptés les uns à la suite des autres BESOIN d’URL ? D’autres infos ?"
										kind="text"
										textArea
									/>
								)}
							</form.AppField>
						)}
					</>
				)}
			</form.AppField>
		);
	},
});

export const FilesForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="grid">
					{(field) => (
						<field.UploadField
							label="Grille d’audit"
							description="Formats supportés : csv, ods (Open document Calc) - Taille maximale : 5 Mo"
						/>
					)}
				</form.AppField>
				<form.AppField name="report">
					{(field) => (
						<field.UploadField
							label="Rapport d’audit (facultatif)"
							description="Formats supportés : pdf, odt - Taille maximale : 5 Mo"
						/>
					)}
				</form.AppField>
			</>
		);
	},
});
