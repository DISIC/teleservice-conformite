import type { AnyFormApi } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { useEffect } from "react";

// After a publish attempt, or when arriving from the error summary (`field` param),
// reveal every error in the Section, not only the focused field.
export function useRevealSectionErrors(
	form: AnyFormApi,
	publishAttempted: boolean,
) {
	const router = useRouter();
	const fieldParam =
		typeof router.query.field === "string" ? router.query.field : null;

	const reveal = publishAttempted || fieldParam !== null;

	useEffect(() => {
		if (!reveal) return;
		void form.validate("submit");
		for (const name of Object.keys(form.fieldInfo)) {
			form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }));
		}
	}, [reveal, form]);
}
