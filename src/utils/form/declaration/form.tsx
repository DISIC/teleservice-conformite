import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { rgaaVersionOptions } from "~/payload/collections/Audit";
import { appKindOptions } from "~/payload/collections/Declaration";
import { withForm } from "../context";
import {
	declarationAuditDefaultValues,
	declarationGeneralDefaultValues,
} from "./schema";

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
					name="appKind"
					children={(field) => (
						<field.SelectField
							label="Type de l'application"
							options={[...appKindOptions]}
						/>
					)}
				/>
				<form.AppField
					name="appName"
					children={(field) => <field.TextField label="Nom de l'application" />}
				/>
				<form.AppField
					name="appUrl"
					children={(field) => <field.TextField label="URL de l'application" />}
				/>
				<form.AppField
					name="domain"
					children={(field) => (
						<field.TextField label="Nom du domaine d'activité de l'entité" />
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
									name="date"
									children={(field) => (
										<field.TextField label="Date de l'audit" kind="date" />
									)}
								/>
								<form.AppField
									name="rgaa_version"
									children={(field) => (
										<field.SelectField
											label="Date de l'audit"
											options={[...rgaaVersionOptions]}
										/>
									)}
								/>
								<form.AppField
									name="rate"
									children={(field) => (
										<field.NumberField label="Taux de conformité RGAA (%)" />
									)}
								/>
								<form.AppField name="pages" mode="array">
									{(field) => (
										<div>
											{field.state.value.map((_, index) => (
												<form.AppField
													key={index}
													name={`pages[${index}].label`}
													children={(subField) => (
														<subField.TextField
															label={`Page ${index + 1} - Label`}
														/>
													)}
												/>
											))}
										</div>
									)}
								</form.AppField>
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
});
