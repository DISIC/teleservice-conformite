import { fr } from "@codegouvfr/react-dsfr";
import NextLink from "next/link";
import { createModal } from "@codegouvfr/react-dsfr/Modal";

import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import { withForm } from "../context";
import { auditMultiStepFormOptions } from "./schema";
import ExemptionListModalContent from "~/components/modal/ExemptionListContent";
import DisproportionnedChargeContent from "~/components/modal/DisproportionnedChargeContent";

export const AuditRealisedForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<form.AppField name="isAuditRealised">
				{(field) => (
					<field.RadioField
						label="Avez-vous réalisé un audit d’accessibilité de votre service numérique ?"
						description="Un audit d’accessibilité évalue votre service numérique selon le RGAA afin d’identifier les non-conformités et les points à améliorer. Il peut être réalisé par un prestataire externe."
						options={[
							{ label: "Oui", value: true },
							{ label: "Non", value: false },
						]}
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
							kind="date"
							label="Date de réalisation de l'audit"
							max={new Date().toISOString().split("T")[0]}
						/>
					)}
				</form.AppField>
				<form.AppField name="realisedBy">
					{(field) => (
						<field.TextField
							label="Entité ou personne ayant réalisé l’audit"
							description='Exemple : "Agence Audit", "Mme Hélène Belanyt"'
						/>
					)}
				</form.AppField>
				<form.AppField name="rgaa_version">
					{(field) => (
						<field.RadioField
							label="Version du référentiel RGAA utilisée"
							options={rgaaVersionOptions.map((option) => ({
								label: option.label,
								value: option.value,
							}))}
						/>
					)}
				</form.AppField>
				<form.AppField name="rate">
					{(field) => (
						<field.NumberField
							label="Pourcentage de critères du RGAA respectés"
							description="Format attendu : le nombre seul, sans le signe pourcentage. Exemple : “83”"
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
								initialTags={field.state.value?.filter(
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
								initialTags={field.state.value.filter(
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
						description={
							<>
								Renseignez le nom de chaque élément. Pour un site web,
								renseignez également l’URL.
								<br /> L’URL reste facultative pour un intranet, extranet ou si
								elle ne peut pas être communiquée pour des raisons de sécurité.
								<br />
								Exemple : 'Accueil - https://www.nomdelapage/accueil'
							</>
						}
						kind="text"
						textArea
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
		return (
			<>
				<form.AppField name="nonCompliantElements">
					{(field) => (
						<field.TextField
							label="Éléments non conformes (facultatif)"
							description={
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
							kind="text"
							textArea
						/>
					)}
				</form.AppField>
				<form.AppField name="optionalElements">
					{(field) => (
						<field.TextField
							label="Éléments non soumis à l’obligation d’accessibilité (facultatif)"
							description={
								<>
									<NextLink
										style={{
											color: fr.colors.decisions.text.active.blueFrance.default,
										}}
										onClick={(e) => {
											e.preventDefault();
											exemptionListmodal.open();
										}}
										href="#"
									>
										Liste des contenus non soumis à l’obligation d’accessibilité
									</NextLink>
									<exemptionListmodal.Component title="">
										<ExemptionListModalContent />
									</exemptionListmodal.Component>
									<br />
									Format attendu : Listez les éléments exemptés les uns à la
									suite des autres
								</>
							}
							kind="text"
							textArea
						/>
					)}
				</form.AppField>
				<form.AppField name="disproportionnedCharge">
					{(field) => (
						<field.TextField
							label="Éléments avec dérogation pour charge disproportionnée (facultatif)"
							description={
								<>
									<NextLink
										style={{
											color: fr.colors.decisions.text.active.blueFrance.default,
										}}
										onClick={(e) => {
											e.preventDefault();
											disproportionnedChargeModal.open();
										}}
										href="#"
									>
										Qu’est-ce qu’une charge disproportionnée ?
									</NextLink>
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

export const FilesForm = withForm({
	...auditMultiStepFormOptions,
	render: function Render({ form }) {
		return (
			<>
				<form.AppField name="report">
					{(field) => (
						<field.TextField
							label="Rapport d’audit (facultatif)"
							description="Format attendu: https://www.example.fr"
						/>
					)}
				</form.AppField>
			</>
		);
	},
});
