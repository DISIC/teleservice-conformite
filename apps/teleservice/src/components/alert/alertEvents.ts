export type AlertSeverity = "info" | "warning" | "error" | "success";

export type AlertEvent = {
	title: string;
	description?: string;
	severity: AlertSeverity;
	iconDisplayed?: boolean;
	isClosable?: boolean;
	link?: { linkProps: { href: string }; text: string };
	durationMs?: number;
};

type Listener = (event: AlertEvent) => void;

const listeners = new Set<Listener>();

export function showAlert(event: AlertEvent) {
	for (const listener of Array.from(listeners)) listener(event);
}

/** Returns the unsubscribe function. */
export function onAlert(listener: Listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
