import { fr } from "@codegouvfr/react-dsfr";
import type { InputHTMLAttributes } from "react";
import { useRef } from "react";
import { tss } from "tss-react";

import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface SelectCardFieldProps extends DefaultFieldProps {
	label: string;
	options: {
		value: string;
		image: React.ReactNode;
		label: string;
		description?: string;
		nativeInputProps?: Omit<
			InputHTMLAttributes<HTMLInputElement>,
			"value" | "checked" | "onChange" | "name" | "type"
		>;
	}[];
	onOptionChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

export function SelectCardField(props: SelectCardFieldProps) {
	const {
		readOnlyField,
		required,
		onOptionChange,
		disabled,
		className,
		label,
		options = [],
	} = props;
	const field = useFieldContext<string>();
	const { classes, cx } = useStyles();
	const inputRef = useRef<Record<string, HTMLInputElement | null>>({});

	if (readOnlyField) {
		const selectedOption = options.find((o) => o.value === field.state.value);
		return <ReadOnlyField label={label} value={selectedOption?.label ?? ""} />;
	}

	return (
		<div className={cx(classes.fieldWrapper, className)}>
			<label htmlFor={field.name}>{label}</label>
			{options.map(({ value, ...option }) => {
				const inputId = `${field.name}-${value}`;
				const checked = field.state.value === value;

				return (
					<div key={value} className={classes.optionWrapper}>
						<input
							ref={(element) => {
								inputRef.current[value] = element;
							}}
							{...option}
							{...option.nativeInputProps}
							id={inputId}
							name={field.name}
							type="radio"
							checked={checked}
							disabled={option.nativeInputProps?.disabled ?? disabled}
							required={option.nativeInputProps?.required ?? required}
							onChange={() => {
								field.setValue(value);
								onOptionChange?.(value);
							}}
							className={classes.hiddenRadio}
						/>
						<label
							htmlFor={inputId}
							className={cx(
								classes.optionButton,
								checked && classes.optionButtonChecked,
								(option.nativeInputProps?.disabled ?? disabled) &&
									classes.optionButtonDisabled,
							)}
						>
							{option.image}
							<span>
								<p className={classes.label}>{option.label}</p>
								{option.description && (
									<p className={cx(classes.description, fr.cx("fr-text--sm"))}>
										{option.description}
									</p>
								)}
							</span>
						</label>
					</div>
				);
			})}
		</div>
	);
}

const useStyles = tss.withName(SelectCardField.name).create({
	fieldWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("4v"),
	},
	optionWrapper: {
		display: "flex",
		alignItems: "center",
	},
	hiddenRadio: {
		position: "absolute",
		opacity: 0,
		pointerEvents: "none",

		"&:focus + label": {
			outline: `2px solid ${fr.colors.decisions.border.actionHigh.blueFrance.default}`,
			outlineOffset: "2px",
		},
	},
	optionButton: {
		display: "flex",
		flexDirection: "row",
		border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
		padding: fr.spacing("6v"),
		alignItems: "center",
		gap: fr.spacing("6v"),
		cursor: "pointer",
		width: "100%",
		backgroundColor: fr.colors.decisions.background.default.grey.default,

		"@media (max-width: 830px)": {
			flexDirection: "column",
		},

		"&:hover": {
			backgroundColor: fr.colors.decisions.background.default.grey.hover,
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
	optionButtonChecked: {
		backgroundColor: fr.colors.decisions.background.raised.grey.active,

		"& > span > h2": {
			color: fr.colors.decisions.text.actionHigh.blueFrance.default,
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
	optionButtonDisabled: {
		opacity: 0.5,
		cursor: "not-allowed",
		pointerEvents: "none",
	},
});
