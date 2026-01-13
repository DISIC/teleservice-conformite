import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

import { useState } from "react";
import { tss } from "tss-react";
import {
	rgaaVersionOptions,
	toolOptions,
	testEnvironmentOptions,
} from "~/payload/collections/Audit";
import { appKindOptions } from "~/payload/collections/Declaration";
import { kindOptions } from "~/payload/collections/Entity";
import { withForm } from "../context";
import { readOnlyFormOptions } from "./schema";
import { ReadOnlyField } from "~/components/form/fields/ReadOnlyField";

const envKindOptions = [
	{ label: "Mobile", value: "mobile" },
	{ label: "Ordinateur", value: "ordinateur" },
];

const envDesktopOsOptions = [
	{ label: "Windows", value: "windows" },
	{ label: "macOS", value: "macos" },
	{ label: "Linux", value: "linux" },
];

const envMobileOsOptions = [
	{ label: "iOS", value: "ios" },
	{ label: "Android", value: "android" },
];

export const DeclarationGeneralForm = withForm({
	...readOnlyFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<>
				<form.AppField name="general.organisation">
					{(field) => (
						<field.TextField
							label="Organisation"
							readOnly={readOnly}
							placeholder="Direction Générale des Finances (DGFIP)"
						/>
					)}
				</form.AppField>
				<form.AppField name="general.kind">
					{(field) => (
						<field.RadioField
							label="Type de produit numérique"
							options={[...appKindOptions]}
							readOnly={readOnly}
						/>
					)}
				</form.AppField>
				<form.AppField name="general.name">
					{(field) => (
						<field.TextField
							label="Nom du service numérique"
							readOnly={readOnly}
							description="Exemples : Demande de logement social, Service public.fr, Outil de gestion des congés"
						/>
					)}
				</form.AppField>
				<form.Subscribe selector={(store) => store.values.general?.kind}>
					{(kind) =>
						kind === "website" ? (
							<form.AppField name="general.url">
								{(field) => <field.TextField label="URL" readOnly={readOnly} />}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
				<form.AppField name="general.domain">
					{(field) => (
						<field.SelectField
							label="Secteur d'activité de l'organisation"
							placeholder="Sélectionnez un secteur"
							defaultStateMessage="Si vous représentez une agglomération, choisissez “Aucun de ces domaines”"
							readOnly={readOnly}
							options={[...kindOptions]}
						/>
					)}
				</form.AppField>
			</>
		);
	},
});

