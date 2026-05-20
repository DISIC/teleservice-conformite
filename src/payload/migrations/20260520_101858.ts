import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "schemas_action_plan_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "schemas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"schema_name" varchar NOT NULL,
  	"schema_url" varchar,
  	"entity_id" integer,
  	"to_verify" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "action_plans" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "action_plans" CASCADE;
  ALTER TABLE "contacts" DROP CONSTRAINT "contacts_declaration_id_declarations_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_action_plans_fk";
  
  DROP INDEX "contacts_declaration_idx";
  DROP INDEX "payload_locked_documents_rels_action_plans_id_idx";
  ALTER TABLE "declarations" ADD COLUMN "schema_id" integer;
  ALTER TABLE "declarations" ADD COLUMN "contact_id" integer;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_schema_id" integer;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_contact_id" integer;
  ALTER TABLE "contacts" ADD COLUMN "name" varchar NOT NULL;
  ALTER TABLE "contacts" ADD COLUMN "entity_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "schemas_id" integer;
  ALTER TABLE "schemas_action_plan_urls" ADD CONSTRAINT "schemas_action_plan_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."schemas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "schemas" ADD CONSTRAINT "schemas_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "schemas_action_plan_urls_order_idx" ON "schemas_action_plan_urls" USING btree ("_order");
  CREATE INDEX "schemas_action_plan_urls_parent_id_idx" ON "schemas_action_plan_urls" USING btree ("_parent_id");
  CREATE INDEX "schemas_entity_idx" ON "schemas" USING btree ("entity_id");
  CREATE INDEX "schemas_updated_at_idx" ON "schemas" USING btree ("updated_at");
  CREATE INDEX "schemas_created_at_idx" ON "schemas" USING btree ("created_at");
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_schema_id_schemas_id_fk" FOREIGN KEY ("schema_id") REFERENCES "public"."schemas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_schema_id_schemas_id_fk" FOREIGN KEY ("version_schema_id") REFERENCES "public"."schemas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_contact_id_contacts_id_fk" FOREIGN KEY ("version_contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_schemas_fk" FOREIGN KEY ("schemas_id") REFERENCES "public"."schemas"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "declarations_schema_idx" ON "declarations" USING btree ("schema_id");
  CREATE INDEX "declarations_contact_idx" ON "declarations" USING btree ("contact_id");
  CREATE INDEX "_declarations_v_version_version_schema_idx" ON "_declarations_v" USING btree ("version_schema_id");
  CREATE INDEX "_declarations_v_version_version_contact_idx" ON "_declarations_v" USING btree ("version_contact_id");
  CREATE INDEX "contacts_entity_idx" ON "contacts" USING btree ("entity_id");
  CREATE INDEX "payload_locked_documents_rels_schemas_id_idx" ON "payload_locked_documents_rels" USING btree ("schemas_id");
  ALTER TABLE "contacts" DROP COLUMN "declaration_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "action_plans_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "action_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"current_year_schema_url" varchar,
  	"previous_years_schema_url" varchar,
  	"declaration_id" integer NOT NULL,
  	"to_verify" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "schemas_action_plan_urls" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "schemas" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "schemas_action_plan_urls" CASCADE;
  DROP TABLE "schemas" CASCADE;
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_schema_id_schemas_id_fk";
  
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_contact_id_contacts_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_schema_id_schemas_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_contact_id_contacts_id_fk";
  
  ALTER TABLE "contacts" DROP CONSTRAINT "contacts_entity_id_entities_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_schemas_fk";
  
  DROP INDEX "declarations_schema_idx";
  DROP INDEX "declarations_contact_idx";
  DROP INDEX "_declarations_v_version_version_schema_idx";
  DROP INDEX "_declarations_v_version_version_contact_idx";
  DROP INDEX "contacts_entity_idx";
  DROP INDEX "payload_locked_documents_rels_schemas_id_idx";
  ALTER TABLE "contacts" ADD COLUMN "declaration_id" integer NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "action_plans_id" integer;
  ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "action_plans_declaration_idx" ON "action_plans" USING btree ("declaration_id");
  CREATE INDEX "action_plans_updated_at_idx" ON "action_plans" USING btree ("updated_at");
  CREATE INDEX "action_plans_created_at_idx" ON "action_plans" USING btree ("created_at");
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_action_plans_fk" FOREIGN KEY ("action_plans_id") REFERENCES "public"."action_plans"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contacts_declaration_idx" ON "contacts" USING btree ("declaration_id");
  CREATE INDEX "payload_locked_documents_rels_action_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("action_plans_id");
  ALTER TABLE "declarations" DROP COLUMN "schema_id";
  ALTER TABLE "declarations" DROP COLUMN "contact_id";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_schema_id";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_contact_id";
  ALTER TABLE "contacts" DROP COLUMN "name";
  ALTER TABLE "contacts" DROP COLUMN "entity_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "schemas_id";`)
}
