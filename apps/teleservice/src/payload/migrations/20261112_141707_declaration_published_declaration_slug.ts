import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" ADD COLUMN "published_declaration_slug" varchar;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_published_declaration_slug" varchar;
  CREATE UNIQUE INDEX "declarations_published_declaration_slug_idx" ON "declarations" USING btree ("published_declaration_slug");
  CREATE INDEX "_declarations_v_version_version_published_declaration_slug_idx" ON "_declarations_v" USING btree ("version_published_declaration_slug");
  UPDATE "declarations"
    SET "published_declaration_slug" = left(encode(sha256(convert_to(coalesce("name", '') || '-' || "id"::text, 'UTF8')), 'hex'), 16)
    WHERE "published_content" IS NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "declarations_published_declaration_slug_idx";
  DROP INDEX "_declarations_v_version_version_published_declaration_slug_idx";
  ALTER TABLE "declarations" DROP COLUMN "published_declaration_slug";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_published_declaration_slug";`)
}