export const DeclarationAuditForm = withForm({
	...readOnlyFormOptions,
	props: {
		isAchieved: false,
		readOnly: false,
		onChangeIsAchieved: (value: boolean) => {},
	},
	render: function Render({
		form,
		isAchieved: initialIsAchieved,
		readOnly,
		onChangeIsAchieved,
	}) {
		const [isAchieved, setIsAchieved] = useState(initialIsAchieved);

		const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const checked = event.target.checked;
			setIsAchieved(checked);
			onChangeIsAchieved(checked);
		};

		return (
			<>
				{!readOnly ? (
					<Checkbox
						options={[
							{
								label: "L'audit d'accessibilité a-t-il été réalisé ?",
								nativeInputProps: {
									checked: isAchieved,
									onChange,
								},
							},
						]}
						className={fr.cx("fr-mb-3w")}
						style={{ userSelect: "none" }}
					/>
				) : (
					<p style={{ margin: 0 }}>
						<strong>Audit réalisé:</strong> {isAchieved ? "Oui" : "Non"}
					</p>
				)}
				{isAchieved && (
					<>
						<form.AppField name="audit.date">
							{(field) => (
								<field.TextField
									label="Date de réalisation"
									kind="date"
									max={new Date().toISOString().split("T")[0]}
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.realisedBy">
							{(field) => (
								<field.TextField
									kind="text"
									label="Entité ou personne ayant réalisé l'audit"
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.rgaa_version">
							{(field) => (
								<field.RadioField
									label="Référentiel RGAA utilisé"
									options={[...rgaaVersionOptions]}
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<div>
							<form.AppField name="audit.rate">
								{(field) =>
									readOnly ? (
										<p style={{ margin: 0 }}>
											<strong>Résultats:</strong> {field.state.value}%
										</p>
									) : (
										<field.NumberField label="Résultats" />
									)
								}
							</form.AppField>
						</div>
						<form.AppField name="audit.technologies" mode="array">
							{(field) =>
								!readOnly ? (
									<Accordion
										label="Outils utilisés pour évaluer l’accessibilité"
										defaultExpanded
									>
										{field.state.value.map((_, index) => (
											<div
												key={index}
												style={{
													display: "flex",
													flexDirection: "column",
													gap: fr.spacing("4v"),
													width: "100%",
													paddingBlock: fr.spacing("4v"),
												}}
											>
												<div>
													<form.AppField name={`audit.technologies[${index}]`}>
														{(subField) => (
															<subField.SelectField
																label={`Technologie ${index + 1}`}
																options={[...toolOptions]}
															/>
														)}
													</form.AppField>
												</div>
												<Button
													type="button"
													priority="secondary"
													iconId="fr-icon-delete-bin-line"
													onClick={() => field.removeValue(index)}
													title="Supprimer la technologie"
												/>
											</div>
										))}
										<Button type="button" onClick={() => field.pushValue("")}>
											Ajouter une technologie
										</Button>
									</Accordion>
								) : (
									<field.CheckboxGroupField
										label="Outils utilisés pour évaluer l’accessibilité"
										options={[...toolOptions]}
										readOnly={readOnly}
									/>
								)
							}
						</form.AppField>
						<form.AppField name="audit.testEnvironments" mode="array">
							{(field) =>
								!readOnly ? (
									<Accordion label="Environnement de test" defaultExpanded>
										{field.state.value.map((_, index) => (
											<div
												key={index}
												style={{
													display: "flex",
													flexDirection: "column",
													gap: fr.spacing("4v"),
													width: "100%",
													paddingBlock: fr.spacing("4v"),
												}}
											>
												<div>
													<form.AppField
														name={`audit.testEnvironments[${index}]`}
													>
														{(field) => (
															<field.SelectField
																label={`Environnement de test ${index + 1}`}
																options={[...testEnvironmentOptions]}
															/>
														)}
													</form.AppField>
												</div>
												<Button
													type="button"
													priority="secondary"
													iconId="fr-icon-delete-bin-line"
													onClick={() => field.removeValue(index)}
													title="Supprimer l'environnement de test"
												/>
											</div>
										))}
										<Button type="button" onClick={() => field.pushValue("")}>
											Ajouter un environnement de test
										</Button>
									</Accordion>
								) : (
									<field.CheckboxGroupField
										label="Environnement de test"
										options={[...testEnvironmentOptions]}
										readOnly={readOnly}
									/>
								)
							}
						</form.AppField>
						<form.AppField name="audit.compliantElements" mode="array">
							{(field) =>
								!readOnly ? (
									<Accordion
										label="Éléments ayant fait l’objet de vérification"
										defaultExpanded
									>
										{field.state.value?.map((_, index) => (
											<div
												key={index}
												style={{
													display: "flex",
													flexDirection: "column",
													gap: fr.spacing("4v"),
													width: "100%",
													paddingBlock: fr.spacing("4v"),
												}}
											>
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: fr.spacing("4v"),
														width: "100%",
													}}
												>
													<form.AppField
														name={`audit.compliantElements[${index}].name`}
													>
														{(subField) => (
															<subField.TextField
																label={`Page ${index + 1} - Label`}
																className={fr.cx("fr-mb-0")}
															/>
														)}
													</form.AppField>
													<form.AppField
														name={`audit.compliantElements[${index}].url`}
													>
														{(subField) => (
															<subField.TextField
																label={`Page ${index + 1} - URL`}
																readOnly={readOnly}
															/>
														)}
													</form.AppField>
												</div>
												<Button
													type="button"
													priority="secondary"
													iconId="fr-icon-delete-bin-line"
													onClick={() => field.removeValue(index)}
													title="Supprimer la page"
												/>
											</div>
										))}
										<Button
											type="button"
											onClick={() => field.pushValue({ url: "", name: "" })}
										>
											Ajouter une page
										</Button>
									</Accordion>
								) : (
									<ReadOnlyField
										label="Éléments ayant fait l’objet de vérification"
										value={
											field?.state?.value?.length
												? field.state.value.map(
														(item) =>
															`${item.name} ${item.url ? `(${item.url})` : ""}`,
													)
												: ""
										}
									/>
								)
							}
						</form.AppField>
						<form.AppField name="audit.nonCompliantElements">
							{(field) => (
								<field.TextField
									label="Éléments non conforme"
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.disproportionnedCharge" mode="array">
							{(field) =>
								!readOnly ? (
									<Accordion
										label="Dérogation pour charge disproportionnée :"
										defaultExpanded
									>
										{field.state.value?.map((_, index) => (
											<div key={index}>
												<div>
													<form.AppField
														name={`audit.disproportionnedCharge[${index}].name`}
													>
														{(subField) => (
															<subField.TextField label="Nom de l’élément" />
														)}
													</form.AppField>
													<form.AppField
														name={`audit.disproportionnedCharge[${index}].reason`}
													>
														{(subField) => (
															<subField.TextField label="Raison de la dérogation" />
														)}
													</form.AppField>
													<form.AppField
														name={`audit.disproportionnedCharge[${index}].duration`}
													>
														{(subField) => (
															<subField.TextField label="Durée de la dérogation (facultatif)" />
														)}
													</form.AppField>
													<form.AppField
														name={`audit.disproportionnedCharge[${index}].alternative`}
													>
														{(subField) => (
															<subField.TextField label="Alternative accessible proposée" />
														)}
													</form.AppField>
												</div>
												<Button
													type="button"
													priority="secondary"
													iconId="fr-icon-delete-bin-line"
													onClick={() => field.removeValue(index)}
													title="Supprimer la dérogation pour charge disproportionnée"
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
											Ajouter une dérogation pour charge disproportionnée
										</Button>
									</Accordion>
								) : (
									<ReadOnlyField
										label="Dérogation pour charge disproportionnée"
										value={
											field?.state?.value?.length
												? field.state.value.map(
														(item) =>
															`${item.name} - ${item.reason} - ${item.duration} - ${item.alternative}`,
													)
												: ""
										}
									/>
								)
							}
						</form.AppField>
						<form.AppField name="audit.optionalElements">
							{(field) => (
								<field.TextField
									label="Contenus non soumis à la déclaration"
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.grid">
							{(field) => (
								<field.TextField label="Rapport d’audit" readOnly={readOnly} />
							)}
						</form.AppField>
						<form.AppField name="audit.report">
							{(field) => (
								<field.TextField label="Grille d’audit" readOnly={readOnly} />
							)}
						</form.AppField>
					</>
				)}
			</>
		);
	},
});

export const DeclarationContactForm = withForm({
	...readOnlyFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<>
				<form.AppField name="contact.contactOptions">
					{(field) => (
						<>
							{!readOnly && (
								<field.CheckboxGroupField
									label="Manière de contacter la personne responsable de l’accessibilité"
									options={[
										{ label: "Formulaire en ligne", value: "url" },
										{ label: "Point de contact", value: "email" },
									]}
								/>
							)}
							{field.state.value.includes("url") && (
								<form.AppField name="contact.contactName">
									{(field) => (
										<field.TextField
											label="Lien URL du formulaire"
											readOnly={readOnly}
										/>
									)}
								</form.AppField>
							)}
							{field.state.value.includes("email") && (
								<form.AppField name="contact.contactEmail">
									{(field) => (
										<field.TextField
											label="Email de contact"
											readOnly={readOnly}
										/>
									)}
								</form.AppField>
							)}
						</>
					)}
				</form.AppField>
			</>
		);
	},
});
