import { TRPCError } from "@trpc/server";
import type { Payload } from "payload";

const declaration = {
  name: "Nom de la declaration 1",
  date: "2024-01-15",
  created_by: 1,
  entity: 1,
  app_kind: "website",
  url: "https://www.example.com",
}

export async function seedDeclarations(payload: Payload) {
  try {
    await payload.create({
      collection: "declarations",
      data: declaration,
    });

  } catch (error) {
    console.error("Error seeding declaration:", error);
  }
}