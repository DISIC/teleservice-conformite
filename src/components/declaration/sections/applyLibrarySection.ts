import type { DeclarationChangeFn } from "~/components/declaration/sections/Content";
import type { LibrarySectionKind } from "~/domain/declaration/sourceMode";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

export type LibrarySectionResult<K extends LibrarySectionKind> = {
	data: PopulatedDeclaration[K];
	status: "published" | "unpublished" | null;
};

/** The returned slice doubles as a publish-gate validation override. */
export function applyLibrarySection<K extends LibrarySectionKind>(
	kind: K,
	onDeclarationChange: DeclarationChangeFn,
) {
	return (result: LibrarySectionResult<K>) => {
		const slice = { [kind]: result.data } as Pick<PopulatedDeclaration, K>;
		onDeclarationChange((prev) => ({
			...prev,
			...slice,
			status: result.status ?? prev.status,
		}));
		return slice;
	};
}
