import Badge from "@codegouvfr/react-dsfr/Badge";
import { tss } from "tss-react";

interface BetaBadgeProps {
	color: string;
	backgroundColor: string;
}

export default function BetaBadge({ color, backgroundColor }: BetaBadgeProps) {
	const { classes } = useStyles({ color, backgroundColor });

	return (
		<Badge as="span" small noIcon className={classes.betaTag}>
			beta
		</Badge>
	);
}

const useStyles = tss
	.withName(BetaBadge.name)
	.withParams<{ color: string; backgroundColor: string }>()
	.create(({ color, backgroundColor }) => ({
		betaTag: {
			backgroundColor,
			color,
		},
	}));
