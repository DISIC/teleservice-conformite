import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  ALTER TABLE "declarations" ALTER COLUMN "app_kind" DROP NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_app_kind" DROP NOT NULL;
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_kv" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_kv" CASCADE;
  ALTER TABLE "declarations" ALTER COLUMN "app_kind" SET NOT NULL;
  ALTER TABLE "_declarations_v" ALTER COLUMN "version_app_kind" SET NOT NULL;`)
}
