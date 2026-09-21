import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Success from "@codegouvfr/react-dsfr/picto/Success";
import Search from "@codegouvfr/react-dsfr/picto/Search";
import Application from "@codegouvfr/react-dsfr/picto/Application";
import { type ComponentType, useEffect, useRef } from "react";
import { tss } from "tss-react";
import {
	EXPIRING_MONTHS,
	OBSOLESCENCE_YEARS,
	obsoleteSince,
} from "~/domain/declaration/obsolescence";
import { copyToClipboard } from "~/lib/clipboard";
import type { Declaration, User } from "~/payload/payload-types";

type PublishSuccessProps = {
	declaration: Pick<Declaration, "id" | "name" | "contact"> & {
		created_by: User;
	};
	/** The date the server stamped on this publication, not the moment of render. */
	publishedAt: Date;
};

const DECLARATIONS_LIST = "/dashboard/declarations";

const SUPPORTS: {
	picto: ComponentType<{ fontSize?: string; "aria-hidden"?: boolean }>;
	title: string;
	detail: string;
}[] = [
	{
		picto: Search,
		title: "Pour les sites internet",
		detail:
			"La déclaration d’accessibilité est publiée sur le site internet concerné. Elle est mise à disposition au sein d’une page accessibilité, directement accessible depuis la page d’accueil et depuis n’importe quelle page du site.",
	},
	{
		picto: Application,
		title: "Pour les applications mobiles",
		detail:
			"Elle est disponible sur le site internet de l’organisme qui a développé l’application ou apparaît avec d’autres informations disponibles lors du téléchargement de l’application. L’état de conformité est précisé au sein de l’application.",
	},
	{
		picto: Application,
		title: "Pour les autres services de communication au public en ligne",
		detail:
			"Elle est disponible sur le site internet des organismes responsables de leur gestion ou de leur mise à disposition.",
	},
];

export function PublishSuccess({
	declaration,
	publishedAt,
}: PublishSuccessProps) {
	const { classes, cx } = useStyles();
	const heading = useRef<HTMLHeadingElement>(null);

	useEffect(() => {
		heading.current?.focus();
	}, []);

	const deadline = obsoleteSince(publishedAt).toLocaleDateString("fr-FR", {
		timeZone: "UTC",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const publicHref = `/declarations/${declaration.id}/publish`;
	const publicUrl = `${process.env.NEXT_PUBLIC_FRONT_URL}${publicHref}`;

	const recipients = [
		declaration.created_by.email,
		declaration.contact?.email,
	].filter((email): email is string => !!email);

	return (
		<div className={classes.root}>
			<Success fontSize="6rem" aria-hidden />
			<h2
				ref={heading}
				tabIndex={-1}
				className={cx(fr.cx("fr-h1", "fr-mt-4v", "fr-mb-6v"), classes.center)}
			>
				Votre déclaration a été publiée
				<br />
				sur le téléservice.
			</h2>
			<p className={cx(fr.cx("fr-text--xl", "fr-mb-0"), classes.center)}>
				Cette déclaration est valable {OBSOLESCENCE_YEARS} ans, jusqu’au{" "}
				<strong>{deadline}</strong>.
			</p>
			<p className={cx(fr.cx("fr-text--xl"), classes.center)}>
				Un rappel sera envoyé {EXPIRING_MONTHS} mois avant que la déclaration ne
				soit obsolète à {recipients.join(" et ")}.
			</p>
			<Button
				priority="tertiary"
				size="small"
				className={fr.cx("fr-mt-6v")}
				iconId="fr-icon-eye-fill"
				iconPosition="left"
				linkProps={{
					href: publicHref,
					target: "_blank",
					rel: "noopener noreferrer",
					title: `Voir la déclaration ${declaration.name}, nouvelle fenêtre`,
				}}
			>
				Voir la déclaration en ligne
			</Button>
			<h3
				className={cx(fr.cx("fr-h2", "fr-mt-12v", "fr-mb-3v"), classes.center)}
			>
				Prochaine étape
			</h3>
			<p className={cx(fr.cx("fr-text--lg", "fr-mb-3v"), classes.center)}>
				Affichez le lien de votre déclaration sur votre site.
			</p>
			<div className={classes.copyRow}>
				<Input
					label="Lien de votre déclaration publiée"
					classes={{ root: classes.linkField, label: fr.cx("fr-sr-only") }}
					nativeInputProps={{ value: publicUrl, readOnly: true }}
				/>
				<Button
					priority="tertiary"
					iconId="fr-icon-links-line"
					iconPosition="left"
					onClick={() => copyToClipboard(publicUrl, () => void 0)}
				>
					Copier le lien
				</Button>
			</div>
			<ul className={classes.supports}>
				{SUPPORTS.map(({ picto: Picto, title, detail }) => (
					<li key={title} className={classes.support}>
						<span className={classes.pictoCircle}>
							<Picto fontSize="3.5rem" aria-hidden />
						</span>
						<span className={fr.cx("fr-text--lg", "fr-mb-0")}>
							<strong>{title}</strong>
							<br />
							{detail}
						</span>
					</li>
				))}
			</ul>
			<div className={classes.actions}>
				<Button
					priority="secondary"
					iconId="fr-icon-arrow-left-s-line"
					iconPosition="left"
					linkProps={{ href: DECLARATIONS_LIST }}
				>
					Retourner à la liste de mes déclarations
				</Button>
				<Button
					priority="primary"
					iconId="fr-icon-add-line"
					iconPosition="left"
					linkProps={{ href: `${DECLARATIONS_LIST}?create=true` }}
				>
					Ajouter une déclaration
				</Button>
			</div>
		</div>
	);
}

const useStyles = tss.withName(PublishSuccess.name).create({
	root: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		maxWidth: "48rem",
		marginInline: "auto",
		paddingBottom: fr.spacing("12v"),
	},
	center: {
		textAlign: "center",
		margin: 0,
	},
	copyRow: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "flex-start",
		gap: fr.spacing("3v"),
		"@media (max-width: 768px)": {
			flexDirection: "column",
			alignItems: "center",
		},
	},
	linkField: {
		marginBottom: "0!important",
		"& input": {
			minWidth: "24rem",
			marginTop: "0!important",
		},
	},
	notice: {
		width: "100%",
		marginTop: fr.spacing("3v"),
	},
	supports: {
		listStyle: "none",
		padding: 0,
		width: "100%",
		marginTop: fr.spacing("12v"),
		marginBottom: 0,
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("12v"),
	},
	support: {
		display: "flex",
		alignItems: "flex-start",
		gap: fr.spacing("6v"),
		padding: 0,
	},
	pictoCircle: {
		flexShrink: 0,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		width: fr.spacing("22v"),
		height: fr.spacing("22v"),
		borderRadius: "50%",
		backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
	},
	actions: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: fr.spacing("4v"),
		marginTop: fr.spacing("12v"),
	},
});
