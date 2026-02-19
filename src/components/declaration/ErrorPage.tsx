import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import TechnicalError from "@codegouvfr/react-dsfr/picto/TechnicalError";
import Image from "next/image";
import { tss } from "tss-react";

import blob from "~/../assets/blob.svg";
import { authClient } from "~/utils/auth-client";

export default function ErrorPage({ deleted }: { deleted?: boolean }) {
	const { classes } = useStyles();
	const { data: authSession } = authClient.useSession();
	const isAuthenticated = !!authSession;

	return (
		<section className={fr.cx("fr-container")}>
			<div className={classes.errorPageContainer}>
				<div className={classes.errorDescription}>
					<h1>
						{deleted ? "Cette déclaration n’existe plus" : "Page non trouvée"}
					</h1>
					<p className={classes.errorCode}>Erreur 404</p>
					<p className={classes.errorMessage}>
						{deleted
							? "La déclaration que vous cherchez n’existe plus."
							: "La page que vous cherchez est introuvable."}{" "}
						Excusez-nous pour la gêne occasionnée.
					</p>
					{isAuthenticated && (
						<>
							<p className={classes.suggestion}>
								Pour continuer votre visite, vous pouvez retourner sur la liste
								des déclarations :
							</p>
							<Button linkProps={{ href: "/dashboard" }}>
								Revenir sur la liste des déclarations
							</Button>
						</>
					)}
				</div>
				<div className={classes.errorIllustration}>
					<div>
						<Image src={blob} alt="Illustration d'une page d'erreur 404" />
					</div>
					<div className={classes.technicalErrorIcon}>
						<TechnicalError fontSize="6.625rem" />
					</div>
				</div>
			</div>
		</section>
	);
}

const useStyles = tss.withName(ErrorPage.name).create({
	errorPageContainer: {
		marginBlock: fr.spacing("24v"),
		marginInline: fr.spacing("24v"),
		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		alignItems: "center",
		justifyItems: "end",
	},
	errorDescription: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("2v"),
		paddingInline: fr.spacing("4v"),
		justifyContent: "center",
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
	},
	technicalErrorIcon: {
		position: "absolute",
	},
});
