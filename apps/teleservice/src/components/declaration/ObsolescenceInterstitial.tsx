import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Warning from "@codegouvfr/react-dsfr/picto/Warning";
import { tss } from "tss-react";
import type { Declaration } from "~/payload/payload-types";
import {
	OBSOLESCENCE_YEARS,
	type Obsolescence,
	obsoleteSince,
} from "~/domain/declaration/obsolescence";

type ObsolescenceInterstitialProps = {
	declaration: Pick<Declaration, "id" | "name" | "published_at">;
	obsolescence: Exclude<Obsolescence, "valid">;
	/** Reveals the details page for this visit; nothing is persisted. */
	onUpdate: () => void;
};

type Step = { title: string; detail: string };

const WITH_CHANGES: Step[] = [
	{
		title: "Procédez à un nouvel audit,",
		detail:
			"appliquez les corrections nécessaires et procédez à un contre audit.",
	},
	{ title: "Modifiez les informations", detail: "de votre déclaration." },
	{
		title: "Publiez la nouvelle déclaration",
		detail: `qui sera valide pour une durée de ${OBSOLESCENCE_YEARS} ans.`,
	},
];

const WITHOUT_CHANGES: Step[] = [
	{
		title: "Vérifiez les informations",
		detail: "et modifiez les le cas échéant.",
	},
	{
		title: "Publiez la nouvelle déclaration",
		detail: `qui sera valide pour une durée de ${OBSOLESCENCE_YEARS} ans.`,
	},
];

export function ObsolescenceInterstitial({
	declaration,
	obsolescence,
	onUpdate,
}: ObsolescenceInterstitialProps) {
	const { classes, cx } = useStyles();
	const deadline = declaration.published_at
		? obsoleteSince(new Date(declaration.published_at)).toLocaleDateString(
				"fr-FR",
				{ timeZone: "UTC" },
			)
		: null;
	const publicUrl = `/declarations/${declaration.id}/publish`;

	return (
		<div className={classes.root}>
			<Warning fontSize="96px" aria-hidden="true" />
			<h2 className={cx(fr.cx("fr-h2", "fr-mb-4v"), classes.center)}>
				Votre déclaration
				<br />
				{declaration.name}
				<br />
				{obsolescence === "obsolete"
					? "est obsolète."
					: "est bientôt obsolète."}
			</h2>
			{obsolescence === "obsolete" ? (
				<>
					<p className={classes.center}>
						Votre déclaration a été publiée il y a plus de {OBSOLESCENCE_YEARS}{" "}
						ans.
						<br />
						Elle est obsolète depuis le <strong>{deadline}</strong>.
					</p>
					<p className={classes.center}>
						Votre service numérique est donc <strong>non conforme</strong> et
						indiqué comme tel sur votre déclaration d’accessibilité.
					</p>
				</>
			) : (
				<>
					<p className={classes.center}>
						Votre déclaration a été publiée il y a près de {OBSOLESCENCE_YEARS}{" "}
						ans.
						<br />
						Elle sera obsolète le <strong>{deadline}</strong>.
					</p>
					<p className={classes.center}>
						Passé cette date, votre service numérique sera{" "}
						<strong>réputé non conforme</strong> et indiqué comme tel sur votre
						déclaration d’accessibilité.
					</p>
				</>
			)}
			<Button
				priority="tertiary"
				size="small"
				iconId="fr-icon-eye-line"
				iconPosition="left"
				linkProps={{
					href: publicUrl,
					target: "_blank",
					rel: "noopener noreferrer",
					title: `Voir la déclaration ${declaration.name}, nouvelle fenêtre`,
				}}
			>
				Voir la déclaration en ligne
			</Button>

			<h3
				className={cx(fr.cx("fr-h3", "fr-mt-12v", "fr-mb-2v"), classes.center)}
			>
				Que devez-vous faire ?
			</h3>
			<p className={classes.center}>
				Conformément à la législation, vous devez actualiser votre déclaration
				et la publier à nouveau
				{obsolescence === "expiring" ? " avant cette échéance" : ""}.
			</p>

			<div className={classes.columns}>
				<StepColumn
					heading="Vous avez mis en place des évolutions sur votre service numérique."
					steps={WITH_CHANGES}
				/>
				<StepColumn
					heading="Vous n’avez procédé à aucune évolution sur votre service numérique."
					steps={WITHOUT_CHANGES}
				/>
			</div>

			<Button priority="primary" onClick={onUpdate} className={classes.cta}>
				Mettre à jour ma déclaration
			</Button>
		</div>
	);
}

function StepColumn({ heading, steps }: { heading: string; steps: Step[] }) {
	const { classes, cx } = useStyles();
	return (
		<div className={classes.column}>
			<p className={cx(fr.cx("fr-text--lg", "fr-text--bold"), classes.center)}>
				{heading}
			</p>
			<ol className={classes.steps}>
				{steps.map((step, index) => (
					<li key={step.title} className={classes.step}>
						<span className={classes.stepNumber} aria-hidden="true">
							{index + 1}
						</span>
						<span>
							<strong>{step.title}</strong>
							<br />
							{step.detail}
						</span>
					</li>
				))}
			</ol>
		</div>
	);
}

const useStyles = tss.withName(ObsolescenceInterstitial.name).create({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: fr.spacing("4v"),
		maxWidth: 720,
		marginInline: "auto",
		paddingBlock: fr.spacing("12v"),
	},
	center: {
		textAlign: "center",
		margin: 0,
	},
	columns: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
		gap: fr.spacing("8v"),
		width: "100%",
		marginTop: fr.spacing("6v"),
	},
	column: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
	},
	steps: {
		listStyle: "none",
		padding: 0,
		margin: 0,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
	},
	step: {
		display: "flex",
		alignItems: "flex-start",
		gap: fr.spacing("3v"),
		padding: 0,
	},
	stepNumber: {
		flexShrink: 0,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: 40,
		height: 40,
		borderRadius: "50%",
		fontWeight: 700,
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
	cta: {
		marginTop: fr.spacing("6v"),
	},
});
