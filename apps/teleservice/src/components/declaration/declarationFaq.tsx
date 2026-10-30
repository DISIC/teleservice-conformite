import type { FaqItem } from "~/components/ui/EmptyState";

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
