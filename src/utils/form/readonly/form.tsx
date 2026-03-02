import { fr } from "@codegouvfr/react-dsfr";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Information from "@codegouvfr/react-dsfr/picto/Information";
import { useState } from "react";

import HelpingMessage from "~/components/declaration/HelpingMessage";
import {
	appKindOptions,
	kindOptions,
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import { withForm } from "../context";
import { readOnlyFormOptions } from "./schema";

export const DeclarationGeneralForm = withForm({
	...readOnlyFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="general.organisation">
					{(field) => <field.TextField label="Organisation" readOnlyField />}
				</form.AppField>
				<form.AppField name="general.kind">
					{(field) => (
						<field.RadioField
							legend="Type de produit numérique"
							options={[...appKindOptions]}
							onOptionChange={() => form.setFieldValue("general.url", "")}
						/>
					)}
				</form.AppField>
				<form.AppField name="general.name">
					{(field) => (
						<field.TextField label="Nom du service numérique" required />
					)}
				</form.AppField>
				<form.Subscribe selector={(store) => store.values.general?.kind}>
					{(kind) =>
						kind === "website" ? (
							<form.AppField name="general.url">
								{(field) => (
									<field.TextField
										label="URL"
										nativeInputProps={{ type: "url" }}
									/>
								)}
							</form.AppField>
						) : null
					}
				</form.Subscribe>
				<form.AppField name="general.domain">
					{(field) => (
						<field.SelectField
							label="Secteur d'activité de l'organisation"
							placeholder="Sélectionnez un secteur"
							stateRelatedMessage="Si vous représentez une agglomération, choisissez “Aucun de ces domaines”"
							options={[...kindOptions]}
							required
						/>
					)}
				</form.AppField>
			</>
		);
	},
});

