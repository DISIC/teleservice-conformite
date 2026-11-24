import { fr, type FrIconClassName } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { type ReactNode, useEffect, useRef } from "react";
import { tss } from "tss-react";
import {
	footerConformityLabel,
	getAuditConformity,
} from "~/domain/declaration/conformity";
import type { DepositedDeclaration } from "~/domain/declaration/deposited/snapshot";
import { copyToClipboard } from "~/lib/clipboard";
import { newTabLinkProps, newTabTitle } from "~/lib/newTabLink";
import type { Declaration } from "~/payload/payload-types";

type DepositSuccessProps = {
	declaration: Pick<Declaration, "id">;
	audit: DepositedDeclaration["audit"];
};

const DECLARATIONS_LIST = "/dashboard/declarations";

// Distinct from the header notice form so the two feedback channels stay separable.
const JDMA_URL =
	"https://jedonnemonavis.numerique.gouv.fr/Demarches/4385?button=5139";

const publicationRules = (
	mention: string,
): { iconId: FrIconClassName; text: ReactNode }[] => [
	{
		iconId: "fr-icon-computer-line",
		text: "Il doit être disponible depuis toutes les pages du site, à la place de votre précédente déclaration d’accessibilité, par exemple en pied de page.",
	},
	{
		iconId: "fr-icon-external-link-line",
		text: "Il doit être signalé comme étant un lien externe, pointant vers la déclaration hébergée sur la plateforme du téléservice.",
	},
	{
		iconId: "fr-icon-bookmark-line",
		text: (
			<>
				Il doit indiquer explicitement l’état de conformité :
				<br />« {mention} ».
			</>
		),
	},
];

export function DepositSuccess({ declaration, audit }: DepositSuccessProps) {
	const { classes, cx } = useStyles();
	const confirmation = useRef<HTMLDivElement>(null);

	useEffect(() => {
		confirmation.current?.focus();
	}, []);

	const publicUrl = `${process.env.NEXT_PUBLIC_FRONT_URL}/declarations/${declaration.id}/publish`;
	const mention = `Accessibilité : ${footerConformityLabel(getAuditConformity(audit))}`;
	const snippet = `<a target="_blank" title="${newTabTitle(mention)}" class="fr-footer__bottom-link" href="${publicUrl}">${mention.replace(" :", "&nbsp;:")}</a>`;

	return (
		<div className={classes.root}>
			<div ref={confirmation} tabIndex={-1}>
				<Alert
					severity="success"
					title="Déclaration déposée sur le téléservice"
					description="Un mail de confirmation vous a été envoyé."
					as="h6"
					small={false}
				/>
			</div>
			<div className={classes.card}>
				<section className={classes.part}>
					<h2 className={cx(fr.cx("fr-h3"), classes.center)}>
						Publiez la déclaration sur votre site
					</h2>
					<p className={cx("fr-mt-3v", classes.center)}>
						La déclaration d’accessibilité doit être disponible depuis toutes
						les pages de votre site.
					</p>
					<ol className={classes.steps}>
						<li className={classes.step}>
							<span className={classes.stepNumber} aria-hidden>
								1
							</span>
							<h3 className={cx(fr.cx("fr-h5", "fr-mb-0"), classes.center)}>
								Copiez le lien de la déclaration
							</h3>
							<div className={classes.linkField}>
								<Input
									label="Lien de votre déclaration déposée"
									classes={{
										root: classes.field,
										label: fr.cx("fr-sr-only"),
									}}
									nativeInputProps={{ value: publicUrl, readOnly: true }}
								/>
							</div>
							<Button
								iconId="fr-icon-links-line"
								iconPosition="left"
								onClick={() => copyToClipboard(publicUrl, () => void 0)}
							>
								Copier le lien
							</Button>
						</li>
						<li className={classes.step}>
							<span className={classes.stepNumber} aria-hidden>
								2
							</span>
							<h3 className={cx(fr.cx("fr-h5", "fr-mb-0"), classes.center)}>
								Intégrez le lien sur votre site
							</h3>
							<p className={classes.center}>
								Vous devez le publier sur votre site, en respectant les règles
								suivantes :
							</p>
							<ul className={classes.rules}>
								{publicationRules(mention).map(({ iconId, text }) => (
									<li key={iconId} className={classes.rule}>
										<span
											className={cx(fr.cx(iconId), classes.ruleIcon)}
											aria-hidden
										/>
										<span>{text}</span>
									</li>
								))}
							</ul>
							<p className={classes.center}>
								Vous pouvez copier ce code et l’envoyer à votre équipe technique
								pour l’intégrer sur votre site. Les classes CSS proposées ici
								sont celles du DSFR.
							</p>
							<Input
								label="Code du lien vers la déclaration"
								textArea
								classes={{
									root: classes.field,
									label: fr.cx("fr-sr-only"),
								}}
								nativeTextAreaProps={{
									value: snippet,
									readOnly: true,
									rows: 4,
								}}
							/>
							<Button
								priority="secondary"
								iconId="ri-file-copy-line"
								iconPosition="right"
								onClick={() => copyToClipboard(snippet, () => void 0)}
							>
								Copier le code
							</Button>
						</li>
					</ol>
				</section>
				<section className={cx(classes.part, classes.feedback)}>
					<h2 className={cx(fr.cx("fr-h5", "fr-mb-3v"), classes.center)}>
						Aidez-nous à améliorer ce service !
					</h2>
					<p className={cx(classes.center, classes.mention)}>
						Donnez-nous votre avis, cela ne prend que 2 minutes.
					</p>
					<a
						href={JDMA_URL}
						{...newTabLinkProps("Je donne mon avis")}
						className={fr.cx("fr-raw-link", "fr-mt-9v")}
					>
						{/* oxlint-disable-next-line nextjs/no-img-element -- JDMA requires its hosted button image */}
						<img
							src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu-clair.svg"
							alt="Je donne mon avis"
						/>
					</a>
				</section>
			</div>
			<Button
				priority="secondary"
				iconId="fr-icon-arrow-left-s-line"
				iconPosition="left"
				linkProps={{ href: DECLARATIONS_LIST }}
			>
				Retourner à la liste de mes déclarations
			</Button>
		</div>
	);
}

