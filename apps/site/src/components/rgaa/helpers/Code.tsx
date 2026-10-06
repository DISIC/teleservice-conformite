"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

export default function Code({ children }: { children: string }) {
	const { classes } = useStyles();

	return <code className={classes.code}>{children}</code>;
}

const useStyles = tss.withName("Markdown").create({
	code: {
		border: `1px solid ${fr.colors.decisions.border.default.beigeGrisGalet.default}`,
		padding: fr.spacing("1v"),
	},
});
