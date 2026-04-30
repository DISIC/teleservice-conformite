import { fr } from "@codegouvfr/react-dsfr";
import { Select, type SelectProps } from "@codegouvfr/react-dsfr/SelectNext";
import { tss } from "tss-react";
import { type DefaultFieldProps, useFieldContext } from "~/utils/form/context";
import { ReadOnlyField } from "./ReadOnlyField";

interface SelectFieldProps
	extends DefaultFieldProps,
		SelectProps<SelectProps.Option[]> {
	infoStateMessage?: string | React.ReactNode;
}

export function SelectField(props: SelectFieldProps) {
	const { readOnlyField, required, infoStateMessage, ...commonProps } = props;
	const { classes, cx } = useStyles();
	const field = useFieldContext<string>();

	if (readOnlyField) {
		const value = String(
			commonProps.options.find((option) => option.value === field.state.value)
				?.label ?? "",
		);
		return <ReadOnlyField label={commonProps.label} value={value} />;
	}

	return (
		<>
			<Select
				{...commonProps}
				nativeSelectProps={{
					name: field.name,
					value: field.state.value,
					onChange: (e) => field.setValue(e.target.value),
					required,
				}}
				state={field.state.meta.errors.length > 0 ? "error" : "default"}
				stateRelatedMessage={
					field.state.meta.errors.map((error) => error.message).join(",") ??
					commonProps.stateRelatedMessage
				}
				className={cx(commonProps.className, classes.select)}
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
