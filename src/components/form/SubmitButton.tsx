import { Button } from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";
import { useFormContext } from "~/utils/form/context";

export function SubscribeButton({ label }: { label: string }) {
	const { classes } = useStyles();
	const form = useFormContext();
	return (
		<div className={classes.buttonWrapper}>
			<form.Subscribe
				selector={(state) => [state.isSubmitting, state.canSubmit]}
			>
				{([isSubmitting, canSubmit]) => (
					<Button
						className={classes.button}
						disabled={isSubmitting || !canSubmit}
						type="submit"
					>
						{label}
					</Button>
				)}
			</form.Subscribe>
		</div>
	);
}

const useStyles = tss.withName(SubscribeButton.name).create(() => ({
	buttonWrapper: {
		display: "flex",
		justifyContent: "end",
	},
	button: {
		alignItems: "end",
	},
}));
