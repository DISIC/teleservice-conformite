import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { appKindOptions } from "~/payload/selectOptions";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

type StatsCardsProps = {
	declaration: PopulatedDeclaration;
};

function formatDate(value: string | null | undefined): string {
	if (!value) return "—";
	return new Date(value).toLocaleDateString("fr-FR");
}

function formatRate(rate: number | null | undefined): string {
	if (rate === undefined || rate === null) return "—";
	return `${rate}%`;
}

function getAppKindLabel(value: PopulatedDeclaration["app_kind"]): string {
	return appKindOptions.find((o) => o.value === value)?.label ?? "—";
}

export function StatsCards({ declaration }: StatsCardsProps) {
	const { classes } = useStyles();

	const cards = [
		{ label: "Type de service", value: getAppKindLabel(declaration.app_kind) },
		{ label: "Dernière mise à jour", value: formatDate(declaration.updatedAt) },
		{ label: "Taux de conformité", value: formatRate(declaration.audit?.rate) },
	];

	return (
		<div className={classes.grid}>
			{cards.map((card) => (
				<div key={card.label} className={classes.card}>
					<p className={fr.cx("fr-mb-0", "fr-text--sm")}>{card.label}</p>
					<p
						className={fr.cx("fr-mb-0", "fr-text--lead", "fr-text--bold")}
						suppressHydrationWarning
					>
						{card.value}
					</p>
				</div>
			))}
		</div>
	);
}

const useStyles = tss.withName(StatsCards.name).create({
	grid: {
		display: "grid",
		gap: fr.spacing("4v"),
		gridTemplateColumns: "1fr",
		"@media (min-width: 768px)": {
			gridTemplateColumns: "repeat(3, 1fr)",
		},
	},
	card: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("1v"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		paddingInline: fr.spacing("6v"),
		paddingBlock: fr.spacing("6v"),
	},
});
