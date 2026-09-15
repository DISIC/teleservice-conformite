import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" ADD COLUMN "first_published_at" timestamp(3) with time zone;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_first_published_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" DROP COLUMN "first_published_at";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_first_published_at";`)
}
