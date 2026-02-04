import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" ADD COLUMN "published_content" varchar;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_published_content" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" DROP COLUMN "published_content";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_published_content";`)
}
