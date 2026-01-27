export type AlertSeverity = "info" | "warning" | "error" | "success";

export type AlertEvent = {
	title: string;
	description: string;
	severity: AlertSeverity;
	iconDisplayed?: boolean;
	isClosable?: boolean;
	link?: { linkProps: { href: string }; text: string };
	durationMs?: number;
};

type Listener = (event: AlertEvent) => void;

const listeners = new Set<Listener>();

export const alertEvents = {
	on(listener: Listener) {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},
	off(listener: Listener) {
		listeners.delete(listener);
	},
	emit(event: AlertEvent) {
		for (const l of Array.from(listeners)) l(event);
	},
};

export function showAlert(event: AlertEvent) {
	alertEvents.emit(event);
}

export function onAlert(listener: Listener) {
	return alertEvents.on(listener);
}

export function offAlert(listener: Listener) {
	alertEvents.off(listener);
}

