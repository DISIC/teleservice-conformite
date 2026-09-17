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

// Only these words differ between the two screens.
const COPY: Record<
	Exclude<Obsolescence, "valid">,
	{
		title: string;
		since: string;
		deadline: string;
		verdict: string;
		status: string;
	}
> = {
	obsolete: {
		title: "est obsolète.",
		since: "plus de",
		deadline: "Elle est obsolète depuis le",
		verdict: "Votre service numérique est donc",
		status: "non conforme",
	},
	expiring: {
		title: "est bientôt obsolète.",
		since: "près de",
		deadline: "Elle sera obsolète le",
		verdict: "Passé cette date, votre service numérique sera",
		status: "réputé non conforme",
	},
};

const WITH_CHANGES: Step[] = [
	{
		title: "Procédez à un nouvel audit,",
		detail:
			"appliquez les corrections nécessaires et <br /> procédez à un contre audit.",
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
	const copy = COPY[obsolescence];

	return (
		<div className={classes.root}>
			<Warning fontSize="6rem" aria-hidden="true" />
			<h2
				className={cx(fr.cx("fr-h2", "fr-mt-4v", "fr-mb-6v"), classes.center)}
			>
				Votre déclaration
				<br />
				{declaration.name}
				<br />
				{copy.title}
			</h2>
			<p className={cx(fr.cx("fr-text--xl", "fr-mb-2v"), classes.center)}>
				Votre déclaration a été publiée il y a {copy.since} {OBSOLESCENCE_YEARS}{" "}
				ans.
				<br />
				{copy.deadline} <strong>{deadline}</strong>.
			</p>
			<p className={cx(fr.cx("fr-text--xl"), classes.center)}>
				{copy.verdict} <strong>{copy.status}</strong> et indiqué
				<br />
				comme tel sur votre déclaration d’accessibilité.
			</p>
			<Button
				priority="tertiary"
				size="small"
				className={fr.cx("fr-mt-6v")}
				iconId="fr-icon-eye-fill"
				iconPosition="left"
				linkProps={{ href: publicUrl }}
			>
				Voir la déclaration en ligne
			</Button>
			<h2 className={cx(fr.cx("fr-mt-18v", "fr-mb-3v"), classes.center)}>
				Que devez-vous faire ?
			</h2>
			<p className={cx(fr.cx("fr-text--xl"), classes.center)}>
				Conformément à la législation, vous devez actualiser votre
				<br />
				déclaration et la publier à nouveau.
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
			<Button
				priority="primary"
				size="large"
				onClick={onUpdate}
				className={fr.cx("fr-mt-12v")}
			>
				Mettre à jour ma déclaration
			</Button>
		</div>
	);
}

function StepColumn({ heading, steps }: { heading: string; steps: Step[] }) {
	const { classes, cx } = useStyles();
	return (
		<div className={classes.column}>
			<p className={cx(fr.cx("fr-text--xl", "fr-text--bold"), classes.center)}>
				{heading}
			</p>
			<ol className={classes.steps}>
				{steps.map((step, index) => (
					<li key={step.title} className={classes.step}>
						<span className={classes.stepNumber} aria-hidden="true">
							{index + 1}
						</span>
						<span>
							<strong className={fr.cx("fr-text--lg")}>{step.title}</strong>
							<br />
							<span
								dangerouslySetInnerHTML={{ __html: step.detail }}
								className={fr.cx("fr-text--sm")}
							/>
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
		paddingInline: fr.spacing("24v"),
		marginInline: "auto",
		paddingBottom: fr.spacing("12v"),
		"@media (max-width: 1023px)": {
			paddingInline: fr.spacing("6v"),
		},
	},
	center: {
		textAlign: "center",
		margin: 0,
	},
	columns: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(0, 360px))",
		justifyContent: "center",
		gap: fr.spacing("18v"),
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
		alignItems: "center",
		gap: fr.spacing("3v"),
		padding: 0,
	},
	stepNumber: {
		flexShrink: 0,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: fr.spacing("12v"),
		height: fr.spacing("12v"),
		borderRadius: "50%",
		fontWeight: 700,
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
});
