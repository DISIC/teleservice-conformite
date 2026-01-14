import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

import type { DefaultFieldProps } from "~/utils/form/context";

interface ReadOnlyFieldProps extends DefaultFieldProps {
	value: string | string[];
	textArea?: boolean;
}

export function ReadOnlyField(props: ReadOnlyFieldProps) {
	const {
		label,
		placeholder = "Non",
		className,
		value,
		textArea = false,
	} = props;
	const { classes } = useStyles();
	const valueIsArray = Array.isArray(value);

	return (
		<div
			className={
				valueIsArray || textArea ? classes.flexWrapper : classes.inlineWrapper
			}
		>
			<p className={classes.label}>{label} :</p>
			{valueIsArray ? (
				<ul className={classes.list}>
					{value.map((item, index) => (
						<li key={index} className={classes.value}>
							{item}
						</li>
					))}
				</ul>
			) : (
				<p className={classes.value}> {value || placeholder}</p>
			)}
		</div>
	);
}

const useStyles = tss.withName(ReadOnlyField.name).create({
	p: {
		margin: 0,
	},
	inlineWrapper: {
		display: "inline-flex",
	},
	flexWrapper: {
		display: "flex",
		flexDirection: "column",
	},
	label: {
		fontWeight: 700,
		fontSize: "1rem",
		lineHeight: "1.5rem",
		fontFamily: "Marianne",
		color: fr.colors.decisions.text.label.grey.default,
	},
	list: {},
	value: {
		fontWeight: 400,
		fontSize: "1rem",
		lineHeight: "1.5rem",
		fontFamily: "Marianne",
		color: fr.colors.decisions.text.label.grey.default,
		whiteSpace: "pre-wrap",
	},
});
