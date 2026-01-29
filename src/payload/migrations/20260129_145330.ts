import {
  type MigrateUpArgs,
  type MigrateDownArgs,
  sql,
} from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_entities_kind" AS ENUM('Protection sociale', 'Santé', 'Transport', 'Enseignement', 'Emploi', 'Fiscalité', 'Protection de l''environnement', 'Loisirs - culture', 'Logement - équipements collectifs', 'Ordre et sécurité publics', 'État civil - Identité - Citoyenneté', 'Justice', 'Agriculture', 'Vie / séjour à l''étranger', 'none');
  CREATE TYPE "public"."enum_audits_test_environments" AS ENUM('nvda_firefox', 'jaws_firefox', 'voiceover_safari', 'zoomtext_windows_mac', 'dragon_naturally_speaking_windows_mac');
  CREATE TYPE "public"."enum_audits_rgaa_version" AS ENUM('rgaa_4', 'rgaa_5');
  CREATE TYPE "public"."enum_declarations_status" AS ENUM('published', 'unpublished');
  CREATE TYPE "public"."enum_declarations_app_kind" AS ENUM('website', 'mobile_app_ios', 'mobile_app_android', 'other');
  CREATE TYPE "public"."enum__declarations_v_version_status" AS ENUM('published', 'unpublished');
  CREATE TYPE "public"."enum__declarations_v_version_app_kind" AS ENUM('website', 'mobile_app_ios', 'mobile_app_android', 'other');
  CREATE TYPE "public"."enum_access_rights_role" AS ENUM('admin');
  CREATE TYPE "public"."enum_access_rights_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TABLE "admins_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "admins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"email_verified" boolean DEFAULT false,
  	"siret" numeric,
  	"entity_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"access_rights_id" integer
  );
  
  CREATE TABLE "sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"token" varchar NOT NULL,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"user_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"account_id" varchar NOT NULL,
  	"provider_id" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"access_token" varchar,
  	"refresh_token" varchar,
  	"id_token" varchar,
  	"access_token_expires_at" timestamp(3) with time zone,
  	"refresh_token_expires_at" timestamp(3) with time zone,
  	"scope" varchar,
  	"password" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "verifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"identifier" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "domains" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "entities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"siret" numeric NOT NULL,
  	"kind" "enum_entities_kind",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audits_tools_used" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "audits_test_environments" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_audits_test_environments",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "audits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"rgaa_version" "enum_audits_rgaa_version" NOT NULL,
  	"realised_by" varchar NOT NULL,
  	"rate" numeric NOT NULL,
  	"compliant_elements" varchar NOT NULL,
  	"non_compliant_elements" varchar,
  	"disproportionned_charge" varchar,
  	"optional_elements" varchar,
  	"audit_report" varchar,
  	"declaration_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "declarations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"status" "enum_declarations_status" DEFAULT 'unpublished',
  	"published_at" timestamp(3) with time zone,
  	"created_by_id" integer NOT NULL,
  	"entity_id" integer NOT NULL,
  	"app_kind" "enum_declarations_app_kind" NOT NULL,
  	"url" varchar,
  	"audit_id" integer,
  	"action_plan_id" integer,
  	"contact_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_declarations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_status" "enum__declarations_v_version_status" DEFAULT 'unpublished',
  	"version_published_at" timestamp(3) with time zone,
  	"version_created_by_id" integer NOT NULL,
  	"version_entity_id" integer NOT NULL,
  	"version_app_kind" "enum__declarations_v_version_app_kind" NOT NULL,
  	"version_url" varchar,
  	"version_audit_id" integer,
  	"version_action_plan_id" integer,
  	"version_contact_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "access_rights" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_access_rights_role" NOT NULL,
  	"status" "enum_access_rights_status" NOT NULL,
  	"user_id" integer NOT NULL,
  	"declaration_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
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
  	"current_year_schema_url" varchar NOT NULL,
  	"previous_years_schema_url" varchar NOT NULL,
  	"declaration_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"url" varchar,
  	"declaration_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer,
  	"users_id" integer,
  	"sessions_id" integer,
  	"accounts_id" integer,
  	"verifications_id" integer,
  	"domains_id" integer,
  	"entities_id" integer,
  	"audits_id" integer,
  	"declarations_id" integer,
  	"access_rights_id" integer,
  	"media_id" integer,
  	"action_plans_id" integer,
  	"contacts_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "admins_sessions" ADD CONSTRAINT "admins_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_access_rights_fk" FOREIGN KEY ("access_rights_id") REFERENCES "public"."access_rights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audits_tools_used" ADD CONSTRAINT "audits_tools_used_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audits_test_environments" ADD CONSTRAINT "audits_test_environments_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audits" ADD CONSTRAINT "audits_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_action_plan_id_action_plans_id_fk" FOREIGN KEY ("action_plan_id") REFERENCES "public"."action_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_parent_id_declarations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."declarations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_entity_id_entities_id_fk" FOREIGN KEY ("version_entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_audit_id_audits_id_fk" FOREIGN KEY ("version_audit_id") REFERENCES "public"."audits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_action_plan_id_action_plans_id_fk" FOREIGN KEY ("version_action_plan_id") REFERENCES "public"."action_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_contact_id_contacts_id_fk" FOREIGN KEY ("version_contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "access_rights" ADD CONSTRAINT "access_rights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "access_rights" ADD CONSTRAINT "access_rights_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounts_fk" FOREIGN KEY ("accounts_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verifications_fk" FOREIGN KEY ("verifications_id") REFERENCES "public"."verifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_domains_fk" FOREIGN KEY ("domains_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entities_fk" FOREIGN KEY ("entities_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audits_fk" FOREIGN KEY ("audits_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_declarations_fk" FOREIGN KEY ("declarations_id") REFERENCES "public"."declarations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_access_rights_fk" FOREIGN KEY ("access_rights_id") REFERENCES "public"."access_rights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_action_plans_fk" FOREIGN KEY ("action_plans_id") REFERENCES "public"."action_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_sessions_order_idx" ON "admins_sessions" USING btree ("_order");
  CREATE INDEX "admins_sessions_parent_id_idx" ON "admins_sessions" USING btree ("_parent_id");
  CREATE INDEX "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
  CREATE INDEX "admins_created_at_idx" ON "admins" USING btree ("created_at");
  CREATE UNIQUE INDEX "admins_email_idx" ON "admins" USING btree ("email");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_entity_idx" ON "users" USING btree ("entity_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_access_rights_id_idx" ON "users_rels" USING btree ("access_rights_id");
  CREATE UNIQUE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");
  CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");
  CREATE INDEX "accounts_updated_at_idx" ON "accounts" USING btree ("updated_at");
  CREATE INDEX "accounts_created_at_idx" ON "accounts" USING btree ("created_at");
  CREATE INDEX "verifications_updated_at_idx" ON "verifications" USING btree ("updated_at");
  CREATE INDEX "verifications_created_at_idx" ON "verifications" USING btree ("created_at");
  CREATE INDEX "domains_updated_at_idx" ON "domains" USING btree ("updated_at");
  CREATE INDEX "domains_created_at_idx" ON "domains" USING btree ("created_at");
  CREATE INDEX "entities_updated_at_idx" ON "entities" USING btree ("updated_at");
  CREATE INDEX "entities_created_at_idx" ON "entities" USING btree ("created_at");
  CREATE INDEX "audits_tools_used_order_idx" ON "audits_tools_used" USING btree ("_order");
  CREATE INDEX "audits_tools_used_parent_id_idx" ON "audits_tools_used" USING btree ("_parent_id");
  CREATE INDEX "audits_test_environments_order_idx" ON "audits_test_environments" USING btree ("order");
  CREATE INDEX "audits_test_environments_parent_idx" ON "audits_test_environments" USING btree ("parent_id");
  CREATE INDEX "audits_test_environments_value_idx" ON "audits_test_environments" USING btree ("value");
  CREATE INDEX "audits_rgaa_version_idx" ON "audits" USING btree ("rgaa_version");
  CREATE INDEX "audits_declaration_idx" ON "audits" USING btree ("declaration_id");
  CREATE INDEX "audits_updated_at_idx" ON "audits" USING btree ("updated_at");
  CREATE INDEX "audits_created_at_idx" ON "audits" USING btree ("created_at");
  CREATE INDEX "declarations_created_by_idx" ON "declarations" USING btree ("created_by_id");
  CREATE INDEX "declarations_entity_idx" ON "declarations" USING btree ("entity_id");
  CREATE INDEX "declarations_audit_idx" ON "declarations" USING btree ("audit_id");
  CREATE INDEX "declarations_action_plan_idx" ON "declarations" USING btree ("action_plan_id");
  CREATE INDEX "declarations_contact_idx" ON "declarations" USING btree ("contact_id");
  CREATE INDEX "declarations_updated_at_idx" ON "declarations" USING btree ("updated_at");
  CREATE INDEX "declarations_created_at_idx" ON "declarations" USING btree ("created_at");
  CREATE INDEX "declarations_deleted_at_idx" ON "declarations" USING btree ("deleted_at");
  CREATE INDEX "_declarations_v_parent_idx" ON "_declarations_v" USING btree ("parent_id");
  CREATE INDEX "_declarations_v_version_version_created_by_idx" ON "_declarations_v" USING btree ("version_created_by_id");
  CREATE INDEX "_declarations_v_version_version_entity_idx" ON "_declarations_v" USING btree ("version_entity_id");
  CREATE INDEX "_declarations_v_version_version_audit_idx" ON "_declarations_v" USING btree ("version_audit_id");
  CREATE INDEX "_declarations_v_version_version_action_plan_idx" ON "_declarations_v" USING btree ("version_action_plan_id");
  CREATE INDEX "_declarations_v_version_version_contact_idx" ON "_declarations_v" USING btree ("version_contact_id");
  CREATE INDEX "_declarations_v_version_version_updated_at_idx" ON "_declarations_v" USING btree ("version_updated_at");
  CREATE INDEX "_declarations_v_version_version_created_at_idx" ON "_declarations_v" USING btree ("version_created_at");
  CREATE INDEX "_declarations_v_version_version_deleted_at_idx" ON "_declarations_v" USING btree ("version_deleted_at");
  CREATE INDEX "_declarations_v_created_at_idx" ON "_declarations_v" USING btree ("created_at");
  CREATE INDEX "_declarations_v_updated_at_idx" ON "_declarations_v" USING btree ("updated_at");
  CREATE INDEX "access_rights_user_idx" ON "access_rights" USING btree ("user_id");
  CREATE INDEX "access_rights_declaration_idx" ON "access_rights" USING btree ("declaration_id");
  CREATE INDEX "access_rights_updated_at_idx" ON "access_rights" USING btree ("updated_at");
  CREATE INDEX "access_rights_created_at_idx" ON "access_rights" USING btree ("created_at");
  CREATE INDEX "media_uploaded_at_idx" ON "media" USING btree ("uploaded_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "action_plans_declaration_idx" ON "action_plans" USING btree ("declaration_id");
  CREATE INDEX "action_plans_updated_at_idx" ON "action_plans" USING btree ("updated_at");
  CREATE INDEX "action_plans_created_at_idx" ON "action_plans" USING btree ("created_at");
  CREATE INDEX "contacts_declaration_idx" ON "contacts" USING btree ("declaration_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "payload_locked_documents_rels" USING btree ("admins_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX "payload_locked_documents_rels_accounts_id_idx" ON "payload_locked_documents_rels" USING btree ("accounts_id");
  CREATE INDEX "payload_locked_documents_rels_verifications_id_idx" ON "payload_locked_documents_rels" USING btree ("verifications_id");
  CREATE INDEX "payload_locked_documents_rels_domains_id_idx" ON "payload_locked_documents_rels" USING btree ("domains_id");
  CREATE INDEX "payload_locked_documents_rels_entities_id_idx" ON "payload_locked_documents_rels" USING btree ("entities_id");
  CREATE INDEX "payload_locked_documents_rels_audits_id_idx" ON "payload_locked_documents_rels" USING btree ("audits_id");
  CREATE INDEX "payload_locked_documents_rels_declarations_id_idx" ON "payload_locked_documents_rels" USING btree ("declarations_id");
  CREATE INDEX "payload_locked_documents_rels_access_rights_id_idx" ON "payload_locked_documents_rels" USING btree ("access_rights_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_action_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("action_plans_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admins_id_idx" ON "payload_preferences_rels" USING btree ("admins_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admins_sessions" CASCADE;
  DROP TABLE "admins" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "sessions" CASCADE;
  DROP TABLE "accounts" CASCADE;
  DROP TABLE "verifications" CASCADE;
  DROP TABLE "domains" CASCADE;
  DROP TABLE "entities" CASCADE;
  DROP TABLE "audits_tools_used" CASCADE;
  DROP TABLE "audits_test_environments" CASCADE;
  DROP TABLE "audits" CASCADE;
  DROP TABLE "declarations" CASCADE;
  DROP TABLE "_declarations_v" CASCADE;
  DROP TABLE "access_rights" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "action_plans" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_entities_kind";
  DROP TYPE "public"."enum_audits_test_environments";
  DROP TYPE "public"."enum_audits_rgaa_version";
  DROP TYPE "public"."enum_declarations_status";
  DROP TYPE "public"."enum_declarations_app_kind";
  DROP TYPE "public"."enum__declarations_v_version_status";
  DROP TYPE "public"."enum__declarations_v_version_app_kind";
  DROP TYPE "public"."enum_access_rights_role";
  DROP TYPE "public"."enum_access_rights_status";`);
}
