import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";

import { useInDefinitionList } from "~/components/form/Part";
import type { DefaultFieldProps } from "~/forms/context";

interface ReadOnlyFieldProps extends DefaultFieldProps {
	label: ReactNode;
	placeholder?: string;
	value: string | string[];
	textArea?: boolean;
	addSectionBorder?: boolean;
	link?: boolean;
}

export function ReadOnlyField(props: ReadOnlyFieldProps) {
	const {
		label,
		placeholder = "Non",
		value,
		textArea = false,
		addSectionBorder = false,
		link = false,
	} = props;
	const valueIsArray = Array.isArray(value);
	const inDefinitionList = useInDefinitionList();

	const { classes } = useStyles({
		valueIsArray,
		textArea,
		addSectionBorder,
	});

	const valueContent = valueIsArray ? (
		<ul className={fr.cx("fr-ml-3v")}>
			{value.map((item, index) => (
				<li key={index}>
					<span className={classes.value}>{item}</span>
				</li>
			))}
		</ul>
	) : link && value ? (
		<a href={value}>{value}</a>
	) : (
		value || placeholder
	);

	if (inDefinitionList) {
		return (
			<div className={classes.fieldContainer}>
				<dt className={classes.label}>{label}</dt>
				<dd className={classes.value}>{valueContent}</dd>
			</div>
		);
	}

	return (
		<div className={classes.fieldContainer}>
			{label && <p className={classes.label}>{label}</p>}
			{valueIsArray ? (
				valueContent
			) : (
				<p className={classes.value}>{valueContent}</p>
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
	.create(({ addSectionBorder, valueIsArray }) => ({
		fieldContainer: {
			gap: valueIsArray ? undefined : fr.spacing("2v"),
			"& p, & dd": {
				margin: 0,
				padding: 0,
			},
			...(addSectionBorder && {
				borderTop: `10px solid ${fr.colors.decisions.border.default.grey.default}`,
			}),
			flexDirection: "column",
			display: "flex",
			flexWrap: "wrap",
			"@media (max-width: 1024px)": {
				flexDirection: "column",
				gap: fr.spacing("2v"),
			},
		},
		label: {
			fontWeight: 700,
			color: fr.colors.decisions.text.label.grey.default,
		},
		value: {
			color: fr.colors.decisions.text.label.grey.default,
			whiteSpace: "pre-wrap",
			"& a": {
				color: fr.colors.decisions.text.actionHigh.blueFrance.default,
			},
		},
	}));
