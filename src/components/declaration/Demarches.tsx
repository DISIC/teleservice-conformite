import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import Community from "@codegouvfr/react-dsfr/picto/Community";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import Document from "@codegouvfr/react-dsfr/picto/Document";
import Information from "@codegouvfr/react-dsfr/picto/Information";
import Search from "@codegouvfr/react-dsfr/picto/Search";
import { useRouter } from "next/router";
import { tss } from "tss-react";

import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import HelpingMessage from "./HelpingMessage";

interface DemarchesProps {
	declaration: PopulatedDeclaration;
}

export default function Demarches({ declaration }: DemarchesProps) {
	const router = useRouter();
	const { classes, cx } = useStyles();
	const { rate } = declaration?.audit || {};
	const linkToDeclarationPage = `/dashboard/declaration/${declaration.id}`;

	const declarationComplete =
		declaration.status === "unpublished" &&
		["default", "notRealised"].includes(declaration?.audit?.status ?? "") &&
		declaration?.contact?.status === "default" &&
		declaration?.actionPlan?.status === "default";

	const RedirectButton = ({
		href,
		label = "Renseigner les informations",
	}: { href: string; label?: string }) => (
		<Button
			size="small"
			linkProps={{
				href,
			}}
			className={classes.redirectButton}
		>
			{label}
		</Button>
	);

	const StartBadges = ({
		showToCompleteBadge,
		showVerifyBadge,
	}: { showToCompleteBadge: boolean; showVerifyBadge: boolean }) => {
		const badges = [
			{
				show: showToCompleteBadge,
				label: "A Remplir",
			},
			{
				show: showVerifyBadge,
				label: "À vérifier",
			},
		];

		return badges
			.filter((badge) => badge.show)
			.map(({ label }) => (
				<Badge key={label} noIcon severity="new" small>
					{label}
				</Badge>
			));
	};

	return (
		<section id="demarches-tab" className={classes.main}>
			{declarationComplete && (
				<HelpingMessage
					image={<Information fontSize="6rem" />}
					message={
						<strong>Votre déclaration est prête à être publiée !</strong>
					}
					actionButtons={[
						{
							label: "Prévisualiser et publier",
							priority: "primary",
							iconId: "fr-icon-upload-line",
							onClick: () => router.push(`${declaration.id}/preview`),
						},
					]}
				/>
			)}
			{declaration.status === "published" && (
				<div className={classes.summaryCardsContainer}>
					<div className={cx(classes.card, classes.summaryRateCard)}>
						<p className={classes.cardLabel}>Taux de conformité</p>
						<p className={cx(classes.cardValue, fr.cx("fr-text--lead"))}>
							{rate !== undefined && rate !== null ? `${rate}%` : "N/A"}
						</p>
					</div>
					<div className={cx(classes.card, classes.summaryUpdateDateCard)}>
						<p className={classes.cardLabel}>Dernière mise à jour</p>
						<p className={cx(classes.cardValue, fr.cx("fr-text--lead"))}>
							{declaration?.published_at
								? new Date(declaration.published_at).toLocaleDateString("fr-FR")
								: "N/A"}
						</p>
					</div>
				</div>
			)}
			<div className={classes.tilesContainer}>
				<Tile
					classes={{ title: classes.tileTitle, desc: classes.tileDesc }}
					desc="Informations à propos du service et l’administration à laquelle il est lié"
					title="Informations générales"
					linkProps={{
						href: `${linkToDeclarationPage}/infos`,
					}}
					start={
						<StartBadges
							showToCompleteBadge={false}
							showVerifyBadge={declaration.status === "unverified"}
						/>
					}
					enlargeLinkOrButton={true}
					orientation="vertical"
					pictogram={<Document fontSize="small" />}
					className={classes.tile}
					detail={
						declaration?.status === "unverified" ? (
							<RedirectButton
								label="Vérifier les informations"
								href={`${linkToDeclarationPage}/infos`}
							/>
						) : (
							<Button
								iconId="fr-icon-arrow-right-line"
								priority="tertiary no outline"
								title="Label button"
								linkProps={{
									href: `${linkToDeclarationPage}/infos`,
								}}
							/>
						)
					}
				/>
				<Tile
					classes={{ title: classes.tileTitle, desc: classes.tileDesc }}
					title="Contact"
					desc="Moyen de contact pour pouvoir accéder aux éventuels contenus inaccessibles"
					linkProps={{
						href: `${linkToDeclarationPage}/contact`,
					}}
					enlargeLinkOrButton={true}
					orientation="vertical"
					pictogram={<Community />}
					start={
						<StartBadges
							showToCompleteBadge={!declaration?.contact}
							showVerifyBadge={
								declaration?.contact?.status === "fromAI" ||
								declaration?.contact?.status === "fromAra"
							}
						/>
					}
					detail={
						<>
							{declaration?.contact &&
								declaration?.contact?.status === "default" && (
									<Button
										iconId="fr-icon-arrow-right-line"
										priority="tertiary no outline"
										title="Label button"
										linkProps={{
											href: `${linkToDeclarationPage}/contact`,
										}}
									/>
								)}
							{!declaration?.contact && (
								<RedirectButton href={`${linkToDeclarationPage}/contact`} />
							)}
							{(declaration?.contact?.status === "fromAI" ||
								declaration?.contact?.status === "fromAra") && (
								<RedirectButton
									label="Vérifier les informations"
									href={`${linkToDeclarationPage}/contact`}
								/>
							)}
						</>
					}
					className={classes.tile}
				/>
				<Tile
					classes={{ title: classes.tileTitle, desc: classes.tileDesc }}
					title="Résultat de l’audit"
					desc="Taux de conformité et détails de l'audit"
					linkProps={{
						href: `${linkToDeclarationPage}/audit`,
					}}
					enlargeLinkOrButton={true}
					orientation="vertical"
					pictogram={<Search />}
					start={
						<StartBadges
							showToCompleteBadge={!declaration?.audit}
							showVerifyBadge={
								declaration?.audit?.status === "fromAI" ||
								declaration?.audit?.status === "fromAra"
							}
						/>
					}
					detail={
						<>
							{declaration?.audit &&
								["default", "notRealised"].includes(
									declaration?.audit?.status ?? "",
								) && (
									<Button
										iconId="fr-icon-arrow-right-line"
										priority="tertiary no outline"
										title="Label button"
										linkProps={{
											href: `${linkToDeclarationPage}/audit`,
										}}
									/>
								)}
							{!declaration?.audit && (
								<RedirectButton href={`${linkToDeclarationPage}/audit`} />
							)}
							{(declaration?.audit?.status === "fromAI" ||
								declaration?.audit?.status === "fromAra") && (
								<RedirectButton
									label="Vérifier les informations"
									href={`${linkToDeclarationPage}/audit`}
								/>
							)}
						</>
					}
					className={classes.tile}
				/>
				<Tile
					classes={{ title: classes.tileTitle, desc: classes.tileDesc }}
					title="Schéma et plans d'actions"
					desc="État des lieux et actions prévues pour améliorer l'accessibilité"
					linkProps={{
						href: `${linkToDeclarationPage}/schema`,
					}}
					enlargeLinkOrButton={true}
					orientation="vertical"
					pictogram={<Conclusion fontSize="1rem" />}
					start={
						<StartBadges
							showToCompleteBadge={!declaration?.actionPlan}
							showVerifyBadge={
								declaration?.actionPlan?.status === "fromAI" ||
								declaration?.actionPlan?.status === "fromAra"
							}
						/>
					}
					detail={
						<>
							{declaration?.actionPlan &&
								declaration?.actionPlan?.status === "default" && (
									<Button
										iconId="fr-icon-arrow-right-line"
										priority="tertiary no outline"
										title="Label button"
										linkProps={{
											href: `${linkToDeclarationPage}/schema`,
										}}
									/>
								)}
							{!declaration?.actionPlan && (
								<RedirectButton href={`${linkToDeclarationPage}/schema`} />
							)}
							{(declaration?.actionPlan?.status === "fromAI" ||
								declaration?.actionPlan?.status === "fromAra") && (
								<RedirectButton
									label="Vérifier les informations"
									href={`${linkToDeclarationPage}/schema`}
								/>
							)}
						</>
					}
					className={classes.tile}
				/>
			</div>
		</section>
	);
}

