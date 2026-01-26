import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

import { useFieldContext } from "~/utils/form/context";

interface SelectCardFieldProps {
	label: string;
	options: {
		id: string;
		image: React.ReactNode;
		label: string;
		description?: string;
	}[];
}

export function SelectCardField(props: SelectCardFieldProps) {
	const { options = [], label } = props;
	const field = useFieldContext<string>();
	const { classes, cx } = useStyles();

	return (
		<div className={classes.fieldWrapper}>
			<span>{label}</span>
			{options.map(({ id, image, label, description }, index) => (
				<div
					id={id}
					key={index}
					className={cx(
						classes.optionCard,
						id === field.state.value && classes.selectedOptionCard,
					)}
					onMouseDown={() => field.setValue(id)}
				>
					{image}
					<span>
						<p className={classes.title}>{label}</p>
						{description && (
							<p className={classes.description}>{description}</p>
						)}
					</span>
				</div>
			))}
		</div>
	);
}

const useStyles = tss.withName(SelectCardField.name).create({
	fieldWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4w"),
	},
	optionCard: {
		display: "flex",
		flexDirection: "row",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: fr.spacing("4w"),
		alignItems: "center",
		gap: fr.spacing("2w"),

		"& p": {
			margin: 0,
		},

		"& span": {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("2w"),
		},
	},
	title: {
		fontWeight: 700,
		fontSize: "1rem",
		lineHeight: "1.5rem",
		color: fr.colors.decisions.text.title.grey.default,
	},
	description: {
		color: fr.colors.decisions.text.default.grey.default,
		fontSize: "0.875rem",
		lineHeight: "1.25rem",
		fontWeight: 400,
	},
	selectedOptionCard: {
		backgroundColor: fr.colors.decisions.background.raised.grey.active,
	},
});
