import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { Select } from "@codegouvfr/react-dsfr/SelectNext";

import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface SelectFieldProps extends DefaultFieldProps {
	options: Array<{
		label: string;
		value: string;
	}>;
	defaultStateMessage?: string;
	infoStateMessage?: string | React.ReactNode;
}

export function SelectField({
	label,
	options,
	disabled,
	className,
	readOnly = false,
	defaultStateMessage = "",
	infoStateMessage,
}: SelectFieldProps) {
	const { classes, cx } = useStyles();
	const field = useFieldContext<string>();

	return !readOnly ? (
		<>
			<Select
				label={label}
				nativeSelectProps={{
					name: field.name,
					value: field.state.value,
					onChange: (e) => field.setValue(e.target.value),
				}}
				options={options}
				disabled={disabled}
				state={field.state.meta.errors.length > 0 ? "error" : "default"}
				stateRelatedMessage={
					field.state.meta.errors.map((error) => error.message).join(",") ??
					defaultStateMessage
				}
				className={cx(className, classes.select)}
			/>
			{infoStateMessage && (
				<div className={classes.infoStateMessageContainer}>
					<i className={cx("fr-icon-information-fill", classes.infoIcon)} />
					<p className={cx(classes.infoStateMessage, fr.cx("fr-text--xs"))}>
						{infoStateMessage}
					</p>
				</div>
			)}
		</>
	) : (
		<ReadOnlyField
			label={label}
			value={
				options.find((option) => option.value === field.state.value)?.label ??
				""
			}
		/>
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
