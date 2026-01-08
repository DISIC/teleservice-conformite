import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";

export async function linkToDeclaration(
  payload: Payload,
  declarationId: number,
  contactId: number
) {
  try {
    await payload.update({
      collection: "declarations",
      id: declarationId,
      data: {
        contact: contactId,
      },
    });
  } catch(error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to link contact to declaration: ${(error as Error).message}`,
    });
  }
};