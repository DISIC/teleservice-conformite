import type { FormEvent } from "react";

type SubmittableForm = {
	handleSubmit: () => Promise<unknown>;
	state: { isValid: boolean };
};

// Native validation is off (noValidate), so focus must be moved to the first invalid field by hand.
function focusFirstInvalidField(formElement: HTMLFormElement) {
	requestAnimationFrame(() => {
		const field = formElement.querySelector<HTMLElement>(
			'[class*="--error"] :is(input, select, textarea):not([type="hidden"])',
		);
		field?.focus();
	});
}

/** `onSubmit` for a `noValidate` form: submits through TanStack, then focuses the first error. */
export function submitForm(form: SubmittableForm) {
	return async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		const formElement = event.currentTarget;
		await form.handleSubmit();
		if (!form.state.isValid) focusFirstInvalidField(formElement);
	};
}
