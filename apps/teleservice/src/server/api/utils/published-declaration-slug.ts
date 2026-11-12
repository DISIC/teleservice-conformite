import { createHash } from "node:crypto";

export const computePublishedDeclarationSlug = (
	name: string | null | undefined,
	id: number,
) =>
	createHash("sha256")
		.update(`${name ?? ""}-${id}`)
		.digest("hex")
		.slice(0, 16);
