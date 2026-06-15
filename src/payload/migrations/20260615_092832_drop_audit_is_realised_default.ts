import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" ALTER COLUMN "audit_is_realised" DROP DEFAULT;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_audit_is_realised" DROP DEFAULT;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" ALTER COLUMN "audit_is_realised" SET DEFAULT false;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_audit_is_realised" SET DEFAULT false;`)
}
