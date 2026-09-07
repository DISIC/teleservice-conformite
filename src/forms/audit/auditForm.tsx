import Error from "@codegouvfr/react-dsfr/picto/Error";
import { Part } from "~/components/form/Part";
import { AuditNotice } from "~/components/ui/AuditNotice";
import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
} from "~/payload/selectOptions";
import { withForm } from "../context";
import {
	auditGeneralFormOptions,
	auditContentsFormOptions,
	auditNonConformitiesFormOptions,
	auditToolsFormOptions,
} from "./auditSchema";

/**
 * Shown in place of a `requiresRealised` Sub-section's fields when the audit
 * has not been declared as realised. The Sub-section stays visible in the
 * SideMenu but has nothing to fill — `useAuditSubSection` also hides its action
 * buttons via `hideActions`.
 */
function AuditNotRealisedNotice() {
	return (
		<AuditNotice Pictogram={Error} heading="Aucun audit n’a été réalisé.">
			<span>
				En l’absence d’audit de conformité, cette rubrique n’est pas applicable.
				S’il n’existe aucun résultat d’audit en cours de validité permettant de
				mesurer le respect des critères, le service est réputé non conforme.
			</span>
			<a
				href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/conformite/#audit"
				target="_blank"
				rel="noopener noreferrer"
				title="Lien vers le texte de loi, nouvelle fenêtre"
				style={{ width: "fit-content" }}
			>
				Lien vers le texte de loi ↗️
			</a>
		</AuditNotice>
	);
}

export const AuditGeneralForm = withForm({
	...auditGeneralFormOptions,
	props: { readOnly: false },
	render: function Render({ form, readOnly }) {
		return (
			<Part
				readOnly={readOnly}
				title="Audit d’accessibilité du service numérique"
			>
				{!readOnly && (
					<form.AppField name="isAuditRealised">
						{(field) => (
							<field.RadioField
								legend="Avez-vous réalisé un audit d’accessibilité de votre service numérique ?"
								hintText="Un audit d’accessibilité évalue votre service numérique selon le RGAA afin d’identifier les non-conformités et les points à améliorer. Il peut être réalisé par un prestataire externe."
								options={[
									{ label: "Oui", value: true },
									{ label: "Non", value: false },
								]}
								// Answering "Non" discards the realised-audit details so that
								// re-answering "Oui" starts from a blank slate.
								onOptionChange={(value) => {
									if (value === false) {
										form.setFieldValue("date", "");
										form.setFieldValue("realisedBy", "");
										form.setFieldValue("rgaa_version", "rgaa_4");
										form.setFieldValue("rate", null);
									}
								}}
								required
							/>
						)}
					</form.AppField>
				)}
				<form.Subscribe selector={(state) => state.values.isAuditRealised}>
					{(isAuditRealised) =>
						isAuditRealised === true && (
							<>
								<form.AppField name="date">
									{(field) => (
										<field.TextField
											label={`Date de réalisation de l'audit ${!readOnly ? "(facultatif)" : ""}`}
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
											label={
												readOnly
													? "Pourcentage de critères du RGAA respectés"
													: "Taux de conformité global"
											}
											hintText={
												<>
													Indiquez le pourcentage de critères du RGAA respectés
													<br />
													Format attendu : le nombre seul, sans le signe
													pourcentage. Exemple : “83” ou “83,45”.
												</>
											}
											nativeInputProps={{ min: 0, max: 100 }}
											readOnlyField={readOnly}
											required
										/>
									)}
								</form.AppField>
							</>
						)
					}
				</form.Subscribe>
			</Part>
		);
	},
});

export const ToolsForm = withForm({
	...auditToolsFormOptions,
	props: { readOnly: false, showNotice: false },
	render: function Render({ form, readOnly, showNotice }) {
		if (showNotice) return <AuditNotRealisedNotice />;
		return (
			<>
				<Part readOnly={readOnly} title="Outils d'assistances" grid={false}>
					<form.AppField name="usedTools">
						{(field) => {
							const extraTools = (field.state.value || []).filter(
								(tag) =>
									![...toolOptions]
										.map((option) => option.value as string)
										.includes(tag),
							);
							return (
								<>
									<field.CheckboxGroupField
										legend={
											!readOnly
												? "Liste des outils utilisés pour évaluer l’accessibilité"
												: undefined
										}
										options={[...toolOptions]}
										readOnlyField={readOnly}
										required
									/>
									{!readOnly && (
										<field.TagGroupField
											label="Ajouter un outil"
											initialTags={extraTools}
										/>
									)}
								</>
							);
						}}
					</form.AppField>
				</Part>
				<Part readOnly={readOnly} title="Environnements de tests" grid={false}>
					<form.AppField name="testEnvironments">
						{(field) => {
							const extraTestEnvironments = (field.state.value || []).filter(
								(tag) =>
									![...testEnvironmentOptions]
										.map((option) => option.value as string)
										.includes(tag),
							);
							return (
								<>
									<field.CheckboxGroupField
										legend={
											!readOnly
												? "Liste des environnements utilisés pour évaluer l’accessibilité"
												: undefined
										}
										options={[...testEnvironmentOptions]}
										readOnlyField={readOnly}
										required
									/>
									{!readOnly && (
										<field.TagGroupField
											label="Ajouter un environnement"
											initialTags={extraTestEnvironments}
										/>
									)}
								</>
							);
						}}
					</form.AppField>
				</Part>
			</>
		);
	},
});

