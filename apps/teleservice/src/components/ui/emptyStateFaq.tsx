import type { FaqItem } from "~/components/ui/EmptyState";
import { newTabLinkProps } from "~/lib/newTabLink";

export const DECLARATION_FAQ: FaqItem[] = [
	{
		question:
			"Je n’ai pas fait d’audit d’accessibilité, dois-je quand même utiliser le téléservice de déclaration d’accessibilité numérique ?",
		answer: (
			<p>
				Oui, tous les sites et applications mobiles en production doivent être
				référencés sur le téléservice de déclaration,{" "}
				<strong>
					y compris ceux qui n’ont pas encore fait l’objet d’un audit
					d’accessibilité.
				</strong>
			</p>
		),
	},
	{
		question:
			"Quels documents faut-il préparer avant d’utiliser le téléservice de déclaration d’accessibilité numérique ?",
		answer: (
			<>
				<p>Si vous les possédez, pensez à préparer :</p>
				<br />
				<ul>
					<li>votre déclaration d’accessibilité existante,</li>
					<li>l’URL du schéma pluriannuel,</li>
					<li>l’URL du ou des plans d’actions.</li>
				</ul>
			</>
		),
	},
];

export const CONTACT_FAQ: FaqItem[] = [
	{
		question: "Qu’est-ce qu’un point de contact accessibilité ?",
		answer: (
			<p>
				Un point de contact accessibilité permet aux usagers de{" "}
				<strong>signaler un défaut d’accessibilité.</strong> Il sera affiché sur
				la déclaration d’accessibilité. Les voies de recours seront ajoutées
				automatiquement à la déclaration, vous n’avez rien à faire.
			</p>
		),
	},
];

export const SCHEMA_FAQ: FaqItem[] = [
	{
		question: "Qu’est-ce qu’un schéma pluriannuel ?",
		answer: (
			<>
				C’est une feuille de route d'une durée maximale de 3 ans : elle définit
				la politique d'accessibilité de l'entité et s'appuie sur des plans
				d'actions annuels.
				<br />
				Il est obligatoire pour les services de l’État, les collectivités
				territoriales, les établissements publics et certaines entreprises
				privées.
				<br />
				<br />
				<a
					href="https://accessibilite.numerique.gouv.fr/obligations/schema-pluriannuel/"
					{...newTabLinkProps("En savoir plus sur le schéma pluriannuel")}
				>
					En savoir plus sur le schéma pluriannuel
				</a>
			</>
		),
	},
];
