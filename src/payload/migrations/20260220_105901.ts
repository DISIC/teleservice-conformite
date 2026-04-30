import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_rels" CASCADE;
  ALTER TABLE "access_rights" ALTER COLUMN "user_id" DROP NOT NULL;
  ALTER TABLE "access_rights" ADD COLUMN "tmp_user_email" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"access_rights_id" integer
  );
  
  ALTER TABLE "access_rights" ALTER COLUMN "user_id" SET NOT NULL;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_access_rights_fk" FOREIGN KEY ("access_rights_id") REFERENCES "public"."access_rights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_access_rights_id_idx" ON "users_rels" USING btree ("access_rights_id");
  ALTER TABLE "access_rights" DROP COLUMN "tmp_user_email";`)
}
