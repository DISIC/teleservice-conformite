import { FieldApi, FormApi } from "@tanstack/react-form";
import { describe, expect, it } from "vitest";
import { contactFormOptions } from "~/forms/contact/contactSchema";

function mountContactForm(onSubmit?: () => void) {
	const form = new FormApi({ ...contactFormOptions, onSubmit });
	form.mount();
	const field = (name: "name" | "email" | "url") => {
		const api = new FieldApi({ form, name });
		api.mount();
		return api;
	};
	return {
		form,
		name: field("name"),
		email: field("email"),
		url: field("url"),
	};
}

const messages = (field: { state: { meta: { errors: unknown[] } } }) =>
	field.state.meta.errors.map(
		(error) => (error as { message: string }).message,
	);

const NEEDS_A_CHANNEL = "Renseignez au moins un email ou une URL de formulaire";

describe("contact form validation", () => {
	it("clears the email-or-url error on both fields once one channel is filled, even after a blocked submit", () => {
		const { form, name, email, url } = mountContactForm();

		email.setValue("a");
		email.setValue("");
		url.setValue("a");
		url.setValue("");
		expect(messages(email)).toEqual([NEEDS_A_CHANNEL]);
		expect(messages(url)).toEqual([NEEDS_A_CHANNEL]);

		// A submit the browser's own required check blocks reveals the form's
		// errors without going through each field.
		form.validate("submit");

		name.setValue("Référent");
		email.setValue("contact@monservice.fr");

		expect(messages(email)).toEqual([]);
		expect(messages(url)).toEqual([]);
	});

	it("gates the submit on the same rules", async () => {
		let submissions = 0;
		const { form, name, email } = mountContactForm(() => {
			submissions += 1;
		});

		name.setValue("Référent");
		await form.handleSubmit();
		expect(submissions).toBe(0);

		email.setValue("contact@monservice.fr");
		await form.handleSubmit();
		expect(submissions).toBe(1);
	});

	it("keeps flagging a malformed url once an email is filled", () => {
		const { email, url } = mountContactForm();

		email.setValue("contact@monservice.fr");
		url.setValue("pas-une-url");

		expect(messages(url)).toEqual([
			"Lien invalide (ex: https://www.example.fr)",
		]);
	});
});
