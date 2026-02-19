import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "audits_used_tools" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "audits_test_environments" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "audits_technologies" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "access_rights" ADD COLUMN "invited_by_id" integer;
  ALTER TABLE "access_rights" ADD COLUMN "invite_expires_at" timestamp(3) with time zone;
  ALTER TABLE "access_rights" ADD COLUMN "invite_token_hash" varchar;
  ALTER TABLE "access_rights" ADD CONSTRAINT "access_rights_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "access_rights_invited_by_idx" ON "access_rights" USING btree ("invited_by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "access_rights" DROP CONSTRAINT "access_rights_invited_by_id_users_id_fk";
  
  DROP INDEX "access_rights_invited_by_idx";
  ALTER TABLE "audits_used_tools" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "audits_test_environments" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "audits_technologies" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "access_rights" DROP COLUMN "invited_by_id";
  ALTER TABLE "access_rights" DROP COLUMN "invite_expires_at";
  ALTER TABLE "access_rights" DROP COLUMN "invite_token_hash";`)
}
