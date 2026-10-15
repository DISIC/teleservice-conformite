import type { AnyFormApi } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { useEffect } from "react";
import type { SourceModeValue } from "~/domain/declaration/sourceMode";

// After a publish attempt, or when arriving from the error summary (`field` param),
// reveal every error in the Section, not only the focused field.
export function useRevealSectionErrors(
	form: AnyFormApi,
	publishAttempted: boolean,
	/** A Library Section mounts its fields only in custom mode, so re-reveal when the body swaps. */
	bodyMode: SourceModeValue | null,
) {
	const router = useRouter();
	const fieldParam =
		typeof router.query.field === "string" ? router.query.field : null;

	const reveal = publishAttempted || fieldParam !== null;

	useEffect(() => {
		if (!reveal) return;
		// Fields mounted in this same commit reset their meta on mount, so touch them a tick later.
		const id = setTimeout(() => {
			void form.validate("submit");
			for (const name of Object.keys(form.fieldInfo)) {
				form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }));
			}
		}, 0);
		return () => clearTimeout(id);
	}, [reveal, form, bodyMode]);
}
