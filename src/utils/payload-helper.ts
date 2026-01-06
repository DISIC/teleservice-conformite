export function isPopulated<T>(relation: number | T): relation is T {
	return typeof relation === "object" && relation !== null;
}

export function getPopulated<T>(relation: number | T): T | null {
	return isPopulated(relation) ? relation : null;
}

export function getPopulatedArray<T>(
	relations: (number | T)[] | undefined,
): T[] {
	if (!relations) return [];
	return relations.filter(isPopulated);
}