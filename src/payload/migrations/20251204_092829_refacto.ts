import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_action_plans_multiyear_schema_done" AS ENUM('true', 'false');
  CREATE TYPE "public"."enum_action_plans_previous_annual_schema_done" AS ENUM('true', 'false');
  CREATE TYPE "public"."enum_contacts_mean" AS ENUM('email', 'phone', 'online_form');
  ALTER TYPE "public"."enum_declarations_app_kind" RENAME TO "enum_audits_rgaa_version";
  ALTER TYPE "public"."enum_declarations_rgaa_version" RENAME TO "enum_services_app_kind";
  ALTER TYPE "public"."enum__declarations_v_version_app_kind" RENAME TO "enum__services_v_version_app_kind";
  ALTER TYPE "public"."enum__declarations_v_version_rgaa_version" RENAME TO "enum_action_plans_current_year_schema_done";
  CREATE TABLE "audits_pages_audited" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_name" varchar,
  	"page_u_r_l" varchar
  );
  
  CREATE TABLE "audits_non_compliances" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"non_compliance_description" varchar
  );
  
  CREATE TABLE "audits_exemption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"exemption_description" varchar
  );
  
  CREATE TABLE "audits_non_declared_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"non_declared_content_description" varchar
  );
  
  CREATE TABLE "audits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"rgaa_version" "enum_audits_rgaa_version",
  	"conducted_by" varchar,
  	"rate" numeric,
  	"audit_report_id" integer,
  	"audit_grid_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"technology_name" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"created_by_id" integer,
  	"entity_id" integer,
  	"app_kind" "enum_services_app_kind",
  	"url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_services_v_version_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"technology_name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_created_by_id" integer,
  	"version_entity_id" integer,
  	"version_app_kind" "enum__services_v_version_app_kind",
  	"version_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"uploaded_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "action_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"current_year_schema_done" "enum_action_plans_current_year_schema_done",
  	"multiyear_schema_done" "enum_action_plans_multiyear_schema_done",
  	"annual_schema_link" varchar,
  	"annual_schema_id" integer,
  	"previous_annual_schema_done" "enum_action_plans_previous_annual_schema_done",
  	"action_summary_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"mean" "enum_contacts_mean" NOT NULL,
  	"email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "declarations" RENAME COLUMN "app_kind" TO "service_id";
  ALTER TABLE "declarations" RENAME COLUMN "url" TO "audit_id";
  ALTER TABLE "declarations" RENAME COLUMN "rate" TO "action_plan_id";
  ALTER TABLE "_declarations_v" RENAME COLUMN "version_app_kind" TO "version_service_id";
  ALTER TABLE "_declarations_v" RENAME COLUMN "version_url" TO "version_audit_id";
  ALTER TABLE "_declarations_v" RENAME COLUMN "version_rate" TO "version_action_plan_id";
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_domain_id_domains_id_fk";
  
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_access_right_id_access_rights_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_domain_id_domains_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_access_right_id_access_rights_id_fk";
  
  ALTER TABLE "audits" ALTER COLUMN "rgaa_version" SET DATA TYPE text;
  DROP TYPE "public"."enum_audits_rgaa_version";
  CREATE TYPE "public"."enum_audits_rgaa_version" AS ENUM('rgaa_4', 'rgaa_5');
  ALTER TABLE "audits" ALTER COLUMN "rgaa_version" SET DATA TYPE "public"."enum_audits_rgaa_version" USING "rgaa_version"::"public"."enum_audits_rgaa_version";
  ALTER TABLE "declarations" ALTER COLUMN "status" SET DATA TYPE text;
  DROP TYPE "public"."enum_declarations_status";
  CREATE TYPE "public"."enum_declarations_status" AS ENUM('published', 'unpublished');
  ALTER TABLE "declarations" ALTER COLUMN "status" SET DATA TYPE "public"."enum_declarations_status" USING "status"::"public"."enum_declarations_status";
  ALTER TABLE "services" ALTER COLUMN "app_kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_services_app_kind";
  CREATE TYPE "public"."enum_services_app_kind" AS ENUM('website', 'mobile_app', 'other');
  ALTER TABLE "services" ALTER COLUMN "app_kind" SET DATA TYPE "public"."enum_services_app_kind" USING "app_kind"::"public"."enum_services_app_kind";
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET DATA TYPE text;
  DROP TYPE "public"."enum__declarations_v_version_status";
  CREATE TYPE "public"."enum__declarations_v_version_status" AS ENUM('published', 'unpublished');
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__declarations_v_version_status" USING "version_status"::"public"."enum__declarations_v_version_status";
  ALTER TABLE "action_plans" ALTER COLUMN "current_year_schema_done" SET DATA TYPE text;
  DROP TYPE "public"."enum_action_plans_current_year_schema_done";
  CREATE TYPE "public"."enum_action_plans_current_year_schema_done" AS ENUM('true', 'false');
  ALTER TABLE "action_plans" ALTER COLUMN "current_year_schema_done" SET DATA TYPE "public"."enum_action_plans_current_year_schema_done" USING "current_year_schema_done"::"public"."enum_action_plans_current_year_schema_done";
  DROP INDEX "entities_siret_idx";
  DROP INDEX "declarations_domain_idx";
  DROP INDEX "declarations_access_right_idx";
  DROP INDEX "_declarations_v_version_version_domain_idx";
  DROP INDEX "_declarations_v_version_version_access_right_idx";
  ALTER TABLE "entities" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "entities" ALTER COLUMN "siret" DROP NOT NULL;
  ALTER TABLE "declarations" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "declarations" ALTER COLUMN "status" DROP NOT NULL;
  ALTER TABLE "declarations" ALTER COLUMN "published_at" DROP NOT NULL;
  ALTER TABLE "declarations" ALTER COLUMN "created_by_id" DROP NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_name" DROP NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" DROP NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_published_at" DROP NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_created_by_id" DROP NOT NULL;
  ALTER TABLE "entities" ADD COLUMN "field" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audits_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "action_plans_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contacts_id" integer;
  ALTER TABLE "audits_pages_audited" ADD CONSTRAINT "audits_pages_audited_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audits_non_compliances" ADD CONSTRAINT "audits_non_compliances_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audits_exemption" ADD CONSTRAINT "audits_exemption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audits_non_declared_content" ADD CONSTRAINT "audits_non_declared_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audits" ADD CONSTRAINT "audits_audit_report_id_media_id_fk" FOREIGN KEY ("audit_report_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audits" ADD CONSTRAINT "audits_audit_grid_id_media_id_fk" FOREIGN KEY ("audit_grid_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_technologies" ADD CONSTRAINT "services_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_technologies" ADD CONSTRAINT "_services_v_version_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_entity_id_entities_id_fk" FOREIGN KEY ("version_entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_annual_schema_id_media_id_fk" FOREIGN KEY ("annual_schema_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_action_summary_id_media_id_fk" FOREIGN KEY ("action_summary_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "audits_pages_audited_order_idx" ON "audits_pages_audited" USING btree ("_order");
  CREATE INDEX "audits_pages_audited_parent_id_idx" ON "audits_pages_audited" USING btree ("_parent_id");
  CREATE INDEX "audits_non_compliances_order_idx" ON "audits_non_compliances" USING btree ("_order");
  CREATE INDEX "audits_non_compliances_parent_id_idx" ON "audits_non_compliances" USING btree ("_parent_id");
  CREATE INDEX "audits_exemption_order_idx" ON "audits_exemption" USING btree ("_order");
  CREATE INDEX "audits_exemption_parent_id_idx" ON "audits_exemption" USING btree ("_parent_id");
  CREATE INDEX "audits_non_declared_content_order_idx" ON "audits_non_declared_content" USING btree ("_order");
  CREATE INDEX "audits_non_declared_content_parent_id_idx" ON "audits_non_declared_content" USING btree ("_parent_id");
  CREATE INDEX "audits_audit_report_idx" ON "audits" USING btree ("audit_report_id");
  CREATE INDEX "audits_audit_grid_idx" ON "audits" USING btree ("audit_grid_id");
  CREATE INDEX "audits_updated_at_idx" ON "audits" USING btree ("updated_at");
  CREATE INDEX "audits_created_at_idx" ON "audits" USING btree ("created_at");
  CREATE INDEX "services_technologies_order_idx" ON "services_technologies" USING btree ("_order");
  CREATE INDEX "services_technologies_parent_id_idx" ON "services_technologies" USING btree ("_parent_id");
  CREATE INDEX "services_created_by_idx" ON "services" USING btree ("created_by_id");
  CREATE INDEX "services_entity_idx" ON "services" USING btree ("entity_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "_services_v_version_technologies_order_idx" ON "_services_v_version_technologies" USING btree ("_order");
  CREATE INDEX "_services_v_version_technologies_parent_id_idx" ON "_services_v_version_technologies" USING btree ("_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_created_by_idx" ON "_services_v" USING btree ("version_created_by_id");
  CREATE INDEX "_services_v_version_version_entity_idx" ON "_services_v" USING btree ("version_entity_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "media_uploaded_at_idx" ON "media" USING btree ("uploaded_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "action_plans_annual_schema_idx" ON "action_plans" USING btree ("annual_schema_id");
  CREATE INDEX "action_plans_action_summary_idx" ON "action_plans" USING btree ("action_summary_id");
  CREATE INDEX "action_plans_updated_at_idx" ON "action_plans" USING btree ("updated_at");
  CREATE INDEX "action_plans_created_at_idx" ON "action_plans" USING btree ("created_at");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_action_plan_id_action_plans_id_fk" FOREIGN KEY ("action_plan_id") REFERENCES "public"."action_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_service_id_services_id_fk" FOREIGN KEY ("version_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_audit_id_audits_id_fk" FOREIGN KEY ("version_audit_id") REFERENCES "public"."audits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_action_plan_id_action_plans_id_fk" FOREIGN KEY ("version_action_plan_id") REFERENCES "public"."action_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audits_fk" FOREIGN KEY ("audits_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_action_plans_fk" FOREIGN KEY ("action_plans_id") REFERENCES "public"."action_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "declarations_service_idx" ON "declarations" USING btree ("service_id");
  CREATE INDEX "declarations_audit_idx" ON "declarations" USING btree ("audit_id");
  CREATE INDEX "declarations_action_plan_idx" ON "declarations" USING btree ("action_plan_id");
  CREATE INDEX "_declarations_v_version_version_service_idx" ON "_declarations_v" USING btree ("version_service_id");
  CREATE INDEX "_declarations_v_version_version_audit_idx" ON "_declarations_v" USING btree ("version_audit_id");
  CREATE INDEX "_declarations_v_version_version_action_plan_idx" ON "_declarations_v" USING btree ("version_action_plan_id");
  CREATE INDEX "payload_locked_documents_rels_audits_id_idx" ON "payload_locked_documents_rels" USING btree ("audits_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_action_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("action_plans_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  ALTER TABLE "declarations" DROP COLUMN "rgaa_version";
  ALTER TABLE "declarations" DROP COLUMN "verified";
  ALTER TABLE "declarations" DROP COLUMN "domain_id";
  ALTER TABLE "declarations" DROP COLUMN "access_right_id";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_rgaa_version";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_verified";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_domain_id";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_access_right_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_audits_rgaa_version" RENAME TO "enum_declarations_app_kind";
  ALTER TYPE "public"."enum_services_app_kind" RENAME TO "enum_declarations_rgaa_version";
  ALTER TYPE "public"."enum__services_v_version_app_kind" RENAME TO "enum__declarations_v_version_app_kind";
  ALTER TYPE "public"."enum_action_plans_current_year_schema_done" RENAME TO "enum__declarations_v_version_rgaa_version";
  ALTER TABLE "audits_pages_audited" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audits_non_compliances" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audits_exemption" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audits_non_declared_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_technologies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_technologies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "action_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contacts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "audits_pages_audited" CASCADE;
  DROP TABLE "audits_non_compliances" CASCADE;
  DROP TABLE "audits_exemption" CASCADE;
  DROP TABLE "audits_non_declared_content" CASCADE;
  DROP TABLE "audits" CASCADE;
  DROP TABLE "services_technologies" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "_services_v_version_technologies" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "action_plans" CASCADE;
  DROP TABLE "contacts" CASCADE;
  ALTER TABLE "declarations" RENAME COLUMN "service_id" TO "app_kind";
  ALTER TABLE "declarations" RENAME COLUMN "audit_id" TO "url";
  ALTER TABLE "declarations" RENAME COLUMN "action_plan_id" TO "rate";
  ALTER TABLE "_declarations_v" RENAME COLUMN "version_service_id" TO "version_app_kind";
  ALTER TABLE "_declarations_v" RENAME COLUMN "version_audit_id" TO "version_url";
  ALTER TABLE "_declarations_v" RENAME COLUMN "version_action_plan_id" TO "version_rate";
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_service_id_services_id_fk";
  
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_audit_id_audits_id_fk";
  
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_action_plan_id_action_plans_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_service_id_services_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_audit_id_audits_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_action_plan_id_action_plans_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audits_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_action_plans_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contacts_fk";
  
  ALTER TABLE "declarations" ALTER COLUMN "app_kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_declarations_app_kind";
  CREATE TYPE "public"."enum_declarations_app_kind" AS ENUM('website', 'mobile_app', 'other');
  ALTER TABLE "declarations" ALTER COLUMN "app_kind" SET DATA TYPE "public"."enum_declarations_app_kind" USING "app_kind"::"public"."enum_declarations_app_kind";
  ALTER TABLE "declarations" ALTER COLUMN "status" SET DATA TYPE text;
  DROP TYPE "public"."enum_declarations_status";
  CREATE TYPE "public"."enum_declarations_status" AS ENUM('pending', 'completed');
  ALTER TABLE "declarations" ALTER COLUMN "status" SET DATA TYPE "public"."enum_declarations_status" USING "status"::"public"."enum_declarations_status";
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET DATA TYPE text;
  DROP TYPE "public"."enum__declarations_v_version_status";
  CREATE TYPE "public"."enum__declarations_v_version_status" AS ENUM('pending', 'completed');
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__declarations_v_version_status" USING "version_status"::"public"."enum__declarations_v_version_status";
  ALTER TABLE "declarations" ALTER COLUMN "rgaa_version" SET DATA TYPE text;
  DROP TYPE "public"."enum_declarations_rgaa_version";
  CREATE TYPE "public"."enum_declarations_rgaa_version" AS ENUM('rgaa_4', 'rgaa_5');
  ALTER TABLE "declarations" ALTER COLUMN "rgaa_version" SET DATA TYPE "public"."enum_declarations_rgaa_version" USING "rgaa_version"::"public"."enum_declarations_rgaa_version";
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_rgaa_version" SET DATA TYPE text;
  DROP TYPE "public"."enum__declarations_v_version_rgaa_version";
  CREATE TYPE "public"."enum__declarations_v_version_rgaa_version" AS ENUM('rgaa_4', 'rgaa_5');
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_rgaa_version" SET DATA TYPE "public"."enum__declarations_v_version_rgaa_version" USING "version_rgaa_version"::"public"."enum__declarations_v_version_rgaa_version";
  DROP INDEX "declarations_service_idx";
  DROP INDEX "declarations_audit_idx";
  DROP INDEX "declarations_action_plan_idx";
  DROP INDEX "_declarations_v_version_version_service_idx";
  DROP INDEX "_declarations_v_version_version_audit_idx";
  DROP INDEX "_declarations_v_version_version_action_plan_idx";
  DROP INDEX "payload_locked_documents_rels_audits_id_idx";
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_action_plans_id_idx";
  DROP INDEX "payload_locked_documents_rels_contacts_id_idx";
  ALTER TABLE "entities" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "entities" ALTER COLUMN "siret" SET NOT NULL;
  ALTER TABLE "declarations" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "declarations" ALTER COLUMN "status" SET NOT NULL;
  ALTER TABLE "declarations" ALTER COLUMN "published_at" SET NOT NULL;
  ALTER TABLE "declarations" ALTER COLUMN "created_by_id" SET NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_name" SET NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_published_at" SET NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_created_by_id" SET NOT NULL;
  ALTER TABLE "declarations" ADD COLUMN "rgaa_version" "enum_declarations_rgaa_version" NOT NULL;
  ALTER TABLE "declarations" ADD COLUMN "verified" boolean DEFAULT false;
  ALTER TABLE "declarations" ADD COLUMN "domain_id" integer NOT NULL;
  ALTER TABLE "declarations" ADD COLUMN "access_right_id" integer NOT NULL;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_rgaa_version" "enum__declarations_v_version_rgaa_version" NOT NULL;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_verified" boolean DEFAULT false;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_domain_id" integer NOT NULL;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_access_right_id" integer NOT NULL;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_access_right_id_access_rights_id_fk" FOREIGN KEY ("access_right_id") REFERENCES "public"."access_rights"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_domain_id_domains_id_fk" FOREIGN KEY ("version_domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_access_right_id_access_rights_id_fk" FOREIGN KEY ("version_access_right_id") REFERENCES "public"."access_rights"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "entities_siret_idx" ON "entities" USING btree ("siret");
  CREATE INDEX "declarations_domain_idx" ON "declarations" USING btree ("domain_id");
  CREATE INDEX "declarations_access_right_idx" ON "declarations" USING btree ("access_right_id");
  CREATE INDEX "_declarations_v_version_version_domain_idx" ON "_declarations_v" USING btree ("version_domain_id");
  CREATE INDEX "_declarations_v_version_version_access_right_idx" ON "_declarations_v" USING btree ("version_access_right_id");
  ALTER TABLE "entities" DROP COLUMN "field";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audits_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "action_plans_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contacts_id";
  DROP TYPE "public"."enum_action_plans_multiyear_schema_done";
  DROP TYPE "public"."enum_action_plans_previous_annual_schema_done";
  DROP TYPE "public"."enum_contacts_mean";`)
}
