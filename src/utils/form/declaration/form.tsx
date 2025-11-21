import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";
import { rgaaVersionOptions } from "~/payload/collections/Audit";
import { appKindOptions } from "~/payload/collections/Declaration";
import { withForm } from "../context";
import {
	declarationAuditDefaultValues,
	declarationGeneralDefaultValues,
} from "./schema";

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
	defaultValues: declarationGeneralDefaultValues,
	render: function Render({ form }) {
		const { classes, cx } = useStyles();

		return (
			<div className={cx(classes.formWrapper)}>
				<form.AppField
					name="organisation"
					children={(field) => (
						<field.TextField label="Nom de l'organisation" />
					)}
				/>
				<form.AppField
					name="kind"
					children={(field) => (
						<field.SelectField
							label="Type de de produit numérique"
							options={[...appKindOptions]}
						/>
					)}
				/>
				<form.AppField
					name="name"
					children={(field) => (
						<field.TextField label="Nom du service numérique" />
					)}
				/>
				<form.AppField
					name="appUrl"
					children={(field) => <field.TextField label="URL" />}
				/>
				<form.AppField
					name="domain"
					children={(field) => (
						<field.TextField label="Secteur d'activité de l'entité" />
					)}
				/>
			</div>
		);
	},
});

export const DeclarationAuditForm = withForm({
	defaultValues: declarationAuditDefaultValues,
	render: function Render({ form }) {
		const { classes, cx } = useStyles();

		return (
			<div className={cx(classes.formWrapper)}>
				<form.AppField
					name="isAchieved"
					children={(field) => <field.CheckboxField label="Audit réalisé" />}
				/>
				<form.Subscribe
					selector={(store) => store.values.isAchieved}
					children={(isAchieved) =>
						isAchieved && (
							<>
								<form.AppField
									name="url"
									children={(field) => (
										<field.TextField label="Url de l'audit" />
									)}
								/>
								<form.AppField
									name="rgaa_version"
									children={(field) => (
										<field.RadioField
											label="Version du RGAA utilisée"
											options={[...rgaaVersionOptions]}
										/>
									)}
								/>
								<div className={classes.gridRow}>
									<form.AppField
										name="date"
										children={(field) => (
											<field.TextField
												label="Date de l'audit"
												kind="date"
												max={new Date().toISOString().split("T")[0]}
											/>
										)}
									/>
									<form.AppField
										name="rate"
										children={(field) => (
											<field.NumberField label="Taux de conformité (%)" />
										)}
									/>
								</div>
								<form.AppField
									name="realisedBy"
									children={(field) => (
										<field.TextField label="Réalisé par l'organisation" />
									)}
								/>
								<div className={fr.cx("fr-accordions-group")}>
									<form.AppField name="pages" mode="array">
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
																name={`pages[${index}].label`}
																children={(subField) => (
																	<subField.TextField
																		label={`Page ${index + 1} - Label`}
																		className={fr.cx("fr-mb-0")}
																	/>
																)}
															/>
															<form.AppField
																name={`pages[${index}].url`}
																children={(subField) => (
																	<subField.TextField
																		label={`Page ${index + 1} - URL`}
																	/>
																)}
															/>
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
									<form.AppField name="testEnvironments" mode="array">
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
																name={`testEnvironments[${index}].kind`}
																children={(subField) => (
																	<subField.SelectField
																		label={`Environnement ${index + 1} - Type`}
																		options={envKindOptions}
																		className={fr.cx("fr-mb-0")}
																	/>
																)}
															/>
															<form.Subscribe
																selector={(store) =>
																	store.values.testEnvironments?.[index]?.kind
																}
																children={(kind) => (
																	<form.AppField
																		name={`testEnvironments[${index}].os`}
																		children={(subField) => (
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
																	/>
																)}
															/>
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
									<form.AppField name="technologies" mode="array">
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
																name={`technologies[${index}]`}
																children={(subField) => (
																	<subField.TextField
																		label={`Technologie ${index + 1}`}
																	/>
																)}
															/>
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
									<form.AppField name="tools" mode="array">
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
															<form.AppField
																name={`tools[${index}]`}
																children={(subField) => (
																	<subField.TextField
																		label={`Outil ${index + 1}`}
																	/>
																)}
															/>
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
						)
					}
				/>
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
