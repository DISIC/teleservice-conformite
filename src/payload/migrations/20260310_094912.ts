import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."enum__declarations_v_version_status" USING "version_status"::"public"."enum__declarations_v_version_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_declarations_status" ADD VALUE 'unverified';
  ALTER TYPE "public"."enum__declarations_v_version_status" ADD VALUE 'unverified';`)
}
