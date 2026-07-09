import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { tss } from "tss-react";
import { appKindOptions } from "~/payload/selectOptions";
import { appKindPictograms } from "~/components/declaration/appKindPictograms";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { getConformityStatus } from "~/utils/declaration-helper";

type StatsCardsProps = {
	declaration: PopulatedDeclaration;
};

function formatDate(value: string | null | undefined): string {
	if (!value) return "—";
	return new Date(value).toLocaleDateString("fr-FR");
}

function formatRate(rate: number): string {
	return `${rate.toString().replace(".", ",")} %`;
}

function getAppKindOption(value: PopulatedDeclaration["app_kind"]) {
	return appKindOptions.find((o) => o.value === value);
}

export function StatsCards({ declaration }: StatsCardsProps) {
	const { classes } = useStyles();

	const rate = declaration.audit?.rate;
	const conformity = rate != null ? getConformityStatus(rate) : null;
	const appKindOption = getAppKindOption(declaration.app_kind);
	const Pictogram = appKindOption && appKindPictograms[appKindOption.value];

	return (
		<div className={classes.grid}>
			<div className={classes.card}>
				<div className={classes.textBlock}>
					<p className={fr.cx("fr-mb-0", "fr-text--sm")}>Type de service</p>
					<p className={fr.cx("fr-mb-0", "fr-text--bold")}>
						{appKindOption?.label ?? "—"}
					</p>
				</div>
				{Pictogram && <Pictogram style={{ fontSize: "3.5rem" }} />}
			</div>

			<div className={classes.card}>
				<div className={classes.textBlock}>
					<p className={fr.cx("fr-mb-0", "fr-text--sm")}>
						Dernière mise à jour
					</p>
					<p
						className={fr.cx("fr-mb-0", "fr-text--bold")}
						suppressHydrationWarning
					>
						{formatDate(declaration.updatedAt)}
					</p>
				</div>
			</div>

			<div className={classes.card}>
				<div className={classes.textBlock}>
					<p className={fr.cx("fr-mb-2v", "fr-text--sm")}>Taux de conformité</p>
					{conformity && (
						<Badge small severity={conformity.severity} noIcon>
							{conformity.label}
						</Badge>
					)}
				</div>
				<p className={classes.bigValue}>
					{rate != null ? formatRate(rate) : "—"}
				</p>
			</div>
		</div>
	);
}

const useStyles = tss.withName(StatsCards.name).create({
	grid: {
		display: "grid",
		gap: fr.spacing("6v"),
		gridTemplateColumns: "1fr",
		"@media (min-width: 768px)": {
			gridTemplateColumns: "repeat(3, 1fr)",
		},
	},
	card: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		paddingInline: fr.spacing("6v"),
		paddingBlock: fr.spacing("5v"),
	},
	textBlock: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		minWidth: 0,
	},
	bigValue: {
		margin: 0,
		fontSize: "2rem",
		lineHeight: 1.2,
		fontWeight: 700,
		whiteSpace: "nowrap",
	},
});
