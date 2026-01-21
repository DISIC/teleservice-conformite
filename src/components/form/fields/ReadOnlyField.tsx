import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

import type { DefaultFieldProps } from "~/utils/form/context";

interface ReadOnlyFieldProps extends DefaultFieldProps {
	value: string | string[];
	textArea?: boolean;
	addSectionBorder?: boolean;
	link?: boolean;
}

export function ReadOnlyField(props: ReadOnlyFieldProps) {
	const {
		label,
		placeholder = "Non",
		className,
		value,
		textArea = false,
		addSectionBorder = false,
		link = false,
	} = props;
	const valueIsArray = Array.isArray(value);

	const { classes } = useStyles({
		valueIsArray,
		textArea,
		addSectionBorder,
	});

	return (
		<div className={classes.fieldContainer}>
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
				<p className={classes.value}>
					{link && value ? <a href={value}>{value}</a> : value || placeholder}
				</p>
			)}
		</div>
	);
}

const useStyles = tss
	.withName(ReadOnlyField.name)
	.withParams<{
		valueIsArray: boolean;
		textArea: boolean;
		addSectionBorder: boolean;
	}>()
	.create(({ valueIsArray, textArea, addSectionBorder }) => ({
		fieldContainer: {
			paddingBlock: fr.spacing("3w"),
			borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
			"& p": {
				margin: 0,
			},
			...(addSectionBorder && {
				borderTop: `10px solid ${fr.colors.decisions.border.default.grey.default}`,
			}),
			...(valueIsArray || textArea
				? {
						display: "flex",
						flexDirection: "column",
					}
				: {
						display: "inline-flex",
					}),
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

			"& a": {
				color: fr.colors.decisions.text.actionHigh.blueFrance.default,
			},
		},
	}));
