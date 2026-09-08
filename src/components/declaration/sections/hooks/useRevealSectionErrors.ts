import type { AnyFormApi } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { useEffect } from "react";

// A `field` query param means we arrived from the publish error summary: reveal
// every error in the Section, not only the focused field.
export function useRevealSectionErrors(form: AnyFormApi) {
	const router = useRouter();
	const fieldParam =
		typeof router.query.field === "string" ? router.query.field : null;

	useEffect(() => {
		if (!fieldParam) return;
		void form.validate("submit");
		for (const name of Object.keys(form.fieldInfo)) {
			form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }));
		}
	}, [fieldParam, form]);
}
