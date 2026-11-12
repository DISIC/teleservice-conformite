import { CardGridSection } from "~/components/home/CardGridSection";

const REASONS = [
	{
		title: "Une obligation de déclaration pour tous les services publics",
		description:
			"Le RGAA 5 impose à tous les services numériques publics le dépôt de la déclaration d’accessibilité via le téléservice.",
		linkLabel:
			"En savoir plus sur la publication de la déclaration d’accessibilité",
		href: "#",
	},
	{
		title: "Un outil conçu pour répondre aux obligations légales",
		description:
			"Vos déclarations d’accessibilité sont générées au format réglementaire, et indiquent automatiquement la conformité du service, les contenus inaccessibles, ainsi que les moyens de contact et voies de recours éventuels.",
		linkLabel:
			"En savoir plus sur le contenu de la déclaration d’accessibilité",
		href: "#",
	},
];

export function WhySection() {
	return (
		<CardGridSection
			heading="Pourquoi utiliser le téléservice de déclaration ?"
			items={REASONS.map(({ title, ...reason }) => ({
				...reason,
				title: (
					<>
						<span aria-hidden="true">👉</span> {title}
					</>
				),
			}))}
			alert="Le téléservice de déclaration n’est pas un outil d’audit d’accessibilité."
		/>
	);
}
