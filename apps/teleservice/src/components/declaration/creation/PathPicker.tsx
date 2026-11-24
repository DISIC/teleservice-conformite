import { fr } from "@codegouvfr/react-dsfr";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import Success from "@codegouvfr/react-dsfr/picto/Success";
import { useState } from "react";
import { tss } from "tss-react";
import { ManualPath } from "./ManualPath";
import { OnlinePath } from "./OnlinePath";
import { withRequiredMark } from "~/components/form/RequiredField";

type CreationPath = "online" | "manual";

const PATH_OPTIONS = [
	{
		value: "online" as const,
		label: "J’ai une déclaration d’accessibilité en ligne",
		hintText:
			"Vous devez disposer d’une URL publique pointant vers la déclaration d’accessibilité de votre service numérique.",
		illustration: <Success fontSize="3rem" />,
	},
	{
		value: "manual" as const,
		label: "Je n’ai pas de déclaration d’accessibilité",
		hintText:
			"Vous ne disposez d’aucune déclaration d’accessibilité, ou celle-ci n’est pas accessible via une URL publique.",
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
				legend={withRequiredMark(
					"Quelle est votre situation pour ce service numérique ?",
					true,
				)}
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
		</div>
	);
}

const useStyles = tss.withName({ PathPicker }).create({
	container: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("7v"),
	},
});
