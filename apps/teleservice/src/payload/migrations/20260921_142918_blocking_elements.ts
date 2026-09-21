import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" ADD COLUMN "audit_has_blocking_elements" boolean;
  ALTER TABLE "declarations" ADD COLUMN "audit_blocking_elements" varchar;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_audit_has_blocking_elements" boolean;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_audit_blocking_elements" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" DROP COLUMN "audit_has_blocking_elements";
  ALTER TABLE "declarations" DROP COLUMN "audit_blocking_elements";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_audit_has_blocking_elements";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_audit_blocking_elements";`)
}
