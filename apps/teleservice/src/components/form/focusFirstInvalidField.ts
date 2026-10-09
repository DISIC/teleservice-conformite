// Native validation is off (noValidate), so focus must be moved to the first invalid field by hand.
export function focusFirstInvalidField(formElement: HTMLFormElement) {
	requestAnimationFrame(() => {
		const field = formElement.querySelector<HTMLElement>(
			'[class*="--error"] :is(input, select, textarea):not([type="hidden"])',
		);
		field?.focus();
	});
}
