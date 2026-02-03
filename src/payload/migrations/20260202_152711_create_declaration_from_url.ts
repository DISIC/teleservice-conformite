import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_audits_status" AS ENUM('default', 'fromAI', 'fromAra');
  CREATE TYPE "public"."enum_action_plans_status" AS ENUM('default', 'fromAI', 'fromAra');
  CREATE TYPE "public"."enum_contacts_status" AS ENUM('default', 'fromAI', 'fromAra');
  ALTER TYPE "public"."enum_declarations_status" ADD VALUE 'unverified';
  ALTER TYPE "public"."enum__declarations_v_version_status" ADD VALUE 'unverified';
  CREATE TABLE "audits_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  ALTER TABLE "audits_tools_used" RENAME TO "audits_used_tools";
  ALTER TABLE "audits_used_tools" DROP CONSTRAINT "audits_tools_used_parent_id_fk";
  
  DROP INDEX "audits_tools_used_order_idx";
  DROP INDEX "audits_tools_used_parent_id_idx";
  ALTER TABLE "action_plans" ALTER COLUMN "current_year_schema_url" DROP NOT NULL;
  ALTER TABLE "action_plans" ALTER COLUMN "previous_years_schema_url" DROP NOT NULL;
  ALTER TABLE "audits" ADD COLUMN "status" "enum_audits_status" DEFAULT 'default';
  ALTER TABLE "action_plans" ADD COLUMN "status" "enum_action_plans_status" DEFAULT 'default';
  ALTER TABLE "contacts" ADD COLUMN "status" "enum_contacts_status" DEFAULT 'default';
  ALTER TABLE "audits_technologies" ADD CONSTRAINT "audits_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "audits_technologies_order_idx" ON "audits_technologies" USING btree ("_order");
  CREATE INDEX "audits_technologies_parent_id_idx" ON "audits_technologies" USING btree ("_parent_id");
  ALTER TABLE "audits_used_tools" ADD CONSTRAINT "audits_used_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "audits_used_tools_order_idx" ON "audits_used_tools" USING btree ("_order");
  CREATE INDEX "audits_used_tools_parent_id_idx" ON "audits_used_tools" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "audits_tools_used" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  ALTER TABLE "audits_used_tools" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audits_technologies" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "audits_used_tools" CASCADE;
  DROP TABLE "audits_technologies" CASCADE;
  ALTER TABLE "declarations" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "declarations" ALTER COLUMN "status" SET DEFAULT 'unpublished'::text;
  DROP TYPE "public"."enum_declarations_status";
  CREATE TYPE "public"."enum_declarations_status" AS ENUM('published', 'unpublished');
  ALTER TABLE "declarations" ALTER COLUMN "status" SET DEFAULT 'unpublished'::"public"."enum_declarations_status";
  ALTER TABLE "declarations" ALTER COLUMN "status" SET DATA TYPE "public"."enum_declarations_status" USING "status"::"public"."enum_declarations_status";
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET DATA TYPE text;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET DEFAULT 'unpublished'::text;
  DROP TYPE "public"."enum__declarations_v_version_status";
  CREATE TYPE "public"."enum__declarations_v_version_status" AS ENUM('published', 'unpublished');
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET DEFAULT 'unpublished'::"public"."enum__declarations_v_version_status";
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__declarations_v_version_status" USING "version_status"::"public"."enum__declarations_v_version_status";
  ALTER TABLE "action_plans" ALTER COLUMN "current_year_schema_url" SET NOT NULL;
  ALTER TABLE "action_plans" ALTER COLUMN "previous_years_schema_url" SET NOT NULL;
  ALTER TABLE "audits_tools_used" ADD CONSTRAINT "audits_tools_used_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "audits_tools_used_order_idx" ON "audits_tools_used" USING btree ("_order");
  CREATE INDEX "audits_tools_used_parent_id_idx" ON "audits_tools_used" USING btree ("_parent_id");
  ALTER TABLE "audits" DROP COLUMN "status";
  ALTER TABLE "action_plans" DROP COLUMN "status";
  ALTER TABLE "contacts" DROP COLUMN "status";
  DROP TYPE "public"."enum_audits_status";
  DROP TYPE "public"."enum_action_plans_status";
  DROP TYPE "public"."enum_contacts_status";`)
}
