import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useRouter } from "next/router";
import { appKindOptions } from "~/payload/selectOptions";
import type {
	Entity,
	Audit,
	Contact,
	ActionPlan,
	User,
} from "~/payload/payload-types";

import {
	getDeclarationById,
	type PopulatedDeclaration,
} from "~/server/api/utils/payload-helper";
import { getConformityStatus } from "~/utils/declaration-helper";
import { rgaaVersionOptions } from "~/payload/selectOptions";
import DeclarationMarkdownToJsx from "~/components/declaration/DeclarationMarkdownToJsx";
import { api } from "~/utils/api";

type RequiredPopulatedDeclaration = Omit<
	PopulatedDeclaration,
	"audit" | "contact" | "entity" | "actionPlan" | "created_by"
> & {
	audit: Audit;
	contact: Contact;
	entity: Entity;
	actionPlan: ActionPlan;
	created_by: User;
};

export default function DeclarationPreviewPage({
	declaration,
}: { declaration: RequiredPopulatedDeclaration }) {
	const { classes } = useStyles();
	const router = useRouter();

	const previewMd = `# ${declaration.name}
${declaration.entity.name} s’engage à rendre ses sites internet, intranet, extranet et ses progiciels accessibles (et ses applications mobiles et mobilier urbain numérique) conformément à  l’article 47 de la loi n°2005-102 du 11 février 2005.
À cette fin, ${declaration.entity.name} met en œuvre la stratégie et les actions suivantes :

- Lien URL du schéma annuel à jour : ${declaration.actionPlan.currentYearSchemaUrl ?? ""};

- Lien URL du bilan des actions : ${declaration.actionPlan.previousYearsSchemaUrl ?? ""};

Cette déclaration d’accessibilité s’applique au ${appKindOptions.find((option) => option.value === declaration.app_kind)?.label ?? ""} ${declaration.url}

### État de conformité
${declaration.entity.name} ${declaration.url} est ${getConformityStatus(declaration.audit.rate)} avec le référentiel général d’amélioration de l’accessibilité  (RGAA), version ${rgaaVersionOptions.find((version) => version.value === declaration.audit.rgaa_version)?.label} en raison des non-conformités et des dérogations  énumérées ci-dessous.

### Résultats des tests
L’audit de conformité réalisé par ${declaration.audit.realisedBy} révèle que ${declaration.audit.rate}% des critères de la version ${rgaaVersionOptions.find((version) => version.value === declaration.audit.rgaa_version)?.label} sont respectés 

## Contenus non accessibles
### Non-conformités
${declaration.audit.nonCompliantElements}

### Dérogations pour charge disproportionnée
${declaration.audit.disproportionnedCharge}

### Contenus non soumis à l’obligation d’accessibilité
${declaration.audit.optionalElements}

## Établissement de cette déclaration d’accessibilité
Cette déclaration a été établie le ${new Date(declaration.createdAt).toLocaleDateString("fr-FR")}. Elle a été mise à jour le ${new Date(declaration.updatedAt).toLocaleDateString("fr-FR")}.

### Technologies utilisées pour la réalisation du site
${declaration?.audit?.technologies?.map((tech) => `- ${tech.name}`).join("\n")}

### Environnement de test
Les vérifications de restitution de contenus ont été réalisées sur la base de la combinaison fournie par la base de référence du RGAA, avec  les versions suivantes :
${(declaration.audit.testEnvironments ?? []).map((env) => `- ${env}`).join("\n")}

### Outils pour évaluer l’accessibilité
${(declaration.audit.usedTools ?? []).map((tech) => `- ${tech.name}`).join("\n")}

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

	const { mutateAsync: publishDeclaration } =
		api.declaration.updatePublishedContent.useMutation({
			onSuccess: () => {
				router.push(`/declaration/${declaration.id}/publish`);
			},
			onError: (error) => {
				console.error("Error publishing declaration:", error);
			},
		});

	const onPublish = () => {
		try {
			publishDeclaration({
				id: declaration.id,
				content: previewMd,
			});
		} catch (error) {
			return;
		}
	};

	return (
		<section id="declaration-preview" className={classes.main}>
			<h1>Votre déclaration est prête à être publiée</h1>
			<p>Voici un aperçu de votre déclaration</p>
			<div className={classes.declarationPreview}>
				<DeclarationMarkdownToJsx content={previewMd} mode="preview" />
			</div>
			<div className={classes.buttonsContainer}>
				<Button priority="tertiary" onClick={() => router.back()}>
					Retour
				</Button>
				<Button
					priority="secondary"
					linkProps={{
						href: `/dashboard/declaration/${declaration.id}`,
					}}
				>
					Continuer sans publier
				</Button>
				<Button
					priority="primary"
					linkProps={{
						href: `/dashboard/declaration/${declaration.id}`,
					}}
				>
					Publier la déclaration
				</Button>
			</div>
		</section>
	);
}

const useStyles = tss.withName(DeclarationPreviewPage.name).create({
	main: {
		marginTop: fr.spacing("10v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4w"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		padding: fr.spacing("6w"),
	},
	declarationPreview: {
		backgroundColor: fr.colors.decisions.background.default.grey.default,
		padding: fr.spacing("4w"),
	},
	buttonsContainer: {
		display: "grid",
		gridTemplateColumns: "1fr auto auto",
		gap: fr.spacing("4v"),
	},
});

interface Params extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params as Params;

	if (!id || typeof id !== "string") {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	const payload = await getPayload({ config });

	const declaration = await getDeclarationById(payload, Number.parseInt(id));

	const { audit, contact, entity, actionPlan, created_by } = declaration || {};

	if (!declaration) {
		return {
			props: {},
			redirect: { destination: "/dashboard" },
		};
	}

	if (!audit || !contact || !entity || !actionPlan || !created_by) {
		return {
			props: {},
			redirect: { destination: `/dashboard/declaration/${declaration.id}` },
		};
	}

	return {
		props: {
			declaration,
		},
	};
};