export const DeclarationSchema = withForm({
	...readOnlyFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="schema.hasDoneCurrentYearSchema">
					{(field) => (
						<>
							<field.RadioField
								legend="Avez-vous réalisé un plan d’action pour l’année en cours ?"
								hintText="Le plan d’action, ou schéma annuel, détaille les actions prévues sur l’année pour améliorer l’accessibilité de vos services numériques."
								options={[
									{ label: "Oui", value: true },
									{ label: "Non", value: false },
								]}
								required
							/>
							{field.state.value ? (
								<form.AppField name="schema.currentYearSchemaUrl">
									{(field) => (
										<field.TextField
											label="Lien URL du schéma annuel à jour"
											hintText={
												<>
													Si vous êtes en cours de création de ce schéma,
													laissez le champ vide et revenez modifier votre
													déclaration une fois le schéma terminé. <br /> Format
													attendu : https://www.example.fr
												</>
											}
											required
											nativeInputProps={{ type: "url" }}
										/>
									)}
								</form.AppField>
							) : (
								<HelpingMessage
									image={<Information fontSize="6rem" />}
									message={
										<>
											L’objectif d’un plan d’action est de créer une démarche
											d’amélioration continue de l’accessibilité. Sa création
											est obligatoire.
										</>
									}
								/>
							)}
						</>
					)}
				</form.AppField>
				<form.AppField name="schema.hasDonePreviousYearsSchema">
					{(field) => (
						<>
							<field.RadioField
								legend="Avez-vous réalisé un bilan des actions des années précédentes ?"
								hintText="Le bilan des actions liste les actions réalisées pendant les années précédentes pour améliorer l’accessibilité de vos services numériques."
								options={[
									{ label: "Oui", value: true },
									{ label: "Non", value: false },
								]}
								required
							/>
							{field.state.value && (
								<form.AppField name="schema.previousYearsSchemaUrl">
									{(field) => (
										<field.TextField
											label="Lien URL du bilan des actions"
											hintText="Format attendu : https://www.example.fr"
											required
											nativeInputProps={{ type: "url" }}
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

export const DeclarationAuditForm = withForm({
	...readOnlyFormOptions,
	props: {
		isAchieved: false,
		onChangeIsAchieved: (_value: boolean) => {},
	},
	render: function Render({
		form,
		isAchieved: initialIsAchieved,
		onChangeIsAchieved,
	}) {
		const [isAchieved, setIsAchieved] = useState(initialIsAchieved);

		return (
			<>
				<RadioButtons
					legend="L'audit d'accessibilité a-t-il été réalisé ?"
					options={[
						{
							label: "Oui",
							nativeInputProps: {
								checked: isAchieved,
								onChange: () => {
									setIsAchieved(true);
									onChangeIsAchieved(true);
								},
							},
						},
						{
							label: "Non",
							nativeInputProps: {
								checked: !isAchieved,
								onChange: () => {
									setIsAchieved(false);
									onChangeIsAchieved(false);
								},
							},
						},
					]}
					className={fr.cx("fr-mb-3w")}
				/>
				{isAchieved && (
					<>
						<form.AppField name="audit.date">
							{(field) => (
								<field.TextField
									label="Date de réalisation"
									required
									nativeInputProps={{
										type: "date",
										max: new Date().toISOString().split("T")[0],
									}}
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.realisedBy">
							{(field) => (
								<field.TextField
									label="Entité ou personne ayant réalisé l'audit"
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.rgaa_version">
							{(field) => (
								<field.RadioField
									legend="Référentiel RGAA utilisé"
									options={[...rgaaVersionOptions]}
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.rate">
							{(field) => (
								<field.NumberField
									label="Résultats"
									nativeInputProps={{ min: 0, max: 100 }}
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.technologies">
							{(field) =>
								field?.state?.value?.length ? (
									<field.TagGroupField
										label="Technologies utilisées pour la réalisation du site"
										initialTags={field.state.value}
									/>
								) : null
							}
						</form.AppField>
						<form.AppField name="audit.usedTools">
							{(field) => {
								return (
									<div>
										<field.CheckboxGroupField
											label="Outils utilisés pour évaluer l’accessibilité (facultatif)"
											options={[...toolOptions]}
										/>
										<field.TagGroupField
											label="Ajouter un outil"
											initialTags={(field.state.value || []).filter(
												(tag) =>
													![...toolOptions]
														.map((option) => option.value as string)
														.includes(tag),
											)}
										/>
									</div>
								);
							}}
						</form.AppField>
						<form.AppField name="audit.testEnvironments">
							{(field) => (
								<div>
									<field.CheckboxGroupField
										label="Environnement de tests"
										options={[...testEnvironmentOptions]}
									/>
									<field.TagGroupField
										label="Ajouter un environnement"
										initialTags={(field.state.value || []).filter(
											(tag) =>
												![...testEnvironmentOptions]
													.map((option) => option.value as string)
													.includes(tag),
										)}
									/>
								</div>
							)}
						</form.AppField>
						<form.AppField name="audit.compliantElements">
							{(field) => (
								<field.TextField
									label="Éléments ayant fait l’objet de vérification"
									textArea
									required
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.nonCompliantElements">
							{(field) => (
								<field.TextField label="Éléments non conforme" textArea />
							)}
						</form.AppField>
						<form.AppField name="audit.disproportionnedCharge">
							{(field) => (
								<field.TextField
									label="Dérogation pour charge disproportionnée"
									textArea
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.optionalElements">
							{(field) => (
								<field.TextField
									label="Contenus non soumis à la déclaration"
									textArea
								/>
							)}
						</form.AppField>
						<form.AppField name="audit.report">
							{(field) => <field.TextField label="Rapport d’audit" />}
						</form.AppField>
					</>
				)}
			</>
		);
	},
});

export const DeclarationContactForm = withForm({
	...readOnlyFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="contact.contactOptions">
					{(field) => (
						<>
							<field.CheckboxGroupField
								label="Manière de contacter la personne responsable de l’accessibilité"
								options={[
									{ label: "Formulaire en ligne", value: "url" },
									{ label: "Point de contact", value: "email" },
								]}
								required
							/>
							{field.state.value?.includes("url") && (
								<form.AppField name="contact.contactName">
									{(field) => (
										<field.TextField
											label="Lien URL du formulaire"
											nativeInputProps={{ type: "url" }}
											required
										/>
									)}
								</form.AppField>
							)}
							{field.state.value?.includes("email") && (
								<form.AppField name="contact.contactEmail">
									{(field) => (
										<field.TextField
											label="Email de contact"
											nativeInputProps={{ type: "email" }}
											required
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
