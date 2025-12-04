import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

import { useState } from "react";
import { tss } from "tss-react";
import { rgaaVersionOptions } from "~/payload/collections/Audit";
import { appKindOptions } from "~/payload/collections/Declaration";
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
		const { classes, cx } = useStyles();

		return (
			<div className={cx(classes.formWrapper)}>
				<form.AppField name="general.organisation">
					{(field) => (
						<field.TextField label="Administration" readOnly={readOnly} />
					)}
				</form.AppField>
				<form.AppField name="general.kind">
					{(field) => (
						<field.SelectField
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
						/>
					)}
				</form.AppField>
				<form.AppField name="general.url">
					{(field) => <field.TextField label="URL" readOnly={readOnly} />}
				</form.AppField>
				<form.AppField name="general.domain">
					{(field) => (
						<field.TextField
							label="Secteur d'activité de l'entité"
							readOnly={readOnly}
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
		const { classes, cx } = useStyles();

		const [isAchieved, setIsAchieved] = useState(initialIsAchieved);

		return (
			<div className={cx(classes.formWrapper)}>
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
						height: "10px",
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
								height: "2px",
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
								height: "2px",
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
								height: "2px",
								width: "100%",
								marginBottom: fr.spacing("4w"),
								display: "block",
							}}
						/>
						<div className={classes.gridRow}>
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
								height: "10px",
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
										className={classes.pagesAccordion}
									>
										{field.state.value.map((_, index) => (
											<div
												key={index}
												className={classes.pagesAccordionContent}
											>
												<div className={classes.pagesWrapper}>
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
										className={classes.pagesAccordion}
									>
										{field.state.value.map((_, index) => (
											<div
												key={index}
												className={classes.pagesAccordionContent}
											>
												<div className={classes.pagesWrapper}>
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
																		disabled={!kind && kind === ""}
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
								height: "10px",
								width: "100%",
								marginBottom: fr.spacing("4w"),
								display: "block",
							}}
						/>
						<div className={fr.cx("fr-accordions-group")}>
							<form.AppField name="audit.pages" mode="array">
								{(field) =>
									!readOnly ? (
										<Accordion
											label="Pages auditées"
											defaultExpanded
											className={classes.pagesAccordion}
										>
											{field.state.value.map((_, index) => (
												<div
													key={index}
													className={classes.pagesAccordionContent}
												>
													<div className={classes.pagesWrapper}>
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
											className={classes.pagesAccordion}
										>
											{field.state.value.map((_, index) => (
												<div
													key={index}
													className={classes.pagesAccordionContent}
												>
													<div className={classes.pagesWrapper}>
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

const useStyles = tss.withName(DeclarationGeneralForm.name).create({
	formWrapper: {
		display: "flex",
		flexDirection: "column",
	},
	gridRow: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
		gap: fr.spacing("4w"),
	},
	pagesAccordion: {
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		"& .fr-collapse": {
			margin: 0,
		},
	},
	pagesAccordionContent: {
		display: "flex",
		alignItems: "end",
		gap: fr.spacing("4w"),
		paddingBottom: fr.spacing("2w"),
	},
	pagesWrapper: {
		width: "100%",
		display: "grid",
		gap: fr.spacing("4w"),
		gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
		alignItems: "center",
		backgroundColor: fr.colors.decisions.background.default.grey.default,
	},
});
