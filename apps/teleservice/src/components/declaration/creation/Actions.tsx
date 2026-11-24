import { Button } from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

export function Actions({ disabled }: { disabled?: boolean }) {
	const { classes } = useStyles();

	return (
		<div className={classes.container}>
			<Button type="submit" disabled={disabled}>
				Continuer
			</Button>
		</div>
	);
}

const useStyles = tss.withName({ Actions }).create({
	container: {
		display: "flex",
		justifyContent: "flex-end",
	},
});
