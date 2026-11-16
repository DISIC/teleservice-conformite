import { fr } from "@codegouvfr/react-dsfr";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import Accessibility from "@codegouvfr/react-dsfr/picto/Accessibility";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import Internet from "@codegouvfr/react-dsfr/picto/Internet";
import { useState } from "react";
import { tss } from "tss-react";
import HelpingMessage from "~/components/ui/HelpingMessage";
import { ManualPath } from "./ManualPath";
import { OnlinePath } from "./OnlinePath";
import { newTabLinkProps } from "~/lib/newTabLink";

type CreationPath = "online" | "manual";

const PATH_OPTIONS = [
	{
		value: "online" as const,
		label: "J’ai une déclaration d’accessibilité en ligne",
		hintText:
			"La nouvelle déclaration sera pré-remplie à partir de l’URL : automatiquement pour Ara, sinon grâce à une IA souveraine (des erreurs peuvent survenir)",
		illustration: <Internet fontSize="3rem" />,
	},
	{
		value: "manual" as const,
		label: "Je n’ai pas de déclaration d’accessibilité",
		hintText: "La nouvelle déclaration sera à créer manuellement",
		illustration: <DocumentSearch fontSize="3rem" />,
	},
];

/**
 * Entry point of the declaration creation flow: the user picks one of two
 * paths, each of which owns its own input, validation, submission and error
 * handling. Online import failures fall back to the manual path in place.
 */
export function PathPicker({
	onCreated,
}: {
	onCreated: (declarationId: number) => void;
}) {
	const { classes } = useStyles();
	const [path, setPath] = useState<CreationPath>();

	return (
		<div className={classes.container}>
			<RadioButtons
				legend="Quelle est votre situation pour ce service ?"
				className={fr.cx("fr-mb-0")}
				options={PATH_OPTIONS.map((option) => ({
					label: option.label,
					hintText: option.hintText,
					illustration: option.illustration,
					nativeInputProps: {
						value: option.value,
						checked: path === option.value,
						onChange: () => setPath(option.value),
					},
				}))}
			/>
			{path === "online" && <OnlinePath onCreated={onCreated} />}
			{path === "manual" && <ManualPath onCreated={onCreated} />}
			{!path && (
				<HelpingMessage
					image={<Accessibility fontSize="4rem" />}
					message={
						<span>
							<a
								href="https://ara.numerique.gouv.fr/"
								className={fr.cx("fr-link")}
								{...newTabLinkProps("Ara")}
							>
								Ara
							</a>{" "}
							est un outil destiné aux auditeurs qui permet de réaliser un
							rapport d’audit complet et de générer automatiquement une
							déclaration d’accessibilité.
						</span>
					}
				/>
			)}
		</div>
	);
}

const useStyles = tss.withName(PathPicker.name).create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: "2rem",
	},
});
