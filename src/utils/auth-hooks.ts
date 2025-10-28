import { createAuthMiddleware } from "better-auth/plugins";
import { getPayload } from "payload";
import type { Entity } from "~/payload/payload-types";
import payloadConfig from "~/payload/payload.config";

export const upsertEntityToUser = createAuthMiddleware(async (ctx) => {
  if (ctx.params?.id === "proconnect") {
    const payload = await getPayload({ config: payloadConfig });

    if (!ctx.context.newSession) return;

    const user = await payload.findByID({
      collection: "users",
      id: ctx.context.newSession?.user.id,
      depth: 1,
    });

    if (user?.siret && !user.entity) {
      const entities = await payload.find({
        collection: "entities",
        where: {
          siret: { equals: user.siret },
        },
      });

      if (entities.docs && entities.docs.length > 0) {
        const { id } = entities.docs[0] as Entity;
        await payload.update({
          collection: "users",
          id: user.id,
          data: { entity: id },
        });
      } else {
        const newEntity = await payload.create({
          collection: "entities",
          data: {
            name: `Entité de ${user.siret}`,
            siret: user.siret,
          },
        });

        await payload.update({
          collection: "users",
          id: user.id,
          data: { entity: newEntity.id },
        });
      }
    }
  }
});
