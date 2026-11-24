import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Header } from "@codegouvfr/react-dsfr/Header";
import type { DepositedDeclaration } from "~/domain/declaration/deposited/snapshot";
import { tss } from "tss-react";
import { obsolescenceOf } from "~/domain/declaration/obsolescence";
import { depositLabel } from "~/domain/declaration/deposited/markdown";
import { SERVICE_NAME } from "~/lib/serviceName";

export const DEPOSITED_HEADER_TITLE = "Déclaration d’accessibilité numérique";

export function DepositedHeader({
	declaration,
	today,
}: {
	declaration: DepositedDeclaration;
	today: Date;
}) {
	const { classes, cx } = useStyles();
	const isObsolete =
		obsolescenceOf(new Date(declaration.depositedAt), today) === "obsolete";

	return (
		<Header
			brandTop={
				<>
					RÉPUBLIQUE
					<br />
					FRANÇAISE
				</>
			}
			homeLinkProps={{
				href: "/",
				title: `Accueil ${SERVICE_NAME}`,
			}}
			serviceTitle={DEPOSITED_HEADER_TITLE}
			serviceTagline={declaration.name}
			quickAccessItems={[
				<div key="publication" className={classes.depositInfo}>
					<p
						className={cx(
							fr.cx(
								"fr-icon-calendar-2-line",
								"fr-icon--sm",
								"fr-text--sm",
								"fr-mb-0",
							),
							classes.publication,
						)}
					>
						{depositLabel(declaration)}
					</p>
					{isObsolete && (
						<Badge as="p" small severity="error">
							Obsolète
						</Badge>
					)}
				</div>,
			]}
		/>
	);
}

const useStyles = tss.withName({ DepositedHeader }).create({
	depositInfo: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-end",
		gap: fr.spacing("1v"),
	},
	publication: {
		"&::before": {
			marginRight: fr.spacing("2v"),
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		},
	},
});
