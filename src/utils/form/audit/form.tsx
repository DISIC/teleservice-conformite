import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
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
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
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
						readOnlyField={readOnly}
						required
					/>
				)}
			</form.AppField>
		);
	},
});

export const AuditDateForm = withForm({
	...auditMultiStepFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<>
				<form.AppField name="date">
					{(field) => (
						<field.TextField
							label="Date de réalisation de l'audit"
							required
							nativeInputProps={{
								type: "date",
								max: new Date().toISOString().split("T")[0],
							}}
							readOnlyField={readOnly}
						/>
					)}
				</form.AppField>
				<form.AppField name="realisedBy">
					{(field) => (
						<field.TextField
							label="Entité ou personne ayant réalisé l’audit"
							hintText='Exemple : "Agence Audit", "Mme Hélène Belanyt"'
							readOnlyField={readOnly}
							required
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
							readOnlyField={readOnly}
							required
						/>
					)}
				</form.AppField>
				<form.AppField name="rate">
					{(field) => (
						<field.NumberField
							label="Pourcentage de critères du RGAA respectés"
							hintText="Format attendu : le nombre seul, sans le signe pourcentage. Exemple : “83”"
							nativeInputProps={{ min: 0, max: 100 }}
							readOnlyField={readOnly}
							required
						/>
					)}
				</form.AppField>
			</>
		);
	},
});

export const ToolsForm = withForm({
	...auditMultiStepFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<>
				<form.AppField name="usedTools">
					{(field) => {
						const extraTools = (field.state.value || []).filter(
							(tag) =>
								![...toolOptions]
									.map((option) => option.value as string)
									.includes(tag),
						);
						return (
							<div>
								<field.CheckboxGroupField
									legend="Outils utilisés pour évaluer l’accessibilité (facultatif)"
									options={[...toolOptions]}
									readOnlyField={readOnly}
								/>
								{!readOnly && (
									<field.TagGroupField
										label="Ajouter un outil"
										initialTags={extraTools}
									/>
								)}
							</div>
						);
					}}
				</form.AppField>
				<form.AppField name="testEnvironments">
					{(field) => {
						const extraTestEnvironments = (field.state.value || []).filter(
							(tag) =>
								![...testEnvironmentOptions]
									.map((option) => option.value as string)
									.includes(tag),
						);
						return (
							<div>
								<field.CheckboxGroupField
									legend="Environnement de tests"
									options={[...testEnvironmentOptions]}
									readOnlyField={readOnly}
								/>
								{!readOnly && (
									<field.TagGroupField
										label="Ajouter un environnement"
										initialTags={extraTestEnvironments}
									/>
								)}
							</div>
						);
					}}
				</form.AppField>
			</>
		);
	},
});

export const CompliantElementsForm = withForm({
	...auditMultiStepFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
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
						readOnlyField={readOnly}
						required
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
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
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
							readOnlyField={readOnly}
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
							readOnlyField={readOnly}
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
							textArea
							readOnlyField={readOnly}
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
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<form.AppField name="report">
				{(field) => (
					<field.TextField
						label="Rapport d’audit (facultatif)"
						hintText="Format attendu: https://www.example.fr"
						nativeInputProps={{ type: "url" }}
						readOnlyField={readOnly}
					/>
				)}
			</form.AppField>
		);
	},
});

export const AuditFlatForm = withForm({
	...auditMultiStepFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		const { classes } = useAuditFormStyles({ readOnly });
		return (
			<>
				<AuditRealisedForm form={form} readOnly={readOnly} />
				<form.Subscribe selector={(store) => store.values.isAuditRealised}>
					{(isAuditRealised) =>
						isAuditRealised && (
							<div className={classes.wrapperSections}>
								<div className={classes.section}>
									<AuditDateForm form={form} readOnly={readOnly} />
								</div>
								<div className={classes.section}>
									<ToolsForm form={form} readOnly={readOnly} />
								</div>
								<div className={classes.section}>
									<CompliantElementsForm form={form} readOnly={readOnly} />
								</div>
								<div className={classes.section}>
									<NonCompliantElementsForm form={form} readOnly={readOnly} />
								</div>
								<div className={classes.section}>
									<FilesForm form={form} readOnly={readOnly} />
								</div>
							</div>
						)
					}
				</form.Subscribe>
			</>
		);
	},
});

const useAuditFormStyles = tss
	.withName(AuditFlatForm.name)
	.withParams<{ readOnly: boolean }>()
	.create(({ readOnly }) => ({
		wrapperSections: {
			display: "flex",
			flexDirection: "column",
		},
		section: {
			marginTop: !readOnly ? fr.spacing("6v") : undefined,
			paddingTop: !readOnly ? fr.spacing("6v") : undefined,
			borderTopWidth: "7px",
			borderTopStyle: "solid",
			borderTopColor: fr.colors.decisions.border.default.grey.default,
		},
	}));
