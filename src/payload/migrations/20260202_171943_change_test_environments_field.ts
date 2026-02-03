import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "audits_test_environments" DROP CONSTRAINT "audits_test_environments_parent_fk";
  
  DROP INDEX "audits_test_environments_parent_idx";
  DROP INDEX "audits_test_environments_value_idx";
  DROP INDEX "audits_test_environments_order_idx";
  ALTER TABLE "audits_test_environments" ALTER COLUMN "id" SET DATA TYPE varchar;
  ALTER TABLE "audits_test_environments" ADD COLUMN "_order" integer NOT NULL;
  ALTER TABLE "audits_test_environments" ADD COLUMN "_parent_id" integer NOT NULL;
  ALTER TABLE "audits_test_environments" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "audits_test_environments" ADD CONSTRAINT "audits_test_environments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "audits_test_environments_parent_id_idx" ON "audits_test_environments" USING btree ("_parent_id");
  CREATE INDEX "audits_test_environments_order_idx" ON "audits_test_environments" USING btree ("_order");
  ALTER TABLE "audits_test_environments" DROP COLUMN "order";
  ALTER TABLE "audits_test_environments" DROP COLUMN "parent_id";
  ALTER TABLE "audits_test_environments" DROP COLUMN "value";
  DROP TYPE "public"."enum_audits_test_environments";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_audits_test_environments" AS ENUM('nvda_firefox', 'jaws_firefox', 'voiceover_safari', 'zoomtext_windows_mac', 'dragon_naturally_speaking_windows_mac');
  ALTER TABLE "audits_test_environments" DROP CONSTRAINT "audits_test_environments_parent_id_fk";
  
  DROP INDEX "audits_test_environments_parent_id_idx";
  DROP INDEX "audits_test_environments_order_idx";
  ALTER TABLE "audits_test_environments" ALTER COLUMN "id" SET DATA TYPE serial;
  ALTER TABLE "audits_test_environments" ADD COLUMN "order" integer NOT NULL;
  ALTER TABLE "audits_test_environments" ADD COLUMN "parent_id" integer NOT NULL;
  ALTER TABLE "audits_test_environments" ADD COLUMN "value" "enum_audits_test_environments";
  ALTER TABLE "audits_test_environments" ADD CONSTRAINT "audits_test_environments_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "audits_test_environments_parent_idx" ON "audits_test_environments" USING btree ("parent_id");
  CREATE INDEX "audits_test_environments_value_idx" ON "audits_test_environments" USING btree ("value");
  CREATE INDEX "audits_test_environments_order_idx" ON "audits_test_environments" USING btree ("order");
  ALTER TABLE "audits_test_environments" DROP COLUMN "_order";
  ALTER TABLE "audits_test_environments" DROP COLUMN "_parent_id";
  ALTER TABLE "audits_test_environments" DROP COLUMN "name";`)
}
