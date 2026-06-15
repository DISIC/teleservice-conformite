import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" ADD COLUMN "schema_skipped" boolean DEFAULT false NOT NULL;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_schema_skipped" boolean DEFAULT false NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" DROP COLUMN "schema_skipped";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_schema_skipped";`)
}
