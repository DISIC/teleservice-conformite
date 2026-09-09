import type { DeclarationChangeFn } from "~/components/declaration/sections/Content";
import type { PopulatedDeclaration } from "~/server/api/utils/payload-helper";

/** Folds a save's returned Declaration into page state; the value doubles as a publish-gate override. */
export function applySavedDeclaration(
	onDeclarationChange: DeclarationChangeFn,
) {
	return ({ data }: { data: PopulatedDeclaration }) => {
		onDeclarationChange(() => data);
		return data;
	};
}
