import { ReadOnlyField } from "~/components/form/fields/ReadOnlyField";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
	appKindOptions,
} from "~/payload/selectOptions";

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
				value={
					appKindOptions.find((kind) => kind.value === declaration?.app_kind)
						?.label ?? ""
				}
			/>
			<ReadOnlyField
				label="Nom de la déclaration"
				value={declaration?.name ?? ""}
			/>
			<ReadOnlyField label="URL" value={declaration?.url ?? ""} link />
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
					link
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
					link
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

	const auditUsedTools =
		audit.usedTools?.map((tech: { name: string }) => {
			const existingTool = toolOptions.find((tool) => tool.value === tech.name);

			return existingTool ? existingTool.label : tech.name;
		}) ?? [];

	const auditTestEnvironments =
		audit.testEnvironments?.map((tech: { name: string }) => {
			const existingTool = testEnvironmentOptions.find(
				(tool) => tool.value === tech.name,
			);

			return existingTool ? existingTool.label : tech.name;
		}) ?? [];

	const auditRgaaVersion = rgaaVersionOptions.find(
		(version) => version.value === audit.rgaa_version,
	)?.label;

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
				value={auditRgaaVersion ?? ""}
			/>
			<ReadOnlyField
				label="Résultats"
				value={audit.rate !== undefined ? `${audit.rate}%` : ""}
			/>
			{audit?.technologies?.length ? (
				<ReadOnlyField
					label="Technologies"
					value={audit.technologies?.map((tech) => tech.name) ?? []}
				/>
			) : null}
			<ReadOnlyField
				label="Outils utilisés pour évaluer l’accessibilité"
				value={auditUsedTools}
			/>
			<ReadOnlyField
				label="Environnements de tests"
				value={auditTestEnvironments}
			/>
			<ReadOnlyField
				label="Éléments ayant fait l’objet de vérification"
				value={audit.compliantElements ?? ""}
				textArea
				addSectionBorder
			/>
			<ReadOnlyField
				label="Éléments non conformes"
				value={audit.nonCompliantElements ?? ""}
				textArea
				addSectionBorder
			/>
			<ReadOnlyField
				label="Éléments avec dérogation pour charge disproportionnée"
				value={audit.disproportionnedCharge ?? ""}
				textArea
			/>
			<ReadOnlyField
				label="Éléments optionnels"
				value={audit.optionalElements ?? ""}
				textArea
			/>
			<ReadOnlyField
				addSectionBorder
				label="Rapport d'audit"
				value={audit.auditReport ?? ""}
				link
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
			{url && <ReadOnlyField label="Lien URL du formulaire" value={url} link />}
			{email && <ReadOnlyField label="E-mail" value={email} />}
		</>
	);
};
