import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "audits_test_environments"
      DROP CONSTRAINT "audits_test_environments_parent_fk";

    DROP INDEX "audits_test_environments_parent_idx";
    DROP INDEX "audits_test_environments_value_idx";
    DROP INDEX "audits_test_environments_order_idx";

    ALTER TABLE "audits_test_environments"
      ALTER COLUMN "id" SET DATA TYPE varchar;

    ALTER TABLE "audits_test_environments"
      ADD COLUMN "_order" integer,
      ADD COLUMN "_parent_id" integer,
      ADD COLUMN "name" varchar;

    UPDATE "audits_test_environments"
    SET
      "_order" = "order",
      "_parent_id" = "parent_id",
      "name" = "value";

    ALTER TABLE "audits_test_environments"
      ALTER COLUMN "_order" SET NOT NULL,
      ALTER COLUMN "_parent_id" SET NOT NULL,
      ALTER COLUMN "name" SET NOT NULL;

    ALTER TABLE "audits_test_environments"
      ADD CONSTRAINT "audits_test_environments_parent_id_fk"
      FOREIGN KEY ("_parent_id")
      REFERENCES "public"."audits"("id")
      ON DELETE CASCADE;

    CREATE INDEX "audits_test_environments_parent_id_idx"
      ON "audits_test_environments" ("_parent_id");

    CREATE INDEX "audits_test_environments_order_idx"
      ON "audits_test_environments" ("_order");

    ALTER TABLE "audits_test_environments"
      DROP COLUMN "order",
      DROP COLUMN "parent_id",
      DROP COLUMN "value";

    DROP TYPE "public"."enum_audits_test_environments";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_audits_test_environments" AS ENUM (
      'nvda_firefox',
      'jaws_firefox',
      'voiceover_safari',
      'zoomtext_windows_mac',
      'dragon_naturally_speaking_windows_mac'
    );

    ALTER TABLE "audits_test_environments"
      DROP CONSTRAINT "audits_test_environments_parent_id_fk";

    DROP INDEX "audits_test_environments_parent_id_idx";
    DROP INDEX "audits_test_environments_order_idx";

    ALTER TABLE "audits_test_environments"
      ALTER COLUMN "id" SET DATA TYPE serial;

    ALTER TABLE "audits_test_environments"
      ADD COLUMN "order" integer,
      ADD COLUMN "parent_id" integer,
      ADD COLUMN "value" "enum_audits_test_environments";

    UPDATE "audits_test_environments"
    SET
      "order" = "_order",
      "parent_id" = "_parent_id",
      "value" = "name"::"enum_audits_test_environments";

    ALTER TABLE "audits_test_environments"
      ALTER COLUMN "order" SET NOT NULL,
      ALTER COLUMN "parent_id" SET NOT NULL;

    ALTER TABLE "audits_test_environments"
      ADD CONSTRAINT "audits_test_environments_parent_fk"
      FOREIGN KEY ("parent_id")
      REFERENCES "public"."audits"("id")
      ON DELETE CASCADE;

    CREATE INDEX "audits_test_environments_parent_idx"
      ON "audits_test_environments" ("parent_id");

    CREATE INDEX "audits_test_environments_value_idx"
      ON "audits_test_environments" ("value");

    CREATE INDEX "audits_test_environments_order_idx"
      ON "audits_test_environments" ("order");

    ALTER TABLE "audits_test_environments"
      DROP COLUMN "_order",
      DROP COLUMN "_parent_id",
      DROP COLUMN "name";`)
}
