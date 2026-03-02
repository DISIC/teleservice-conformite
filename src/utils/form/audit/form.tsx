import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import NextLink from "next/link";
import { tss } from "tss-react";

import DisproportionnedChargeContent from "~/components/modal/DisproportionnedChargeContent";
import ExemptionListModalContent from "~/components/modal/ExemptionListContent";
import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import { withForm } from "../context";
import { auditMultiStepFormOptions } from "./schema";

export const AuditRealisedForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<form.AppField name="isAuditRealised">
				{(field) => (
					<field.RadioField
						legend="Avez-vous réalisé un audit d’accessibilité de votre service numérique ?"
						hintText="Un audit d’accessibilité évalue votre service numérique selon le RGAA afin d’identifier les non-conformités et les points à améliorer. Il peut être réalisé par un prestataire externe."
						options={[
							{ label: "Oui", value: true },
							{ label: "Non", value: false },
						]}
						required
					/>
				)}
			</form.AppField>
		);
	},
});

export const AuditDateForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="date">
					{(field) => (
						<field.TextField
							label="Date de réalisation de l'audit"
							nativeInputProps={{
								type: "date",
								max: new Date().toISOString().split("T")[0],
								required: true,
							}}
						/>
					)}
				</form.AppField>
				<form.AppField name="realisedBy">
					{(field) => (
						<field.TextField
							label="Entité ou personne ayant réalisé l’audit"
							hintText='Exemple : "Agence Audit", "Mme Hélène Belanyt"'
							nativeInputProps={{ required: true }}
						/>
					)}
				</form.AppField>
				<form.AppField name="rgaa_version">
					{(field) => (
						<field.RadioField
							legend="Version du référentiel RGAA utilisée"
							options={rgaaVersionOptions.map((option) => ({
								label: option.label,
								value: option.value,
							}))}
							required
						/>
					)}
				</form.AppField>
				<form.AppField name="rate">
					{(field) => (
						<field.NumberField
							label="Pourcentage de critères du RGAA respectés"
							hintText="Format attendu : le nombre seul, sans le signe pourcentage. Exemple : “83”"
							nativeInputProps={{ required: true, min: 0, max: 100 }}
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
				<form.AppField name="usedTools">
					{(field) => (
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
					)}
				</form.AppField>
				<form.AppField name="testEnvironments">
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
			</>
		);
	},
});

export const CompliantElementsForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<form.AppField name="compliantElements">
				{(field) => (
					<field.TextField
						label="Éléments ayant fait l’objet de la vérification de conformité"
						textArea
						hintText={
							<>
								Renseignez le nom de chaque élément. Pour un site web,
								renseignez également l’URL.
								<br /> L’URL reste facultative pour un intranet, extranet ou si
								elle ne peut pas être communiquée pour des raisons de sécurité.
								<br />
								Exemple : 'Accueil - https://www.nomdelapage/accueil'
							</>
						}
						nativeInputProps={{ required: true }}
					/>
				)}
			</form.AppField>
		);
	},
});

const exemptionListmodal = createModal({
	id: "exemption-list-modal",
	isOpenedByDefault: false,
});

const disproportionnedChargeModal = createModal({
	id: "disproportionned-charge-modal",
	isOpenedByDefault: false,
});

export const NonCompliantElementsForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		const { classes } = useStyles();

		return (
			<>
				<form.AppField name="nonCompliantElements">
					{(field) => (
						<field.TextField
							label="Éléments non conformes (facultatif)"
							textArea
							hintText={
								<>
									Exemples : Vidéo sans transcription, navigation au clavier
									impossible, ...
									<br />
									Précisez les points non conformes et leur volume en utilisant
									les mentions “quelques / la plupart des / aucun(e)”. Vous
									pouvez trouver ces informations dans votre déclaration
									existante ou votre audit.
									<br />
									Exemples :
									<br />- Aucune image n’a de texte équivalent
									<br />- Quelques vidéos n’ont pas de sous-titres
								</>
							}
						/>
					)}
				</form.AppField>
				<form.AppField name="optionalElements">
					{(field) => (
						<field.TextField
							label="Éléments non soumis à l’obligation d’accessibilité (facultatif)"
							textArea
							hintText={
								<>
									<Button
										onClick={(e) => {
											e.preventDefault();
											exemptionListmodal.open();
										}}
										className={classes.dialogActionButton}
									>
										Liste des contenus non soumis à l’obligation d’accessibilité
									</Button>
									<exemptionListmodal.Component title="">
										<ExemptionListModalContent />
									</exemptionListmodal.Component>
									<br />
									Format attendu : Listez les éléments exemptés les uns à la
									suite des autres
								</>
							}
						/>
					)}
				</form.AppField>
				<form.AppField name="disproportionnedCharge">
					{(field) => (
						<field.TextField
							label="Éléments avec dérogation pour charge disproportionnée (facultatif)"
							hintText={
								<>
									<Button
										onClick={(e) => {
											e.preventDefault();
											disproportionnedChargeModal.open();
										}}
										className={classes.dialogActionButton}
									>
										Qu’est-ce qu’une charge disproportionnée ?
									</Button>
									<disproportionnedChargeModal.Component title="">
										<DisproportionnedChargeContent />
									</disproportionnedChargeModal.Component>
									<br />
									Renseigner, pour chaque élément, son nom, la raison de la
									dérogation et l’alternative accessible proposée.
									<br />
									Exemple : “- Carte IGN de la région, trop complexe et couteux
									à rendre accessible. Alternative : Application mobile avec
									lecture du relief”
								</>
							}
							kind="text"
							textArea
						/>
					)}
				</form.AppField>
			</>
		);
	},
});

export const useStyles = tss.withName(NonCompliantElementsForm.name).create({
	dialogActionButton: {
		fontSize: fr.typography[18].style.fontSize,
		lineHeight: fr.typography[18].style.lineHeight,
		color: fr.colors.decisions.text.label.blueFrance.default,
		backgroundColor: "transparent !important",
		backgroundImage: "none !important",
		border: "none !important",
		boxShadow: "none !important",
		padding: 0,
		margin: 0,
		minHeight: "unset",
		height: "auto",
		display: "inline",

		"&:not(:disabled):hover:not([class^='Mui'])": {
			backgroundColor: "transparent",
			textDecoration: "underline",
			textUnderlineOffset: 4,
		},
	},
});

export const FilesForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="report">
					{(field) => (
						<field.TextField
							label="Rapport d’audit (facultatif)"
							hintText="Format attendu: https://www.example.fr"
						/>
					)}
				</form.AppField>
			</>
		);
	},
});
