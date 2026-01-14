import { ReadOnlyField } from "~/components/form/fields/ReadOnlyField";
import type { DeclarationWithPopulated } from "~/utils/payload-helper";

export const ReadOnlyDeclarationGeneral = ({
	declaration,
}: { declaration: DeclarationWithPopulated | null }) => {
	return (
		<>
			<ReadOnlyField
				label="Administration"
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
				label="Secteur d’activité de l’entité"
				value={declaration?.entity?.kind ?? ""}
			/>
		</>
	);
};

export const ReadOnlyDeclarationSchema = ({
	declaration,
}: { declaration: DeclarationWithPopulated | null }) => {
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
}: { declaration: DeclarationWithPopulated | null }) => {
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
			/>
			<ReadOnlyField
				label="Éléments non conformes"
				value={audit.nonCompliantElements || "Non"}
				textArea
			/>
			<ReadOnlyField
				label="Éléments avec dérogation pour charge disproportionnée : "
				value={audit.disproportionnedCharge || "Non"}
				textArea
			/>
			<ReadOnlyField
				label="Éléments optionnels"
				value={audit.optionalElements || "Non"}
				textArea
			/>
			<ReadOnlyField
				label="Rapport d'audit"
				value={audit.auditReport || "Non"}
			/>
		</>
	);
};

export const ReadOnlyDeclarationContact = ({
	declaration,
}: { declaration: DeclarationWithPopulated | null }) => {
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
