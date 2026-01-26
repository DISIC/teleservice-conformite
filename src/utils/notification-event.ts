export type NotificationSeverity = "info" | "warning" | "alert";

export type NotificationEvent = {
	title: string;
	description: string;
	severity: NotificationSeverity;
	iconDisplayed?: boolean;
	isClosable?: boolean;
	link?: { linkProps: { href: string }; text: string };
	durationMs?: number;
};

type Listener = (event: NotificationEvent) => void;

const listeners = new Set<Listener>();

export const notificationEvents = {
	on(listener: Listener) {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},
	off(listener: Listener) {
		listeners.delete(listener);
	},
	emit(event: NotificationEvent) {
		for (const l of Array.from(listeners)) l(event);
	},
};

export function showNotification(event: NotificationEvent) {
	notificationEvents.emit(event);
}

export function onNotification(listener: Listener) {
	return notificationEvents.on(listener);
}

export function offNotification(listener: Listener) {
	notificationEvents.off(listener);
}

