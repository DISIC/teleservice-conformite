import { useRouter } from "next/router";
import { useCallback } from "react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { sectionHref } from "./sections";
import { validateDeclaration } from "./validateDeclaration";

type UsePublishAttemptArgs = {
	declaration: PopulatedDeclaration;
	/** Arms the page-level error summary when a sequential publish surfaces errors. */
	onPublishAttempt?: () => void;
};

/**
 * The shared "publish" navigation used by both the terminal Contact footer CTA
 * and the top-of-page StateNotice CTA, so the two can't drift.
 *
 * - `goToPreview` — navigate straight to `/preview` with no validation guard.
 *   Used by the standalone (`published-modified`) notice CTA: a published
 *   declaration is always publishable (CONTEXT.md Invariants).
 * - `attemptPublish` — the sequential (Brouillon) gate: arm the error summary,
 *   validate the whole declaration, then either go to `/preview` or route to the
 *   first errored Section's field. `override` lets the Contact save validate
 *   against its freshly-upserted value before page state has caught up.
 */
export function usePublishAttempt({
	declaration,
	onPublishAttempt,
}: UsePublishAttemptArgs) {
	const router = useRouter();

	const goToPreview = useCallback(() => {
		router.push(`/dashboard/declarations/${declaration.id}/preview`);
	}, [router, declaration.id]);

	const attemptPublish = useCallback(
		(override?: Partial<PopulatedDeclaration>) => {
			onPublishAttempt?.();
			const [firstError] = validateDeclaration({ ...declaration, ...override });
			if (!firstError) {
				goToPreview();
				return;
			}
			router.push(
				sectionHref(declaration.id, firstError.section, firstError.field),
				undefined,
				{ shallow: true, scroll: false },
			);
		},
		[declaration, onPublishAttempt, goToPreview, router],
	);

	return { goToPreview, attemptPublish };
}