const useStyles = tss.withName({ DepositSuccess }).create({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: fr.spacing("10v"),
		maxWidth: "50rem",
		marginInline: "auto",
		paddingBottom: fr.spacing("12v"),
		"& > *:first-child": { width: "100%" },
	},
	center: {
		textAlign: "center",
		margin: 0,
	},
	card: {
		width: "100%",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
	},
	part: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: `${fr.spacing("12v")} ${fr.spacing("21v")}`,
		[fr.breakpoints.down("md")]: {
			padding: fr.spacing("6v"),
		},
	},
	feedback: {
		borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
	},
	mention: {
		color: fr.colors.decisions.text.mention.grey.default,
		marginBottom: fr.spacing("3v"),
	},
	steps: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		marginTop: fr.spacing("12v"),
		width: "100%",
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("12v"),
	},
	step: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: fr.spacing("3v"),
		padding: 0,
	},
	stepNumber: {
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: fr.spacing("12v"),
		height: fr.spacing("12v"),
		borderRadius: "50%",
		fontSize: "1.5rem",
		fontWeight: 700,
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
	field: {
		width: "100%",
		marginBottom: "0!important",
		"& input, & textarea": {
			marginTop: "0!important",
		},
	},
	linkField: {
		width: "70%",
		[fr.breakpoints.down("md")]: {
			width: "100%",
		},
	},
	rules: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		marginTop: fr.spacing("3v"),
		marginBottom: fr.spacing("3v"),
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
	},
	rule: {
		display: "flex",
		alignItems: "flex-start",
		gap: fr.spacing("4v"),
		padding: 0,
	},
	ruleIcon: {
		flexShrink: 0,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: fr.spacing("10v"),
		height: fr.spacing("10v"),
		borderRadius: "50%",
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
});
