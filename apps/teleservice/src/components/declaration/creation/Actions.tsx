import { Button } from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

/** Shared "Continuer" action bar for every creation path. */
export function Actions({
	onContinue,
	disabled,
}: {
	onContinue: () => void;
	disabled?: boolean;
}) {
	const { classes } = useStyles();

	return (
		<div className={classes.container}>
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

const useStyles = tss.withName(Actions.name).create({
	container: {
		display: "flex",
		justifyContent: "flex-end",
	},
});
