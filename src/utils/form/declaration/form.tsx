import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
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
	render: function Render({ form }) {
		const { classes, cx } = useStyles();

		return (
			<div className={cx(classes.formWrapper)}>
				<form.AppField name="general.organisation">
					{(field) => <field.TextField label="Nom de l'organisation" />}
				</form.AppField>
				<form.AppField name="general.kind">
					{(field) => (
						<field.SelectField
							label="Type de service numérique"
							options={[...appKindOptions]}
						/>
					)}
				</form.AppField>
				<form.AppField name="general.name">
					{(field) => <field.TextField label="Nom du service numérique" />}
				</form.AppField>
				<form.AppField name="general.url">
					{(field) => <field.TextField label="URL du service numérique" />}
				</form.AppField>
				<form.AppField name="general.domain">
					{(field) => (
						<field.TextField label="Secteur d'activité de l'entité" />
					)}
				</form.AppField>
			</div>
		);
	},
});

export const DeclarationAuditForm = withForm({
	...declarationMultiStepFormOptions,
	render: function Render({ form }) {
		const { classes, cx } = useStyles();

		return (
			<div className={cx(classes.formWrapper)}>
				<form.AppField name="audit.isAchieved">
					{(field) => <field.CheckboxField label="Audit réalisé" />}
				</form.AppField>
				<form.Subscribe selector={(store) => store.values.audit.isAchieved}>
					{(isAchieved) => {
						if (!isAchieved) return null;
						return (
							<>
								<form.AppField name="audit.url">
									{(field) => <field.TextField label="Url de l'audit" />}
								</form.AppField>
								<form.AppField name="audit.rgaa_version">
									{(field) => (
										<field.RadioField
											label="Version du RGAA utilisée"
											options={[...rgaaVersionOptions]}
										/>
									)}
								</form.AppField>
								<div className={classes.gridRow}>
									<form.AppField name="audit.date">
										{(field) => (
											<field.TextField
												label="Date de l'audit"
												kind="date"
												max={new Date().toISOString().split("T")[0]}
											/>
										)}
									</form.AppField>
									<form.AppField name="audit.rate">
										{(field) => (
											<field.NumberField label="Taux de conformité (%)" />
										)}
									</form.AppField>
								</div>
								<form.AppField name="audit.realisedBy">
									{(field) => (
										<field.TextField label="Réalisé par l'organisation" />
									)}
								</form.AppField>
								<div className={fr.cx("fr-accordions-group")}>
									<form.AppField name="audit.pages" mode="array">
										{(field) => (
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
															<form.AppField
																name={`audit.pages[${index}].label`}
															>
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
													onClick={() =>
														field.pushValue({ url: "", label: "" })
													}
												>
													Ajouter une page
												</Button>
											</Accordion>
										)}
									</form.AppField>
									<form.AppField name="audit.testEnvironments" mode="array">
										{(field) => (
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
																	store.values.audit.testEnvironments?.[index]
																		?.kind
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
										)}
									</form.AppField>
									<form.AppField name="audit.technologies" mode="array">
										{(field) => (
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
															<form.AppField
																name={`audit.technologies[${index}]`}
															>
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
												<Button
													type="button"
													onClick={() => field.pushValue("")}
												>
													Ajouter une technologie
												</Button>
											</Accordion>
										)}
									</form.AppField>
									<form.AppField name="audit.tools" mode="array">
										{(field) => (
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
												<Button
													type="button"
													onClick={() => field.pushValue("")}
												>
													Ajouter un outil
												</Button>
											</Accordion>
										)}
									</form.AppField>
								</div>
							</>
						);
					}}
				</form.Subscribe>
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
