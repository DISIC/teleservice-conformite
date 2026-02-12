import { useRef } from "react";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

import { useFieldContext } from "~/utils/form/context";

interface SelectCardFieldProps {
	name: string;
	label: string;
	options: {
		id: string;
		image: React.ReactNode;
		label: string;
		description?: string;
	}[];
	onChange: (value: string) => void;
}

export function SelectCardField(props: SelectCardFieldProps) {
	const { name, options = [], label, onChange } = props;
	const field = useFieldContext<string>();
	const { classes, cx } = useStyles();
	const inputRef = useRef<(HTMLInputElement | null)[]>([]);

	return (
		<div className={classes.fieldWrapper}>
			<label htmlFor={name}>{label}</label>
			{options.map(({ id, image, label, description }, index) => (
				<button
					type="button"
					id={id}
					key={index}
					className={classes.optionCard}
					onClick={() => inputRef.current[index]?.click()}
				>
					{image}
					<span>
						<h2 className={classes.label}>{label}</h2>
						{description && (
							<p className={cx(classes.description, fr.cx("fr-text--sm"))}>
								{description}
							</p>
						)}
					</span>
					<input
						ref={(element) => {
							inputRef.current[index] = element;
						}}
						key={index}
						type="radio"
						name={name}
						id={id}
						onChange={() => {
							onChange(id);
							field.setValue(id);
						}}
					/>
				</button>
			))}
		</div>
	);
}

const useStyles = tss.withName(SelectCardField.name).create({
	fieldWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
	},
	optionCard: {
		display: "flex",
		flexDirection: "row",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: fr.spacing("6v"),
		alignItems: "center",
		gap: fr.spacing("6v"),

		"&:hover": {
			backgroundColor: fr.colors.decisions.background.default.grey.hover,
		},

		"& input[type='radio']": {
			display: "none",
		},

		"&:has(input[type='radio']:checked)": {
			backgroundColor: fr.colors.decisions.background.raised.grey.active,

			"& > span > h2": {
				color: fr.colors.decisions.text.actionHigh.blueFrance.default,
			},
		},

		"& p": {
			margin: 0,
			textAlign: "left",
		},

		"& span": {
			display: "flex",
			flexDirection: "column",
			gap: fr.spacing("2w"),
		},
	},
	label: {
		color: fr.colors.decisions.text.title.grey.default,
		margin: 0,
		textAlign: "left",
		fontSize: fr.typography[19].style.fontSize,
		lineHeight: fr.typography[19].style.lineHeight,
		fontWeight: 700,
	},
	description: {
		color: fr.colors.decisions.text.default.grey.default,
	},
});
