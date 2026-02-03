import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import Document from "@codegouvfr/react-dsfr/picto/Document";
import Conclusion from "@codegouvfr/react-dsfr/picto/Conclusion";
import Search from "@codegouvfr/react-dsfr/picto/Search";
import Community from "@codegouvfr/react-dsfr/picto/Community";
import Information from "@codegouvfr/react-dsfr/picto/Information";
import { useRouter } from "next/router";

import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import PopupMessage from "./PopupMessage";

interface DemarchesProps {
	declaration: PopulatedDeclaration;
}

export default function Demarches({ declaration }: DemarchesProps) {
	const router = useRouter();
	const { classes, cx } = useStyles();
	const { rate } = declaration?.audit || {};
	const linkToDeclarationPage = `/dashboard/declaration/${declaration.id}`;

	const wasUpdated =
		declaration?.updatedAt &&
		declaration?.published_at &&
		declaration?.updatedAt > declaration?.published_at;

	const declarationComplete =
		declaration.status === "unpublished" &&
		declaration?.audit?.status === "default" &&
		declaration?.contact?.status === "default" &&
		declaration?.actionPlan?.status === "default";

	const RedirectButton = ({
		href,
		label = "Renseigner les informations",
	}: { href: string; label?: string }) => (
		<Button
			linkProps={{
				href,
			}}
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
				<Badge key={label} noIcon severity="new">
					{label}
				</Badge>
			));
	};

	return (
		<section id="demarches-tab" className={classes.main}>
			{declarationComplete && (
				<PopupMessage
					image={<Information fontSize="6rem" />}
					message={
						<strong>Votre déclaration est prête à être mise à jour !</strong>
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
						<p className={classes.cardValue}>{`${rate}%`}</p>
					</div>
					<div className={cx(classes.card, classes.summaryUpdateDateCard)}>
						<p className={classes.cardLabel}>Dernière mise à jour</p>
						<p className={classes.cardValue}>
							{declaration?.updatedAt
								? new Date(declaration.updatedAt).toLocaleDateString("fr-FR")
								: "N/A"}
						</p>
						{wasUpdated && (
							<Button
								iconId="fr-icon-edit-box-fill"
								priority="primary"
								style={{ width: "100%" }}
							>
								Mettre à jour
							</Button>
						)}
					</div>
				</div>
			)}
			<div className={classes.tilesContainer}>
				<Tile
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
					enlargeLinkOrButton={false}
					orientation="vertical"
					pictogram={<Document fontSize="2rem" />}
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
					title="Contact"
					desc="Moyen de contact pour pouvoir accéder aux éventuels contenus inaccessibles"
					linkProps={{
						href: `${linkToDeclarationPage}/contact`,
					}}
					enlargeLinkOrButton={false}
					orientation="vertical"
					pictogram={<Community fontSize="2rem" />}
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
					title="Résultat de l’audit"
					desc="Taux de conformité et détails de l'audit"
					linkProps={{
						href: `${linkToDeclarationPage}/audit`,
					}}
					enlargeLinkOrButton={false}
					orientation="vertical"
					pictogram={<Search fontSize="2rem" />}
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
								declaration?.audit?.status === "default" && (
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
					title="Schéma et plans d'actions"
					desc="État des lieux et actions prévues pour améliorer l'accessibilité"
					linkProps={{
						href: `${linkToDeclarationPage}/schema`,
					}}
					enlargeLinkOrButton={false}
					orientation="vertical"
					pictogram={<Conclusion fontSize="2rem" />}
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
		fontWeight: 400,
		fontFamily: "Marianne",
		fontSize: "1rem",
		lineHeight: "1.5rem",
	},
	cardValue: {
		margin: 0,
		fontWeight: 500,
		fontFamily: "Marianne",
		fontSize: "1.25rem",
		lineHeight: "1.75rem",
	},
	tilesContainer: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr 1fr 1fr",
		gap: fr.spacing("4v"),
	},
	tile: {
		"& a": {
			backgroundImage: "none !important",
			"&::after": {
				display: "none",
			},
		},
		"& h3": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,

			"&::before": {
				backgroundImage: `linear-gradient(0deg, ${fr.colors.decisions.border.active.blueFrance.default}, ${fr.colors.decisions.border.active.blueFrance.default})`,
			},
		},
	},
});
