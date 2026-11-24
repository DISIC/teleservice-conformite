import { useRouter } from "next/router";
import { useCallback } from "react";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";
import { sectionHref } from "~/domain/declaration/sections";
import { validateDeclaration } from "~/domain/declaration/validate";
import { usePendingSourceModes } from "../PendingSourceModes";

type UseDepositAttemptArgs = {
	declaration: PopulatedDeclaration;
	/** Arms the page-level error summary when a sequential deposit surfaces errors. */
	onDepositAttempt?: () => void;
};

/**
 * Shared deposit navigation used by both the terminal Contact footer CTA and the
 * top-of-page StateNotice CTA. `attemptDeposit` arms the error summary, validates
 * the whole declaration, then routes to preview or the first errored Section.
 * The first errored field takes the focus; the error summary announces the rest.
 */
export function useDepositAttempt({
	declaration,
	onDepositAttempt,
}: UseDepositAttemptArgs) {
	const router = useRouter();
	const { pending } = usePendingSourceModes();

	const goToPreview = useCallback(() => {
		router.push(`/dashboard/declarations/${declaration.id}/preview`);
	}, [router, declaration.id]);

	const attemptDeposit = useCallback(
		(override?: Partial<PopulatedDeclaration>) => {
			onDepositAttempt?.();
			const [firstError] = validateDeclaration(
				{ ...declaration, ...override },
				pending,
			);
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
		[declaration, pending, onDepositAttempt, goToPreview, router],
	);

	return { attemptDeposit };
}
