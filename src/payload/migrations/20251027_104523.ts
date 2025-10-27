import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_declarations_app_kind" AS ENUM('website', 'mobile_app', 'other');
  CREATE TYPE "public"."enum_declarations_status" AS ENUM('pending', 'completed');
  CREATE TYPE "public"."enum_declarations_rgaa_version" AS ENUM('rgaa_4', 'rgaa_5');
  CREATE TYPE "public"."enum__declarations_v_version_app_kind" AS ENUM('website', 'mobile_app', 'other');
  CREATE TYPE "public"."enum__declarations_v_version_status" AS ENUM('pending', 'completed');
  CREATE TYPE "public"."enum__declarations_v_version_rgaa_version" AS ENUM('rgaa_4', 'rgaa_5');
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
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
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
  
  CREATE TABLE "domains" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "entities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"siret" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "declarations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"app_kind" "enum_declarations_app_kind" NOT NULL,
  	"url" varchar,
  	"rate" numeric NOT NULL,
  	"status" "enum_declarations_status" NOT NULL,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"rgaa_version" "enum_declarations_rgaa_version" NOT NULL,
  	"created_by_id" integer NOT NULL,
  	"verified" boolean DEFAULT false,
  	"domain_id" integer NOT NULL,
  	"access_right_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_declarations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_app_kind" "enum__declarations_v_version_app_kind" NOT NULL,
  	"version_url" varchar,
  	"version_rate" numeric NOT NULL,
  	"version_status" "enum__declarations_v_version_status" NOT NULL,
  	"version_published_at" timestamp(3) with time zone NOT NULL,
  	"version_rgaa_version" "enum__declarations_v_version_rgaa_version" NOT NULL,
  	"version_created_by_id" integer NOT NULL,
  	"version_verified" boolean DEFAULT false,
  	"version_domain_id" integer NOT NULL,
  	"version_access_right_id" integer NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "access_rights" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_access_rights_role" NOT NULL,
  	"status" "enum_access_rights_status" NOT NULL,
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
  	"domains_id" integer,
  	"entities_id" integer,
  	"declarations_id" integer,
  	"access_rights_id" integer
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
  	"admins_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "admins_sessions" ADD CONSTRAINT "admins_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_access_right_id_access_rights_id_fk" FOREIGN KEY ("access_right_id") REFERENCES "public"."access_rights"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_parent_id_declarations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."declarations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_domain_id_domains_id_fk" FOREIGN KEY ("version_domain_id") REFERENCES "public"."domains"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_access_right_id_access_rights_id_fk" FOREIGN KEY ("version_access_right_id") REFERENCES "public"."access_rights"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_domains_fk" FOREIGN KEY ("domains_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entities_fk" FOREIGN KEY ("entities_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_declarations_fk" FOREIGN KEY ("declarations_id") REFERENCES "public"."declarations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_access_rights_fk" FOREIGN KEY ("access_rights_id") REFERENCES "public"."access_rights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "admins_sessions_order_idx" ON "admins_sessions" USING btree ("_order");
  CREATE INDEX "admins_sessions_parent_id_idx" ON "admins_sessions" USING btree ("_parent_id");
  CREATE INDEX "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
  CREATE INDEX "admins_created_at_idx" ON "admins" USING btree ("created_at");
  CREATE UNIQUE INDEX "admins_email_idx" ON "admins" USING btree ("email");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "domains_updated_at_idx" ON "domains" USING btree ("updated_at");
  CREATE INDEX "domains_created_at_idx" ON "domains" USING btree ("created_at");
  CREATE UNIQUE INDEX "entities_siret_idx" ON "entities" USING btree ("siret");
  CREATE INDEX "entities_updated_at_idx" ON "entities" USING btree ("updated_at");
  CREATE INDEX "entities_created_at_idx" ON "entities" USING btree ("created_at");
  CREATE INDEX "declarations_created_by_idx" ON "declarations" USING btree ("created_by_id");
  CREATE INDEX "declarations_domain_idx" ON "declarations" USING btree ("domain_id");
  CREATE INDEX "declarations_access_right_idx" ON "declarations" USING btree ("access_right_id");
  CREATE INDEX "declarations_updated_at_idx" ON "declarations" USING btree ("updated_at");
  CREATE INDEX "declarations_created_at_idx" ON "declarations" USING btree ("created_at");
  CREATE INDEX "_declarations_v_parent_idx" ON "_declarations_v" USING btree ("parent_id");
  CREATE INDEX "_declarations_v_version_version_created_by_idx" ON "_declarations_v" USING btree ("version_created_by_id");
  CREATE INDEX "_declarations_v_version_version_domain_idx" ON "_declarations_v" USING btree ("version_domain_id");
  CREATE INDEX "_declarations_v_version_version_access_right_idx" ON "_declarations_v" USING btree ("version_access_right_id");
  CREATE INDEX "_declarations_v_version_version_updated_at_idx" ON "_declarations_v" USING btree ("version_updated_at");
  CREATE INDEX "_declarations_v_version_version_created_at_idx" ON "_declarations_v" USING btree ("version_created_at");
  CREATE INDEX "_declarations_v_created_at_idx" ON "_declarations_v" USING btree ("created_at");
  CREATE INDEX "_declarations_v_updated_at_idx" ON "_declarations_v" USING btree ("updated_at");
  CREATE INDEX "access_rights_updated_at_idx" ON "access_rights" USING btree ("updated_at");
  CREATE INDEX "access_rights_created_at_idx" ON "access_rights" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_admins_id_idx" ON "payload_locked_documents_rels" USING btree ("admins_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_domains_id_idx" ON "payload_locked_documents_rels" USING btree ("domains_id");
  CREATE INDEX "payload_locked_documents_rels_entities_id_idx" ON "payload_locked_documents_rels" USING btree ("entities_id");
  CREATE INDEX "payload_locked_documents_rels_declarations_id_idx" ON "payload_locked_documents_rels" USING btree ("declarations_id");
  CREATE INDEX "payload_locked_documents_rels_access_rights_id_idx" ON "payload_locked_documents_rels" USING btree ("access_rights_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_admins_id_idx" ON "payload_preferences_rels" USING btree ("admins_id");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "admins_sessions" CASCADE;
  DROP TABLE "admins" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "domains" CASCADE;
  DROP TABLE "entities" CASCADE;
  DROP TABLE "declarations" CASCADE;
  DROP TABLE "_declarations_v" CASCADE;
  DROP TABLE "access_rights" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_declarations_app_kind";
  DROP TYPE "public"."enum_declarations_status";
  DROP TYPE "public"."enum_declarations_rgaa_version";
  DROP TYPE "public"."enum__declarations_v_version_app_kind";
  DROP TYPE "public"."enum__declarations_v_version_status";
  DROP TYPE "public"."enum__declarations_v_version_rgaa_version";
  DROP TYPE "public"."enum_access_rights_role";
  DROP TYPE "public"."enum_access_rights_status";`)
}
