import type { Payload } from "payload";

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

export async function getDeclarationById(
	payload: Payload,
	declarationId: number,
) {
	try {
		const result = await payload.findByID({
			collection: "declarations",
			id: declarationId,
			depth: 3,
		});

		if (!result) {
			return null;
		}

		const declaration = {
			...result,
			updatedAtFormatted: new Intl.DateTimeFormat("fr-FR", {
				dateStyle: "short",
				timeStyle: "short",
				timeZone: "Europe/Paris",
			}).format(new Date(result.updatedAt)),
		};

		return declaration;
	} catch (error) {
		console.error("Error fetching declaration by ID:", error);

		return null;
	}
}