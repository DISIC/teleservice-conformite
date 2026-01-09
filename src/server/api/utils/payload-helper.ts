import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";

export async function linkToDeclaration(
	payload: Payload,
	declarationId: number,
	keyId: number,
	keyName = "contact",
) {
	try {
    await payload.update({
      collection: "declarations",
      id: declarationId,
      data: {
        [keyName]: keyId,
      }
	,
}
)
} catch(error)
{
	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: `Failed to link contact to declaration: ${(error as Error).message}`,
	});
}
}
