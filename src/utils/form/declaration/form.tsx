import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

import { useState } from "react";
import { tss } from "tss-react";
import { rgaaVersionOptions } from "~/payload/collections/Audit";
import { appKindOptions } from "~/payload/collections/Declaration";
import { kindOptions } from "~/payload/collections/Entity";
import { withForm } from "../context";
import { declarationMultiStepFormOptions } from "./schema";

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
	...declarationMultiStepFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		// const { classes, cx } = useStyles();

		return (
			<div>
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
							label="Type de service"
							options={[...appKindOptions]}
							readOnly={readOnly}
						/>
					)}
				</form.AppField>
				<form.AppField name="general.name">
					{(field) => (
						<field.TextField
							label="Nom de la déclaration"
							readOnly={readOnly}
							description="Exemples : Demande de logement social, Service public.fr, Outil de gestion des congés"
						/>
					)}
				</form.AppField>
				<form.Subscribe selector={(store) => store.values.general?.kind}>
					{(kind) =>
						kind === "website" ? (
							<form.AppField name="general.url">
								{(field) => (
									<field.TextField
										label="URL du service (facultatif)"
										readOnly={readOnly}
									/>
								)}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
				<form.AppField name="general.domain">
					{(field) => (
						<field.SelectField
							label="Secteur d’activité de l’organisation"
							placeholder="Sélectionnez un secteur"
							defaultStateMessage="Si vous représentez une agglomération, choisissez “Aucun de ces domaines”"
							readOnly={readOnly}
							options={[...kindOptions]}
						/>
					)}
				</form.AppField>
			</div>
		);
	},
});

