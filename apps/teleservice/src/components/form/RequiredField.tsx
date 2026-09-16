import { fr } from "@codegouvfr/react-dsfr";
import type { ReactNode } from "react";
import { tss } from "tss-react";

/** Red asterisk flagging a required field, appended to its label. */
export function RequiredMark() {
	const { classes } = useStyles();
	return <span className={classes.mark}> *</span>;
}

/** Appends {@link RequiredMark} to a field label when the field is required. */
export function withRequiredMark(
	label: ReactNode,
	required?: boolean,
): ReactNode {
	if (!required) return label;
	return (
		<>
			{label}
			<RequiredMark />
		</>
	);
}

/** Caption explaining the asterisk convention, shown atop each editable section. */
export function RequiredFieldsNotice() {
	const { classes, cx } = useStyles();
	return (
		<p className={cx(fr.cx("fr-text--sm"), classes.notice)}>
			Les champs marqués ( <span className={classes.mark}>*</span> ) sont
			obligatoires.
		</p>
	);
}

const useStyles = tss.withName("RequiredField").create({
	mark: {
		color: fr.colors.decisions.text.default.error.default,
	},
	notice: {
		color: fr.colors.decisions.text.mention.grey.default,
		marginBottom: fr.spacing("4v"),
	},
});
