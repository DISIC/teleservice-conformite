import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import { useCommonStyles } from "~/components/ui/commonStyles";

/** Shared "Retour / Continuer" action bar for every creation path. */
export function Actions({
	onContinue,
	disabled,
}: {
	onContinue: () => void;
	disabled?: boolean;
}) {
	const { back } = useRouter();
	const { classes } = useCommonStyles();

	return (
		<div className={classes.actionButtonsContainer}>
			<Button
				type="button"
				priority="tertiary"
				onClick={() => back()}
				aria-label="Retour à la liste des déclarations"
			>
				Retour
			</Button>
			<Button
				type="button"
				onClick={onContinue}
				disabled={disabled}
				iconId="fr-icon-arrow-right-line"
				iconPosition="right"
			>
				Continuer
			</Button>
		</div>
	);
}