export const DeclarationAuditForm = withForm({
	...declarationMultiStepFormOptions,
	props: {
		isAchieved: false,
		readOnly: false,
	},
	render: function Render({ form, isAchieved: initialIsAchieved, readOnly }) {
		const [isAchieved, setIsAchieved] = useState(initialIsAchieved);

		return (
			<div>
				{!readOnly ? (
					<Checkbox
						options={[
							{
								label: "L'audit d'accessibilité a-t-il été réalisé ?",
								nativeInputProps: {
									checked: isAchieved,
									// onChange: (e) => setIsAchieved(e.target.checked),
								},
							},
						]}
						className={fr.cx("fr-mb-3w")}
						style={{ userSelect: "none" }}
					/>
				) : (
					<p>
						<strong>Audit réalisé:</strong> {isAchieved ? "Oui" : "Non"}
					</p>
				)}
				<span
					style={{
						backgroundColor: fr.colors.decisions.background.default.grey.hover,
						height: "0.75rem",
						width: "100%",
						marginBottom: fr.spacing("4w"),
						display: "block",
					}}
				/>
				{isAchieved && (
					<>
						<form.AppField name="audit.date">
							{(field) => (
								<field.TextField
									label="Date de realisation"
									kind="date"
									max={new Date().toISOString().split("T")[0]}
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<span
							style={{
								backgroundColor:
									fr.colors.decisions.background.default.grey.hover,
								height: "0.125rem",
								width: "100%",
								marginBottom: fr.spacing("4w"),
								display: "block",
							}}
						/>
						<form.AppField name="audit.realisedBy">
							{(field) => (
								<field.RadioField
									label="Entité ou personne ayant réalisé l'audit"
									options={[...rgaaVersionOptions]}
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<span
							style={{
								backgroundColor:
									fr.colors.decisions.background.default.grey.hover,
								height: "0.125rem",
								width: "100%",
								marginBottom: fr.spacing("4w"),
								display: "block",
							}}
						/>
						<form.AppField name="audit.rgaa_version">
							{(field) => (
								<field.RadioField
									label="Référentiel RGAA utilisé"
									options={[...rgaaVersionOptions]}
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<span
							style={{
								backgroundColor:
									fr.colors.decisions.background.default.grey.hover,
								height: "0.125rem",
								width: "100%",
								marginBottom: fr.spacing("4w"),
								display: "block",
							}}
						/>
						<div>
							<form.AppField name="audit.rate">
								{(field) => (
									<field.NumberField label="Résultats" readOnly={readOnly} />
								)}
							</form.AppField>
						</div>
						<span
							style={{
								backgroundColor:
									fr.colors.decisions.background.default.grey.hover,
								height: "0.125rem",
								width: "100%",
								marginBottom: fr.spacing("4w"),
								display: "block",
							}}
						/>
						<form.AppField name="audit.technologies" mode="array">
							{(field) =>
								!readOnly ? (
									<Accordion
										label="Technologies utilisées (dans l'audit)"
										defaultExpanded
									>
										{field.state.value.map((_, index) => (
											<div key={index}>
												<div>
													<form.AppField name={`audit.technologies[${index}]`}>
														{(subField) => (
															<subField.TextField
																label={`Technologie ${index + 1}`}
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
									<p>
										<strong>Technologies utilisées:</strong>{" "}
										{field.state.value.length > 0 ? (
											<ul>
												{field.state.value.map((value) => (
													<li key={value}>{value}</li>
												))}
											</ul>
										) : (
											"None"
										)}
									</p>
								)
							}
						</form.AppField>
						<form.AppField name="audit.testEnvironments" mode="array">
							{(field) =>
								!readOnly ? (
									<Accordion
										label="Environnements de test (dans l'audit)"
										defaultExpanded
									>
										{field.state.value.map((_, index) => (
											<div key={index}>
												<div>
													<form.AppField
														name={`audit.testEnvironments[${index}].kind`}
													>
														{(subField) => (
															<subField.SelectField
																label={`Environnement ${index + 1} - Type`}
																options={envKindOptions}
																className={fr.cx("fr-mb-0")}
															/>
														)}
													</form.AppField>
													<form.Subscribe
														selector={(store) =>
															store.values.audit.testEnvironments?.[index]?.kind
														}
													>
														{(kind) => (
															<form.AppField
																name={`audit.testEnvironments[${index}].os`}
															>
																{(subField) => (
																	<subField.SelectField
																		label={`Environnement ${index + 1} - OS`}
																		disabled={!kind || kind === ""}
																		options={
																			kind === "mobile"
																				? envMobileOsOptions
																				: envDesktopOsOptions
																		}
																		readOnly={readOnly}
																	/>
																)}
															</form.AppField>
														)}
													</form.Subscribe>
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
										<Button
											type="button"
											onClick={() => field.pushValue({ kind: "", os: "" })}
										>
											Ajouter un environnement de test
										</Button>
									</Accordion>
								) : (
									<p>
										<strong>Environnement de test :</strong>{" "}
										{field.state.value.length > 0 ? (
											<ul>
												{field.state.value.map((value) => (
													<li key={value.kind}>
														{value.kind} - {value.os}
													</li>
												))}
											</ul>
										) : (
											"None"
										)}
									</p>
								)
							}
						</form.AppField>
						<span
							style={{
								backgroundColor:
									fr.colors.decisions.background.default.grey.hover,
								height: "0.75rem",
								width: "100%",
								marginBottom: fr.spacing("4w"),
								display: "block",
							}}
						/>
						<div className={fr.cx("fr-accordions-group")}>
							<form.AppField name="audit.pages" mode="array">
								{(field) =>
									!readOnly ? (
										<Accordion label="Pages auditées" defaultExpanded>
											{field.state.value.map((_, index) => (
												<div key={index}>
													<div>
														<form.AppField name={`audit.pages[${index}].label`}>
															{(subField) => (
																<subField.TextField
																	label={`Page ${index + 1} - Label`}
																	className={fr.cx("fr-mb-0")}
																/>
															)}
														</form.AppField>
														<form.AppField name={`audit.pages[${index}].url`}>
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
												onClick={() => field.pushValue({ url: "", label: "" })}
											>
												Ajouter une page
											</Button>
										</Accordion>
									) : (
										<p>
											<strong>Environnement de test :</strong>{" "}
											{field.state.value.length > 0 ? (
												<ul>
													{field.state.value.map((value) => (
														<li key={value.label}>
															{value.label} - {value.url}
														</li>
													))}
												</ul>
											) : (
												"None"
											)}
										</p>
									)
								}
							</form.AppField>

							<form.AppField name="audit.tools" mode="array">
								{(field) =>
									!readOnly ? (
										<Accordion
											label="Outils utilisés (dans l'audit)"
											defaultExpanded
										>
											{field.state.value.map((_, index) => (
												<div key={index}>
													<div>
														<form.AppField name={`audit.tools[${index}]`}>
															{(subField) => (
																<subField.TextField
																	label={`Outil ${index + 1}`}
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
														title="Supprimer l'outil"
													/>
												</div>
											))}
											<Button type="button" onClick={() => field.pushValue("")}>
												Ajouter un outil
											</Button>
										</Accordion>
									) : (
										<p>
											<strong>Environnement de test :</strong>{" "}
											{field.state.value.length > 0 ? (
												<ul>
													{field.state.value.map((value) => (
														<li key={value}>{value}</li>
													))}
												</ul>
											) : (
												"None"
											)}
										</p>
									)
								}
							</form.AppField>
						</div>
					</>
				)}
			</div>
		);
	},
});

export const InitialDeclarationForm = withForm({
	...declarationMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<div>
				<form.AppField name="initialDeclaration.isNewDeclaration">
					{(field) => (
						<field.RadioField
							label="Une déclaration d’accessibilité a-t--elle déjà été publiée sur votre service ?"
							description="Une déclaration d’accessibilité est une page publique qui informe les usagers du niveau de conformité de votre service, liste les contenus non accessibles et indique comment demander une alternative ou signaler un problème."
							options={[
								{ label: "Oui", value: true },
								{ label: "Non", value: false },
							]}
						/>
					)}
				</form.AppField>
				<form.Subscribe
					selector={(store) =>
						store.values.initialDeclaration?.isNewDeclaration
					}
				>
					{(isNew) =>
						isNew ? (
							<form.AppField name="initialDeclaration.publishedDate">
								{(field) => (
									<field.TextField
										label="À quelle date ?"
										description="Format attendu : JJ/MM/AAAA"
										kind="date"
										max={new Date().toISOString().split("T")[0]}
									/>
								)}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
				<form.Subscribe
					selector={(store) =>
						store.values.initialDeclaration?.isNewDeclaration
					}
				>
					{(isNew) =>
						isNew ? (
							<form.AppField name="initialDeclaration.usedAra">
								{(field) => (
									<field.RadioField
										label="Votre auditeur a t-il utilisé l’outil Ara ?"
										description="Ara est un outil destiné aux auditeurs formés à l’accessibilité. Il permet de réaliser un audit complet et de générer automatiquement une déclaration d’accessibilité."
										options={[
											{ label: "Oui", value: true },
											{ label: "Non", value: false },
										]}
									/>
								)}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
				<form.Subscribe
					selector={(store) => store.values.initialDeclaration?.usedAra}
				>
					{(usedAra) =>
						usedAra ? (
							<form.AppField name="initialDeclaration.araUrl">
								{(field) => (
									<field.TextField
										label="Lien URL de la déclaration Ara"
										description="Format attendu : https://www.example.fr. Vous pouvez trouver le lien à TEL ENDROIT sur votre interface Ara"
									/>
								)}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
			</div>
		);
	},
});
