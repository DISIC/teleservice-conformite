import { fr } from "@codegouvfr/react-dsfr";
import SelfTraining from "@codegouvfr/react-dsfr/picto/SelfTraining";
import ProConnectButton from "@codegouvfr/react-dsfr/ProConnectButton";
import Head from "next/head";
import EmptyState from "~/components/ui/EmptyState";
import { PROCONNECT_FAQ } from "~/components/ui/emptyStateFaq";
import { pageTitle } from "~/lib/serviceName";

export default function Connexion() {
	return (
		<>
			<Head>
				<title>{pageTitle("Connexion")}</title>
			</Head>
			<div className={fr.cx("fr-container", "fr-my-7w")}>
				<EmptyState
					pictogram={<SelfTraining fontSize="4rem" />}
					title="Connectez-vous ou créez votre compte."
					titleAs="h1"
					description="En tant qu’agent public (fonctionnaire ou contractuel de l’État, d’une collectivité territoriale ou du milieu hospitalier), ProConnect vous permet de vous créer un compte sur le téléservice de déclaration d’accessibilité numérique."
					faq={PROCONNECT_FAQ}
				>
					<ProConnectButton url="/api/connexion" />
				</EmptyState>
			</div>
		</>
	);
}
