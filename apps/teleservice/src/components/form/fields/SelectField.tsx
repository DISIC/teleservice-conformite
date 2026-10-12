import { fr } from "@codegouvfr/react-dsfr";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { type ReactNode, useId } from "react";
import { tss } from "tss-react";
import {
	type DefaultFieldProps,
	getFieldState,
	useFieldContext,
} from "~/forms/context";
import { withRequiredMark } from "../RequiredField";
import { ReadOnlyField } from "./ReadOnlyField";

interface SelectFieldProps extends DefaultFieldProps {
	label: ReactNode;
	hint?: ReactNode;
	placeholder?: string;
	options: readonly { value: string; label: string }[];
	className?: string;
	/** Shown under the field and announced with it (aria-describedby). */
	infoStateMessage?: ReactNode;
}

// The legacy react-dsfr Select keeps a caller's aria-describedby in every state; SelectNext drops it outside errors.
export function SelectField(props: SelectFieldProps) {
	const {
		readOnlyField,
		required,
		infoStateMessage,
		label,
		hint,
		placeholder,
		options,
		className,
	} = props;
	const { classes, cx } = useStyles();
	const field = useFieldContext<string>();
	const infoId = useId();

	if (readOnlyField) {
		const value = String(
			options.find((option) => option.value === field.state.value)?.label ?? "",
		);
		return <ReadOnlyField label={label} value={value} />;
	}

	return (
		<>
			<Select
				label={withRequiredMark(label, required)}
				hint={hint}
				nativeSelectProps={{
					name: field.name,
					value: field.state.value ?? "",
					onChange: (e) => field.setValue(e.target.value),
					required,
					"aria-describedby": infoStateMessage ? infoId : undefined,
				}}
				{...getFieldState(field.state.meta)}
				className={cx(className, classes.select)}
			>
				<option value="" disabled>
					{placeholder ?? "Sélectionner une option"}
				</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</Select>
			{infoStateMessage && (
				<div className={classes.infoStateMessageContainer}>
					<i
						className={cx("fr-icon-information-fill", classes.infoIcon)}
						aria-hidden="true"
					/>
					<p
						id={infoId}
						className={cx(classes.infoStateMessage, fr.cx("fr-text--xs"))}
					>
						{infoStateMessage}
					</p>
				</div>
			)}
		</>
	);
}

const useStyles = tss.withName(SelectField.name).create({
	infoStateMessage: {
		color: fr.colors.decisions.text.default.info.default,
		margin: 0,
	},
	select: {
		marginBottom: `${fr.spacing("4v")} !important`,
	},
	infoIcon: {
		color: fr.colors.decisions.text.default.info.default,
		display: "flex",

		"&::before": {
			width: fr.spacing("3v"),
			height: fr.spacing("3v"),
		},
	},
	infoStateMessageContainer: {
		display: "flex",
		gap: fr.spacing("1v"),
		alignItems: "center",
	},
});
