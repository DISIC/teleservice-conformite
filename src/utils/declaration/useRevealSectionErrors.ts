import type { AnyFormApi } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Arriving from the publish error summary carries a `field` query param; surface
// every error in the Section, not only the focused field. Runs on each effect
// pass (no one-shot guard) so it re-applies after a field remount re-registers
// the field and clears its errors.
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
