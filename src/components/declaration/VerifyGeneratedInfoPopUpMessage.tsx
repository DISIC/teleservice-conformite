import HelpingMessage from "./HelpingMessage";
import Innovation from "@codegouvfr/react-dsfr/picto/Innovation";

export default function VerifyGeneratedInfoHelpingMessage() {
	return (
		<HelpingMessage
			image={<Innovation fontSize="6rem" />}
			message={
				<>
					Cette déclaration a été pré-remplie automatiquement à l’aide d’une IA
					souveraine.
					<br />
					<br />
					Nous vous invitons à vérifier l’ensemble des informations renseignées
					avant de publier.
				</>
			}
		/>
	);
}