export const CompliantElementsForm = withForm({
	...auditContentsFormOptions,
	props: { readOnly: false, showNotice: false },
	render: function Render({ form, readOnly, showNotice }) {
		if (showNotice) return <AuditNotRealisedNotice />;
		return (
			<Part
				readOnly={readOnly}
				title={
					readOnly
						? "Éléments ayant fait l’objet de la vérification de conformité"
						: undefined
				}
				grid={false}
			>
				<form.AppField name="compliantElements">
					{(field) => (
						<field.TextField
							label={
								!readOnly
									? "Éléments ayant fait l’objet de la vérification de conformité"
									: undefined
							}
							textArea
							hintText={
								<>
									Renseignez le nom de chaque élément. Pour un site web,
									renseignez également l’URL.
									<br /> L’URL reste facultative pour un intranet, extranet ou
									si elle ne peut pas être communiquée pour des raisons de
									sécurité.
									<br />
									Exemple : 'Accueil - https://www.nomdelapage/accueil'
								</>
							}
							readOnlyField={readOnly}
							required
						/>
					)}
				</form.AppField>
			</Part>
		);
	},
});

export const NonCompliantElementsForm = withForm({
	...auditNonConformitiesFormOptions,
	props: { readOnly: false, showNotice: false, showNonConformities: true },
	render: function Render({ form, readOnly, showNotice, showNonConformities }) {
		if (showNotice) return <AuditNotRealisedNotice />;
		return (
			<>
				{showNonConformities && (
					<Part readOnly={readOnly} title="Non conformités" grid={false}>
						<form.AppField name="nonCompliantElements">
							{(field) => (
								<field.TextField
									label={
										!readOnly
											? "Éléments non conformes (facultatif)"
											: undefined
									}
									textArea
									hintText={
										<>
											Exemples : Vidéo sans transcription, navigation au clavier
											impossible, ...
											<br />
											Précisez les points non conformes et leur volume en
											utilisant les mentions “quelques / la plupart des /
											aucun(e)”. Vous pouvez trouver ces informations dans votre
											déclaration existante ou votre audit.
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
					</Part>
				)}
				<Part readOnly={readOnly} title="Dérogations" grid={false}>
					<form.AppField name="optionalElements">
						{(field) => (
							<field.TextField
								label={
									!readOnly
										? "Éléments non soumis à l’obligation d’accessibilité (si concerné)"
										: "Dérogations pour charge disproportionnée"
								}
								textArea
								hintText={
									<>
										<a
											href="https://accessibilite.numerique.gouv.fr/obligations/champ-application/"
											target="_blank"
											rel="noopener noreferrer"
											title="Liste des contenus non soumis à l’obligation d’accessibilité, nouvelle fenêtre"
										>
											Liste des contenus non soumis à l’obligation
											d’accessibilité ↗️
										</a>
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
								label={
									!readOnly
										? "Éléments avec dérogation pour charge disproportionnée (si concerné)"
										: "Contenus non soumis à l’obligation d’accessibilité"
								}
								hintText={
									<>
										<a
											href="https://accessibilite.numerique.gouv.fr/obligations/champ-application/"
											target="_blank"
											rel="noopener noreferrer"
											title="Qu’est-ce qu’une charge disproportionnée ?, nouvelle fenêtre"
										>
											Qu’est-ce qu’une charge disproportionnée ? ↗️
										</a>
										<br />
										Renseigner, pour chaque élément, son nom, la raison de la
										dérogation et l’alternative accessible proposée.
										<br />
										Exemple : “- Carte IGN de la région, trop complexe et
										couteux à rendre accessible. Alternative : Application
										mobile avec lecture du relief”
									</>
								}
								textArea
								readOnlyField={readOnly}
							/>
						)}
					</form.AppField>
				</Part>
			</>
		);
	},
});
