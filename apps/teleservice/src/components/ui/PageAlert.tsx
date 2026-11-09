import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useEffect, useRef } from "react";
import { tss } from "tss-react";

const SUCCESS_ALERT_DURATION_MS = 5000;

export type AlertDetails = {
	description: string;
	severity: "success" | "error";
};

type Props = {
	alert: AlertDetails | null;
	onClose: () => void;
};

export const PageAlert = ({ alert, onClose }: Props) => {
	const { classes } = useStyles();
	const alertRef = useRef<HTMLDivElement>(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	useEffect(() => {
		if (!alert) return;
		alertRef.current?.focus();
		if (alert.severity !== "success") return;

		const timeout = setTimeout(
			() => onCloseRef.current(),
			SUCCESS_ALERT_DURATION_MS,
		);
		return () => clearTimeout(timeout);
	}, [alert]);

	if (!alert) return null;

	return (
		<div className={classes.alertWrapper} ref={alertRef} tabIndex={-1}>
			<Alert
				small
				severity={alert.severity}
				description={alert.description}
				closable
				onClose={onClose}
			/>
		</div>
	);
};

const useStyles = tss.withName(PageAlert.name).create({
	alertWrapper: {
		width: "100%",
		display: "flex",
		"& div": {
			width: "100%",
		},
		marginBottom: fr.spacing("6v"),
		animation: "fadeIn 0.25s ease-in-out",
	},
});
