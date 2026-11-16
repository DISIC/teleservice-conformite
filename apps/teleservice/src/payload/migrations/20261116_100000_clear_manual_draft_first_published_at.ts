import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// A manual declaration never published has no initial publication date: its first publish sets it.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "declarations" SET "first_published_at" = NULL
    WHERE "from_source" = 'manual' AND "published_at" IS NULL;
  UPDATE "_declarations_v" SET "version_first_published_at" = NULL
    WHERE "version_from_source" = 'manual' AND "version_published_at" IS NULL;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
