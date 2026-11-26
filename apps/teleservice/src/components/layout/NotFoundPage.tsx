import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import TechnicalError from "@codegouvfr/react-dsfr/picto/TechnicalError";
import Head from "next/head";
import Image from "next/image";
import type { ComponentType } from "react";
import { tss } from "tss-react";

import blob from "~/assets/blob.svg";
import { pageTitle } from "~/lib/serviceName";

export type NotFoundReason = "page" | "deletedDeclaration";

export interface NotFoundProps {
	notFound: NotFoundReason;
	isAuthenticated: boolean;
}

export function NotFoundPage({ notFound, isAuthenticated }: NotFoundProps) {
	const { classes } = useStyles();
	const deleted = notFound === "deletedDeclaration";
	const title = deleted
		? "Cette déclaration n’existe plus"
		: "Page non trouvée";

	return (
		<section className={fr.cx("fr-container")}>
			<Head>
				<title>{pageTitle(title)}</title>
			</Head>
			<div className={classes.errorPageContainer}>
				<div className={classes.errorDescription}>
					<h1>{title}</h1>
					<p className={classes.errorCode}>Erreur 404</p>
					<p className={classes.errorMessage}>
						{deleted
							? "La déclaration que vous cherchez n’existe plus."
							: "La page que vous cherchez est introuvable."}{" "}
						Excusez-nous pour la gêne occasionnée.
					</p>
					{deleted ? (
						<Button linkProps={{ href: "/" }}>Revenir au site</Button>
					) : (
						isAuthenticated && (
							<>
								<p className={classes.suggestion}>
									Pour continuer votre visite, vous pouvez retourner sur la
									liste des déclarations :
								</p>
								<Button linkProps={{ href: "/dashboard/declarations" }}>
									Revenir sur la liste des déclarations
								</Button>
							</>
						)
					)}
				</div>
				<div className={classes.errorIllustration}>
					<div>
						<Image src={blob} alt="" />
					</div>
					<div className={classes.technicalErrorIcon}>
						<TechnicalError fontSize="6.625rem" />
					</div>
				</div>
			</div>
		</section>
	);
}

/** Lets a page's `getServerSideProps` answer with `NotFoundProps` instead of its own props. */
export function orNotFound<P extends object>(Page: ComponentType<P>) {
	return function PageOrNotFound(props: P | NotFoundProps) {
		return "notFound" in props ? (
			<NotFoundPage {...props} />
		) : (
			<Page {...(props as P)} />
		);
	};
}

const useStyles = tss.withName({ NotFoundPage }).create({
	errorPageContainer: {
		marginBlock: fr.spacing("12v"),
		display: "grid",
		gap: fr.spacing("8v"),
		alignItems: "center",
		[fr.breakpoints.up("md")]: {
			marginBlock: fr.spacing("24v"),
			marginInline: fr.spacing("24v"),
			gridTemplateColumns: "1fr 1fr",
			justifyItems: "end",
		},
	},
	errorDescription: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
		paddingInline: fr.spacing("4v"),
		justifyContent: "center",
		alignItems: "flex-start",
	},
	errorCode: {
		color: fr.colors.decisions.text.mention.grey.default,
		fontSize: "0.875rem",
		lineHeight: "1.5rem",
		fontWeight: 400,
	},
	errorMessage: {
		color: fr.colors.decisions.text.default.grey.default,
		fontWeight: 400,
		fontSize: "1.25rem",
		lineHeight: "2rem",
	},
	suggestion: {
		color: fr.colors.decisions.text.default.grey.default,
		fontWeight: 400,
		fontSize: "0.875rem",
		lineHeight: "1.5rem",
	},
	errorIllustration: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
		justifySelf: "center",
	},
	technicalErrorIcon: {
		position: "absolute",
	},
});