const useStyles = tss.withName(Demarches.name).create({
	main: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("8v"),
	},
	summaryCardsContainer: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		gap: fr.spacing("4v"),
	},
	card: {
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
		gap: fr.spacing("3v"),
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
		paddingInline: fr.spacing("7v"),
		paddingBlock: fr.spacing("10v"),
		borderRadius: "0.375rem",
	},
	summaryRateCard: {
		justifyContent: "space-between",
	},
	summaryUpdateDateCard: {
		justifyContent: "flex-start",
	},
	cardLabel: {
		margin: 0,
	},
	cardValue: {
		margin: 0,
	},
	tilesContainer: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr 1fr 1fr",
		gap: fr.spacing("4v"),
	},
	tile: {
		padding: `${fr.spacing("4v")} ${fr.spacing("4v")} ${fr.spacing("5v")}`,
		".fr-tile__pictogram": {
			width: fr.spacing("12v"),
			height: fr.spacing("12v"),
		},
		"& a": {
			backgroundImage: "none !important",
			"&::after": {
				display: "none",
			},
		},

		"& .fr-tile__detail > a": {
			position: "relative",
		},
		"& .fr-tile__detail > a::before": {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
		},
		"& h3": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
			"&::before": {
				backgroundImage: `linear-gradient(0deg, ${fr.colors.decisions.border.active.blueFrance.default}, ${fr.colors.decisions.border.active.blueFrance.default})`,
			},
		},

		"& .fr-tile__pictogram": {
			width: fr.spacing("10v"),
			height: fr.spacing("10v"),
		},

		"& .fr-tile__title": {
			fontSize: fr.typography[6].style.fontSize,
			fontWeight: 700,
		},

		"& .fr-tile__desc": {
			fontSize: fr.typography[18].style.fontSize,
			fontWeight: 400,
		},
	},
	redirectButton: {
		fontSize: fr.typography[18].style.fontSize,
	},
	tileTitle: { fontSize: fr.typography[6].style.fontSize },
	tileDesc: { fontSize: fr.typography[18].style.fontSize },
});
