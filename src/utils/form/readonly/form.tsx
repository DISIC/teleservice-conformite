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
							inputReadOnly
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

export const DeclarationSchema = withForm({
	...readOnlyFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<>
				<form.AppField name="schema.annualSchemaDone">
					{(field) => (
						<field.RadioField
							label="Réalisation d’un schéma pluriannuel entre 2023 et 2025"
							readOnly={readOnly}
							options={[
								{ label: "Oui", value: true },
								{ label: "Non", value: false },
							]}
						/>
					)}
				</form.AppField>
				<form.AppField name="schema.currentYearSchemaDone">
					{(field) => (
						<field.RadioField
							label="Réalisation d’un schéma annuel - année en cours"
							readOnly={readOnly}
							options={[
								{ label: "Oui", value: true },
								{ label: "Non", value: false },
							]}
						/>
					)}
				</form.AppField>
				<form.AppField name="schema.currentSchemaUrl">
					{(field) => (
						<field.TextField
							kind="url"
							label="Lien du schéma annuel"
							readOnly={readOnly}
						/>
					)}
				</form.AppField>
				<form.AppField name="schema.currentSchemaFile">
					{(field) => (
						<field.UploadField
							label="Fichier du schéma annuel"
							readOnly={readOnly}
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
						<form.AppField name="audit.technologies">
							{(field) => {
								const options = new Set([
									...toolOptions,
									...field.state.value
										.filter((v) => !toolOptions.find((opt) => opt.value === v))
										.map((v: string) => ({
											label: v,
											value: v,
										})),
								]);

								return (
									<field.CheckboxGroupField
										label="Outils utilisés pour évaluer l’accessibilité"
										options={[...options, { label: "Autre", value: "other" }]}
										readOnly={readOnly}
									/>
								);
							}}
						</form.AppField>
						<form.AppField name="audit.testEnvironments">
							{(field) => (
								<field.CheckboxGroupField
									label="Environnement de tests"
									options={[...testEnvironmentOptions]}
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.compliantElements">
							{(field) => (
								<field.TextField
									label="Éléments ayant fait l’objet de vérification"
									readOnly={readOnly}
									textArea
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.nonCompliantElements">
							{(field) => (
								<field.TextField
									label="Éléments non conforme"
									textArea
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.disproportionnedCharge">
							{(field) => (
								<field.TextField
									label="Dérogation pour charge disproportionnée"
									textArea
									readOnly={readOnly}
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.optionalElements">
							{(field) => (
								<field.TextField
									label="Contenus non soumis à la déclaration"
									textArea
									readOnly={readOnly}
								/>
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
