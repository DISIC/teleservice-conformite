"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Notice } from "@codegouvfr/react-dsfr/Notice";

import {
	onNotification,
	showNotification,
	type NotificationEvent,
} from "~/utils/notification-event";

type Item = NotificationEvent & { id: string; expiresAt?: number };

function genId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return Math.random().toString(36).slice(2);
}

export function useNotifications() {
	const [items, setItems] = useState<Item[]>([]);
	const timers = useRef<Map<string, number>>(new Map());

	useEffect(() => {
		const unsubscribe = onNotification((evt) => {
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

export function NotificationHost() {
	const { items, remove } = useNotifications();

	const containerStyle = useMemo(
		() => ({
			position: "fixed" as const,
			top: 16,
			right: 16,
			zIndex: 10000,
			display: "flex",
			flexDirection: "column" as const,
			gap: 12,
			maxWidth: "100%",
			width: "100vw",
			pointerEvents: "none" as const,
		}),
		[],
	);

	const itemStyle = useMemo(() => ({ pointerEvents: "auto" as const }), []);

	return (
		<div style={containerStyle} aria-live="polite" aria-atomic>
			{items.map(({ id, ...n }) => (
				<div key={id} style={itemStyle}>
					<Notice
						title={n.title}
						description={n.description}
						severity={n.severity}
						iconDisplayed={n.iconDisplayed}
						link={n.link}
						{...(n.isClosable === false
							? { isClosable: false as const }
							: { isClosable: true as const, onClose: () => remove(id) })}
					/>
				</div>
			))}
		</div>
	);
}

// Convenience re-export so consumers can import from one place if desired
NotificationHost.show = showNotification;

export default NotificationHost;
