import { ReadOnlyField } from "~/components/form/fields/ReadOnlyField";
import type { PopulatedDeclaration } from "~/utils/payload-helper";

export const ReadOnlyDeclarationGeneral = ({
	declaration,
}: { declaration: PopulatedDeclaration | null }) => {
	return (
		<>
			<ReadOnlyField
				label="Organisation"
				value={declaration?.entity?.name ?? ""}
			/>
			<ReadOnlyField
				label="Type de produit numérique"
				value={declaration?.app_kind ?? ""}
			/>
			<ReadOnlyField
				label="Nom de la déclaration"
				value={declaration?.name ?? ""}
			/>
			<ReadOnlyField label="URL" value={declaration?.url ?? ""} />
			<ReadOnlyField
				label="Secteur d’activité de l’organisation"
				value={declaration?.entity?.kind ?? ""}
			/>
		</>
	);
};

export const ReadOnlyDeclarationSchema = ({
	declaration,
}: { declaration: PopulatedDeclaration | null }) => {
	const currentYearSchemaUrl =
		declaration?.actionPlan?.currentYearSchemaUrl ?? "";
	const previousYearsSchemaUrl =
		declaration?.actionPlan?.previousYearsSchemaUrl ?? "";

	return (
		<>
			<ReadOnlyField
				label="Réalisation d’un schéma annuel - année en cours"
				value={currentYearSchemaUrl ? "Oui" : "Non"}
			/>
			{currentYearSchemaUrl && (
				<ReadOnlyField
					label="Lien du schéma annuel"
					value={currentYearSchemaUrl}
				/>
			)}
			<ReadOnlyField
				label="Réalisation d’un schéma annuel - années précédentes"
				value={previousYearsSchemaUrl ? "Oui" : "Non"}
				addSectionBorder
			/>
			{previousYearsSchemaUrl && (
				<ReadOnlyField
					label="Lien du bilan des actions"
					value={previousYearsSchemaUrl}
				/>
			)}
		</>
	);
};

export const ReadOnlyDeclarationAudit = ({
	declaration,
}: { declaration: PopulatedDeclaration | null }) => {
	const audit = declaration?.audit;

	if (!audit) {
		return <ReadOnlyField label="Audit réalisé" value="Non" />;
	}

	return (
		<>
			<ReadOnlyField label="Audit réalisé" value="Oui" />
			<ReadOnlyField
				label="Entité ou personne ayant réalisé l’audit"
				value={audit.realisedBy ?? ""}
				addSectionBorder
			/>
			<ReadOnlyField
				label="Référentiel RGAA utilisé"
				value={audit.rgaa_version || ""}
			/>
			<ReadOnlyField
				label="Résultats"
				value={audit.rate !== undefined ? `${audit.rate}%` : ""}
			/>
			<ReadOnlyField
				label="Outils utilisés pour évaluer l’accessibilité"
				value={audit.toolsUsed?.map((tech) => tech.name) || []}
			/>
			<ReadOnlyField
				label="Environnements de tests"
				value={audit.testEnvironments || []}
			/>
			<ReadOnlyField
				label="Éléments ayant fait l’objet de vérification"
				value={audit.compliantElements || ""}
				textArea
				addSectionBorder
			/>
			<ReadOnlyField
				label="Éléments non conformes"
				value={audit.nonCompliantElements || "Non"}
				textArea
				addSectionBorder
			/>
			<ReadOnlyField
				label="Éléments avec dérogation pour charge disproportionnée"
				value={audit.disproportionnedCharge || "Non"}
				textArea
			/>
			<ReadOnlyField
				label="Éléments optionnels"
				value={audit.optionalElements || "Non"}
				textArea
			/>
			<ReadOnlyField
				addSectionBorder
				label="Rapport d'audit"
				value={audit.auditReport || "Non"}
			/>
		</>
	);
};

export const ReadOnlyDeclarationContact = ({
	declaration,
}: { declaration: PopulatedDeclaration | null }) => {
	const email = declaration?.contact?.email ?? "";
	const url = declaration?.contact?.url ?? "";
	const contactOptions = [];

	if (email) contactOptions.push("Point de contact");
	if (url) contactOptions.push("Formulaire en ligne");

	return (
		<>
			<ReadOnlyField
				label="Moyen de contact"
				value={contactOptions.join(", ")}
			/>
			{url && <ReadOnlyField label="Lien URL du formulaire" value={url} />}
			{email && <ReadOnlyField label="E-mail" value={email} />}
		</>
	);
};
