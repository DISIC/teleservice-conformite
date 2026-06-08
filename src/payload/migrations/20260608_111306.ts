import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_declarations_mobile_platform" AS ENUM('ios', 'android');
  CREATE TYPE "public"."enum__declarations_v_version_mobile_platform" AS ENUM('ios', 'android');
  ALTER TABLE "declarations" ALTER COLUMN "app_kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_declarations_app_kind";
  CREATE TYPE "public"."enum_declarations_app_kind" AS ENUM('website', 'mobile_app', 'other');
  ALTER TABLE "declarations" ALTER COLUMN "app_kind" SET DATA TYPE "public"."enum_declarations_app_kind" USING "app_kind"::"public"."enum_declarations_app_kind";
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_app_kind" SET DATA TYPE text;
  DROP TYPE "public"."enum__declarations_v_version_app_kind";
  CREATE TYPE "public"."enum__declarations_v_version_app_kind" AS ENUM('website', 'mobile_app', 'other');
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_app_kind" SET DATA TYPE "public"."enum__declarations_v_version_app_kind" USING "version_app_kind"::"public"."enum__declarations_v_version_app_kind";
  ALTER TABLE "declarations" ADD COLUMN "mobile_platform" "enum_declarations_mobile_platform";
  ALTER TABLE "_declarations_v" ADD COLUMN "version_mobile_platform" "enum__declarations_v_version_mobile_platform";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "declarations" ALTER COLUMN "app_kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_declarations_app_kind";
  CREATE TYPE "public"."enum_declarations_app_kind" AS ENUM('website', 'mobile_app_ios', 'mobile_app_android', 'other');
  ALTER TABLE "declarations" ALTER COLUMN "app_kind" SET DATA TYPE "public"."enum_declarations_app_kind" USING "app_kind"::"public"."enum_declarations_app_kind";
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_app_kind" SET DATA TYPE text;
  DROP TYPE "public"."enum__declarations_v_version_app_kind";
  CREATE TYPE "public"."enum__declarations_v_version_app_kind" AS ENUM('website', 'mobile_app_ios', 'mobile_app_android', 'other');
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_app_kind" SET DATA TYPE "public"."enum__declarations_v_version_app_kind" USING "version_app_kind"::"public"."enum__declarations_v_version_app_kind";
  ALTER TABLE "declarations" DROP COLUMN "mobile_platform";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_mobile_platform";
  DROP TYPE "public"."enum_declarations_mobile_platform";
  DROP TYPE "public"."enum__declarations_v_version_mobile_platform";`)
}
