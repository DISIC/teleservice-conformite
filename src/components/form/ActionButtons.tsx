import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type {
	FrIconClassName,
	RiIconClassName,
} from "@codegouvfr/react-dsfr/fr/generatedFromCss/classNames";
import { tss } from "tss-react";
import { useFormContext } from "~/utils/form/context";

export function SubscribeButton({
	label,
	iconId,
	iconPosition,
}: {
	label: string;
	iconId?: FrIconClassName | RiIconClassName;
	iconPosition?: "left" | "right";
}) {
	const { classes } = useStyles();
	const form = useFormContext();

	return (
		<div className={classes.buttonWrapper}>
			<form.Subscribe
				selector={(state) => [state.isSubmitting, state.canSubmit]}
			>
				{([isSubmitting]) =>
					iconId && iconPosition ? (
						<Button
							disabled={isSubmitting}
							type="submit"
							iconId={iconId}
							iconPosition={iconPosition}
						>
							{label}
						</Button>
					) : (
						<Button disabled={isSubmitting} type="submit">
							{label}
						</Button>
					)
				}
			</form.Subscribe>
		</div>
	);
}

export function CancelButton({
	label = "Annuler",
	onClick,
	priority = "secondary",
	iconId,
	iconPosition,
	ariaLabel,
}: {
	label?: string;
	onClick?: () => void;
	priority?: "secondary" | "tertiary";
	iconId?: FrIconClassName | RiIconClassName;
	iconPosition?: "left" | "right";
	ariaLabel?: string;
}) {
	const { classes } = useStyles();
	const form = useFormContext();

	const handleClick = () => {
		if (onClick) {
			onClick();
			return;
		}

		try {
			(form as any)?.reset?.();
		} catch (error) {
			console.error("Error resetting the form:", error);
		}
	};

	return (
		<div className={classes.buttonWrapper}>
			{iconId && iconPosition ? (
				<Button
					type="button"
					priority={priority}
					onClick={handleClick}
					iconId={iconId}
					iconPosition={iconPosition}
					aria-label={ariaLabel}
				>
					{label}
				</Button>
			) : (
				<Button
					type="button"
					priority={priority}
					onClick={handleClick}
					aria-label={ariaLabel}
				>
					{label}
				</Button>
			)}
		</div>
	);
}

const useStyles = tss.withName(SubscribeButton.name).create(() => ({
	buttonWrapper: {
		display: "flex",
		justifyContent: "end",

		"& button": {
			"&::after": {
				marginBottom: "-3px",
			},
		},
	},
}));
