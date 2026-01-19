import config from "@payload-config";
import type { GetServerSideProps } from "next";
import { getPayload } from "payload";
import type { ParsedUrlQuery } from "node:querystring";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { useRouter } from "next/router";
import { appKindOptions } from "~/payload/collections/Declaration";
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
} from "~/utils/payload-helper";

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

	const getConformityStatus = (rate: number): string => {
		if (rate < 50) {
			return "non conforme";
		}
		if (rate >= 50 && rate <= 99) {
			return "partiellement conforme";
		}

		return "conforme";
	};

	const hasNonCompliantElements = Boolean(
		declaration.audit.nonCompliantElements ||
			declaration.audit.disproportionnedCharge,
	);

	return (
		<section id="declaration-preview" className={classes.main}>
			<h1>Votre déclaration est prête à être publiée</h1>
			<p>Voici un aperçu de votre déclaration</p>
			<div className={classes.declarationPreview}>
				<h2>{declaration.name}</h2>
				<p>
					{declaration.entity.name} s’engage à rendre ses sites internet,
					intranet, extranet et ses progiciels accessibles (et ses applications
					mobiles et mobilier urbain numérique) conformément à l’article 47 de
					la loi n°2005-102 du 11 février 2005.
				</p>
				<p>
					À cette fin, {declaration.entity.name} met en œuvre la stratégie et
					les actions suivantes:
				</p>
				<ul>
					<li>
						Lien URL du schéma annuel à jour :{" "}
						{declaration.actionPlan.currentYearSchemaUrl} ;{" "}
					</li>
					<li>
						Lien URL du bilan des actions :{" "}
						{declaration.actionPlan.previousYearsSchemaUrl} ;
					</li>
				</ul>
				<p>
					Cette déclaration d’accessibilité s’applique au{" "}
					{
						appKindOptions.find(
							(option) => option.value === declaration.app_kind,
						)?.label
					}{" "}
					{declaration.url}
				</p>
				<h4>État de conformité</h4>
				<p>
					{declaration.entity.name} {declaration.url} est{" "}
					{getConformityStatus(declaration.audit.rate)} avec le référentiel
					général d’amélioration de l’accessibilité (RGAA), version{" "}
					{declaration.audit.rgaa_version}{" "}
					{hasNonCompliantElements &&
						"en raison des non-conformités et des dérogations énumérées ci-dessous"}
					.
				</p>
				<h4>Résultats des tests</h4>
				<p>
					L’audit de conformité réalisé par {declaration.audit.realisedBy}{" "}
					révèle que {declaration.audit.rate}% des critères du RGAA version{" "}
					{declaration.audit.rgaa_version} sont respectés
				</p>
				<h3>Contenus non accessibles</h3>
				<h4>Non-conformités</h4>
				<p style={{ whiteSpace: "pre-wrap" }}>
					{declaration.audit.nonCompliantElements}
				</p>
				<h4>Dérogations pour charge disproportionnée</h4>
				<p style={{ whiteSpace: "pre-wrap" }}>
					{declaration.audit.disproportionnedCharge}
				</p>
				<h4>Contenus non soumis à l’obligation d’accessibilité</h4>
				<p style={{ whiteSpace: "pre-wrap" }}>
					{declaration.audit.optionalElements}
				</p>
				<h3>Établissement de cette déclaration d’accessibilité</h3>
				<p>
					Cette déclaration a été établie le{" "}
					{new Date(declaration.createdAt).toLocaleDateString("fr-FR")}. Elle a
					été mise à jour le{" "}
					{new Date(declaration.updatedAt).toLocaleDateString("fr-FR")}.
				</p>
				<h3>Environnement de test</h3>
				<p>
					Les vérifications de restitution de contenus ont été réalisées sur la
					base de la combinaison fournie par la base de référence du RGAA, avec
					les versions suivantes :
				</p>
				<ul>
					{(declaration.audit.testEnvironments ?? []).map((env) => (
						<li key={env}>{env}</li>
					))}
				</ul>
				<h3>Outils pour évaluer l’accessibilité</h3>
				<ul>
					{(declaration.audit.toolsUsed ?? []).map((tech) => (
						<li key={tech.name}>{tech.name}</li>
					))}
				</ul>
				<h3>
					Pages du site ayant fait l’objet de la vérification de conformité
				</h3>
				<p style={{ whiteSpace: "pre-wrap" }}>
					{declaration.audit.compliantElements}
				</p>
				<h4>Retour d’information et contact</h4>
				<p>
					Si vous n’arrivez pas à accéder à un contenu ou à un service, vous
					pouvez contacter le responsable de Impôts particulier pour être
					orienté vers une alternative accessible ou obtenir le contenu sous une
					autre forme.
				</p>
				<ul>
					{declaration.contact.url && (
						<li>
							Envoyer un message sur le formulaire : {declaration.contact.url}
						</li>
					)}
					{declaration.contact.email && (
						<li>
							Contacter le responsable de l’accessibilité :{" "}
							{declaration.contact.email}
						</li>
					)}
				</ul>
				<h4>Voies de recours</h4>
				<p>
					Si vous constatez un défaut d’accessibilité vous empêchant d’accéder à
					un contenu ou une fonctionnalité du site, que vous nous le signalez et
					que vous ne parvenez pas à obtenir une réponse de notre part, vous
					êtes en droit de faire parvenir vos doléances ou une demande de
					saisine au Défenseur des droits. <br /> Plusieurs moyens sont à votre
					disposition :
				</p>
				<ul>
					<li>Écrire un message au Défenseur des droits</li>
					<li>
						Contacter le délégué du Défenseur des droits dans votre région
					</li>
					<li>
						<p>
							Envoyer un courrier par la poste (gratuit, ne pas mettre de
							timbre) : <br /> Défenseur des droits <br /> Libre réponse 71120{" "}
							<br /> 75342 Paris CEDEX 07
						</p>
					</li>
				</ul>
			</div>
			<div className={classes.buttonsContainer}>
				<Button priority="tertiary" onClick={() => router.back()}>
					Retour
				</Button>
				<Button
					priority="secondary"
					onClick={() =>
						router.push(`/dashboard/declaration/${declaration.id}`)
					}
				>
					Continuer sans publier
				</Button>
				<Button
					priority="primary"
					onClick={() =>
						router.push(`/dashboard/declaration/${declaration.id}/publish`)
					}
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
