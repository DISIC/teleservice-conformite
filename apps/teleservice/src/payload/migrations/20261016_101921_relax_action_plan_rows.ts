import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations_schema_action_plan_urls" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "declarations_schema_action_plan_urls" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "_declarations_v_version_schema_action_plan_urls" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "_declarations_v_version_schema_action_plan_urls" ALTER COLUMN "url" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations_schema_action_plan_urls" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "declarations_schema_action_plan_urls" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "_declarations_v_version_schema_action_plan_urls" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "_declarations_v_version_schema_action_plan_urls" ALTER COLUMN "url" SET NOT NULL;`)
}
