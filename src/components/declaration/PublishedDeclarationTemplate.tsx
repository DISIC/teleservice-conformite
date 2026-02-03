import DeclarationMarkdownToJsx from "~/components/declaration/DeclarationMarkdownToJsx";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { getConformityStatus } from "~/utils/declaration-helper";
import {
	rgaaVersionOptions,
	testEnvironmentOptions,
	toolOptions,
	appKindOptions,
} from "~/payload/selectOptions";

export const extractDeclarationContentToPublish = (
	declaration: PopulatedDeclaration,
): PublishedDeclaration => {
	return {
		name: declaration.name ?? "",
		entityName: declaration.entity?.name ?? "",
		actionPlan: {
			currentYearSchemaUrl: declaration?.actionPlan?.currentYearSchemaUrl ?? "",
			previousYearsSchemaUrl:
				declaration?.actionPlan?.previousYearsSchemaUrl ?? "",
		},
		appKindLabel:
			appKindOptions.find((kind) => kind.value === declaration.app_kind)
				?.label ?? "",
		url: declaration?.url ?? "",
		audit: {
			rgaa_version:
				rgaaVersionOptions.find(
					(option) => option.value === declaration?.audit?.rgaa_version,
				)?.label ?? "RGAA 4",
			realised_by: declaration.audit?.realisedBy ?? "",
			rate: declaration.audit?.rate ?? 0,
			nonCompliantElements: declaration?.audit?.nonCompliantElements ?? "",
			disproportionnedCharge: declaration?.audit?.disproportionnedCharge ?? "",
			optionalElements: declaration?.audit?.optionalElements ?? "",
			compliantElements: declaration?.audit?.compliantElements ?? "",
			technologies: declaration?.audit?.technologies ?? [],
			testEnvironments:
				(declaration?.audit?.usedTools ?? [])?.map(
					(tool) =>
						testEnvironmentOptions.find((option) => option.value === tool.name)
							?.label ?? tool.name,
				) ?? [],
			usedTools:
				(declaration?.audit?.usedTools ?? [])?.map(
					(tool) =>
						toolOptions.find((option) => option.value === tool.name)?.label ??
						tool.name,
				) ?? [],
		},
		contact: {
			url: declaration.contact?.url ?? "",
			email: declaration.contact?.email ?? "",
		},
	};
};

export type PublishedDeclaration = {
	name: string;
	entityName: string;
	actionPlan: {
		currentYearSchemaUrl: string;
		previousYearsSchemaUrl: string;
	};
	appKindLabel: string;
	url: string;
	audit: {
		rgaa_version: string | undefined;
		realised_by: string;
		rate: number;
		nonCompliantElements: string | null;
		disproportionnedCharge: string | null;
		optionalElements: string | null;
		compliantElements: string;
		technologies: { name: string }[];
		testEnvironments: string[];
		usedTools: string[];
	};
	contact: {
		url: string | null;
		email: string | null;
	};
};

export default function PublishedDeclarationTemplate({
	declaration,
}: { declaration: PublishedDeclaration }) {
	const previewMd = `# ${declaration.name}
  ${declaration.entityName} s’engage à rendre ses sites internet, intranet, extranet et ses progiciels accessibles (et ses applications mobiles et mobilier urbain numérique) conformément à  l’article 47 de la loi n°2005-102 du 11 février 2005.
  À cette fin, ${declaration.entityName} met en œuvre la stratégie et les actions suivantes :
  
  - Lien URL du schéma annuel à jour : ${declaration.actionPlan.currentYearSchemaUrl ?? ""};
  
  - Lien URL du bilan des actions : ${declaration.actionPlan.previousYearsSchemaUrl ?? ""};
  
  Cette déclaration d’accessibilité s’applique au ${declaration.appKindLabel} ${declaration.url}
  
  ### État de conformité
  ${declaration.entityName} ${declaration.url} est ${getConformityStatus(declaration.audit.rate)} avec le référentiel général d’amélioration de l’accessibilité  (RGAA), version ${declaration.audit.rgaa_version} en raison des non-conformités et des dérogations  énumérées ci-dessous.
  
  ### Résultats des tests
  L’audit de conformité réalisé par ${declaration.audit.realised_by} révèle que ${declaration.audit.rate}% des critères de la version ${declaration.audit.rgaa_version} sont respectés 
  
  ## Contenus non accessibles
  ### Non-conformités
  ${declaration.audit.nonCompliantElements}
  
  ### Dérogations pour charge disproportionnée
  ${declaration.audit.disproportionnedCharge}
  
  ### Contenus non soumis à l’obligation d’accessibilité
  ${declaration.audit.optionalElements}
  
  ## Établissement de cette déclaration d’accessibilité
  Cette déclaration a été établie le ${new Date().toLocaleDateString("fr-FR")}. Elle a été mise à jour le ${new Date().toLocaleDateString("fr-FR")}.
  
  ### Technologies utilisées pour la réalisation du site
  ${declaration?.audit?.technologies?.map((tech) => `- ${tech.name}`).join("\n")}
  
  ### Environnement de test
  Les vérifications de restitution de contenus ont été réalisées sur la base de la combinaison fournie par la base de référence du RGAA, avec  les versions suivantes :
  ${(declaration.audit.testEnvironments ?? []).map((env) => `- ${env}`).join("\n")}
  
  ### Outils pour évaluer l’accessibilité
  ${(declaration.audit.usedTools ?? []).map((tool) => `- ${tool}`).join("\n")}
  
  ### Pages du site ayant fait l’objet de la vérification de conformité
  ${declaration.audit.compliantElements}
  
  ## Retour d’information et contact
  Si vous n’arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable de Impôts particulier pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme.
  ${declaration.contact.url ? `- Envoyer un message sur le formulaire : ${declaration.contact.url}` : ""}
  
  ${declaration.contact.email ? `- Contacter le responsable de l’accessibilité : ${declaration.contact.email}` : ""}
  
  ## Voies de recours
  Si vous constatez un défaut d’accessibilité vous empêchant d’accéder à un contenu ou une fonctionnalité du site, que vous nous le signalez et  que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes  en droit de faire parvenir vos doléances ou une demande de saisine au  Défenseur des droits.
  Plusieurs moyens sont à votre disposition :
  - Écrire un message au Défenseur des droits
  - Contacter le délégué du Défenseur des droits dans votre région
  - Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) :
  
    Défenseur des droits
    
    Libre réponse 71120
    
    75342 Paris CEDEX 07`;

	return <DeclarationMarkdownToJsx content={previewMd} mode="preview" />;
}
