import { useEffect, useRef, useState } from "react";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

import { onAlert, showAlert, type AlertEvent } from "~/utils/alert-event";

type Item = AlertEvent & { id: string; expiresAt?: number };

function genId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return Math.random().toString(36).slice(2);
}

export function useAlert() {
	const [items, setItems] = useState<Item[]>([]);
	const timers = useRef<Map<string, number>>(new Map());

	useEffect(() => {
		const unsubscribe = onAlert((evt) => {
			const id = genId();
			const duration = evt.durationMs ?? 5000;
			const expiresAt = duration > 0 ? Date.now() + duration : undefined;
			setItems((prev) => [{ id, expiresAt, ...evt }, ...prev]);

			if (duration > 0) {
				const handle = window.setTimeout(() => {
					setItems((prev) => prev.filter((i) => i.id !== id));
					timers.current.delete(id);
				}, duration);
				timers.current.set(id, handle);
			}
		});
		return () => {
			for (const handle of timers.current.values()) window.clearTimeout(handle);
			timers.current.clear();
			unsubscribe();
		};
	}, []);

	const remove = (id: string) => {
		const handle = timers.current.get(id);
		if (handle) window.clearTimeout(handle);
		timers.current.delete(id);
		setItems((prev) => prev.filter((i) => i.id !== id));
	};

	return { items, remove } as const;
}

export function AlertHost() {
	const { items, remove } = useAlert();

	const { classes } = useStyles();

	return (
		<div className={classes.container} aria-live="polite" aria-atomic>
			{items.map(({ id, ...n }) => (
				<div key={id} className={classes.item}>
					<Alert
						severity={n.severity}
						title={n.title}
						description={n.description}
						closable={true}
						onClose={() => remove(id)}
					/>
				</div>
			))}
		</div>
	);
}

const useStyles = tss.withName(AlertHost.name).create({
	container: {
		position: "fixed" as const,
		top: 16,
		right: 10,
		zIndex: 10000,
		display: "flex",
		flexDirection: "column" as const,
		gap: 12,
		maxWidth: "100%",
		width: "50vw",
		pointerEvents: "none" as const,
		backgroundColor: fr.colors.decisions.background.default.grey.default,
	},
	item: {
		pointerEvents: "auto" as const,
	},
});

AlertHost.show = showAlert;

export default AlertHost;
