import { Button } from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

export function Actions({ disabled }: { disabled?: boolean }) {
	const { classes } = useStyles();

	return (
		<div className={classes.container}>
			<Button
				type="submit"
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
