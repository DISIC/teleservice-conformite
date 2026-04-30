import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_declarations_from_source" AS ENUM('manual', 'ai', 'ara');
  CREATE TYPE "public"."enum__declarations_v_version_from_source" AS ENUM('manual', 'ai', 'ara');
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_audit_id_audits_id_fk";
  
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_action_plan_id_action_plans_id_fk";
  
  ALTER TABLE "declarations" DROP CONSTRAINT "declarations_contact_id_contacts_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_audit_id_audits_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_action_plan_id_action_plans_id_fk";
  
  ALTER TABLE "_declarations_v" DROP CONSTRAINT "_declarations_v_version_contact_id_contacts_id_fk";
  
  DROP INDEX "declarations_audit_idx";
  DROP INDEX "declarations_action_plan_idx";
  DROP INDEX "declarations_contact_idx";
  DROP INDEX "_declarations_v_version_version_audit_idx";
  DROP INDEX "_declarations_v_version_version_action_plan_idx";
  DROP INDEX "_declarations_v_version_version_contact_idx";
  ALTER TABLE "audits" ADD COLUMN "is_realised" boolean DEFAULT false;
  ALTER TABLE "audits" ADD COLUMN "to_verify" boolean DEFAULT false NOT NULL;
  ALTER TABLE "declarations" ADD COLUMN "from_source" "enum_declarations_from_source" NOT NULL;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_from_source" "enum__declarations_v_version_from_source" NOT NULL;
  ALTER TABLE "action_plans" ADD COLUMN "to_verify" boolean DEFAULT false NOT NULL;
  ALTER TABLE "contacts" ADD COLUMN "to_verify" boolean DEFAULT false NOT NULL;
  ALTER TABLE "audits" DROP COLUMN "status";
  ALTER TABLE "declarations" DROP COLUMN "audit_id";
  ALTER TABLE "declarations" DROP COLUMN "action_plan_id";
  ALTER TABLE "declarations" DROP COLUMN "contact_id";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_audit_id";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_action_plan_id";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_contact_id";
  ALTER TABLE "action_plans" DROP COLUMN "status";
  ALTER TABLE "contacts" DROP COLUMN "status";
  DROP TYPE "public"."enum_audits_status";
  DROP TYPE "public"."enum_action_plans_status";
  DROP TYPE "public"."enum_contacts_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_audits_status" AS ENUM('default', 'fromAI', 'fromAra', 'notRealised');
  CREATE TYPE "public"."enum_action_plans_status" AS ENUM('default', 'fromAI', 'fromAra');
  CREATE TYPE "public"."enum_contacts_status" AS ENUM('default', 'fromAI', 'fromAra');
  ALTER TABLE "audits" ADD COLUMN "status" "enum_audits_status" DEFAULT 'default';
  ALTER TABLE "declarations" ADD COLUMN "audit_id" integer;
  ALTER TABLE "declarations" ADD COLUMN "action_plan_id" integer;
  ALTER TABLE "declarations" ADD COLUMN "contact_id" integer;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_audit_id" integer;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_action_plan_id" integer;
  ALTER TABLE "_declarations_v" ADD COLUMN "version_contact_id" integer;
  ALTER TABLE "action_plans" ADD COLUMN "status" "enum_action_plans_status" DEFAULT 'default';
  ALTER TABLE "contacts" ADD COLUMN "status" "enum_contacts_status" DEFAULT 'default';
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_action_plan_id_action_plans_id_fk" FOREIGN KEY ("action_plan_id") REFERENCES "public"."action_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "declarations" ADD CONSTRAINT "declarations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_audit_id_audits_id_fk" FOREIGN KEY ("version_audit_id") REFERENCES "public"."audits"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_action_plan_id_action_plans_id_fk" FOREIGN KEY ("version_action_plan_id") REFERENCES "public"."action_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_declarations_v" ADD CONSTRAINT "_declarations_v_version_contact_id_contacts_id_fk" FOREIGN KEY ("version_contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "declarations_audit_idx" ON "declarations" USING btree ("audit_id");
  CREATE INDEX "declarations_action_plan_idx" ON "declarations" USING btree ("action_plan_id");
  CREATE INDEX "declarations_contact_idx" ON "declarations" USING btree ("contact_id");
  CREATE INDEX "_declarations_v_version_version_audit_idx" ON "_declarations_v" USING btree ("version_audit_id");
  CREATE INDEX "_declarations_v_version_version_action_plan_idx" ON "_declarations_v" USING btree ("version_action_plan_id");
  CREATE INDEX "_declarations_v_version_version_contact_idx" ON "_declarations_v" USING btree ("version_contact_id");
  ALTER TABLE "audits" DROP COLUMN "is_realised";
  ALTER TABLE "audits" DROP COLUMN "to_verify";
  ALTER TABLE "declarations" DROP COLUMN "from_source";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_from_source";
  ALTER TABLE "action_plans" DROP COLUMN "to_verify";
  ALTER TABLE "contacts" DROP COLUMN "to_verify";
  DROP TYPE "public"."enum_declarations_from_source";
  DROP TYPE "public"."enum__declarations_v_version_from_source";`)
}
