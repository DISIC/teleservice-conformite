import CallOut from "@codegouvfr/react-dsfr/CallOut";

const TELESERVICE_URL = process.env.NEXT_PUBLIC_TELESERVICE_URL ?? "/";

export default function PublishDeclarationCallOut() {
	return (
		<CallOut
			title="Publiez et centralisez vos déclarations d’accessibilité conformément aux exigences légales."
			titleAs="p"
			buttonProps={{
				children: "Publier une déclaration",
				priority: "secondary",
				size: "small",
				iconId: "ri-share-box-line",
				iconPosition: "right",
				linkProps: { href: TELESERVICE_URL },
			}}
		>
			Le téléservice centralise l’ensemble des déclarations d’accessibilité
			numérique des services publics. Il permet un meilleur suivi de la
			politique d’accessibilité de l’État.
		</CallOut>
	);
}
