import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_audits_status" ADD VALUE 'notRealised';
  ALTER TABLE "audits" ALTER COLUMN "date" DROP NOT NULL;
  ALTER TABLE "audits" ALTER COLUMN "rgaa_version" DROP NOT NULL;
  ALTER TABLE "audits" ALTER COLUMN "realised_by" DROP NOT NULL;
  ALTER TABLE "audits" ALTER COLUMN "rate" DROP NOT NULL;
  ALTER TABLE "audits" ALTER COLUMN "compliant_elements" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "audits" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "audits" ALTER COLUMN "status" SET DEFAULT 'default'::text;
  DROP TYPE "public"."enum_audits_status";
  CREATE TYPE "public"."enum_audits_status" AS ENUM('default', 'fromAI', 'fromAra');
  ALTER TABLE "audits" ALTER COLUMN "status" SET DEFAULT 'default'::"public"."enum_audits_status";
  ALTER TABLE "audits" ALTER COLUMN "status" SET DATA TYPE "public"."enum_audits_status" USING "status"::"public"."enum_audits_status";
  ALTER TABLE "audits" ALTER COLUMN "date" SET NOT NULL;
  ALTER TABLE "audits" ALTER COLUMN "rgaa_version" SET NOT NULL;
  ALTER TABLE "audits" ALTER COLUMN "realised_by" SET NOT NULL;
  ALTER TABLE "audits" ALTER COLUMN "rate" SET NOT NULL;
  ALTER TABLE "audits" ALTER COLUMN "compliant_elements" SET NOT NULL;`)
}
