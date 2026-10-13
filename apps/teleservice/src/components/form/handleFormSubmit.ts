import type { FormEvent } from "react";

type SubmittableForm = {
	handleSubmit: () => Promise<unknown>;
	state: { fieldMeta: Record<string, { errors: unknown[] } | undefined> };
};

// Native validation is off (noValidate), so focus must be moved to the first invalid field by hand.
export function handleFormSubmit(form: SubmittableForm) {
	return async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		const formElement = event.currentTarget;
		await form.handleSubmit();

		const invalidNames = new Set(
			Object.entries(form.state.fieldMeta)
				.filter(([, meta]) => meta && meta.errors.length > 0)
				.map(([name]) => name),
		);
		if (invalidNames.size === 0) return;

		requestAnimationFrame(() => {
			const field = Array.from(formElement.elements).find(
				(element) =>
					(element instanceof HTMLInputElement ||
						element instanceof HTMLSelectElement ||
						element instanceof HTMLTextAreaElement) &&
					element.type !== "hidden" &&
					invalidNames.has(element.name),
			);
			if (field instanceof HTMLElement) field.focus();
		});
	};
}
