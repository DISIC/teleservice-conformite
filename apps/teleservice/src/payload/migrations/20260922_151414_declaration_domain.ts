import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_declarations_domain" AS ENUM('Agriculture', 'Emploi', 'Enseignement', 'État civil - Identité - Citoyenneté', 'Fiscalité', 'Justice', 'Logement - équipements collectifs', 'Loisirs - culture', 'Ordre et sécurité publics', 'Protection de l''environnement', 'Protection sociale', 'Santé', 'Transport', 'Vie / séjour à l''étranger', 'none');
  CREATE TYPE "public"."enum__declarations_v_version_domain" AS ENUM('Agriculture', 'Emploi', 'Enseignement', 'État civil - Identité - Citoyenneté', 'Fiscalité', 'Justice', 'Logement - équipements collectifs', 'Loisirs - culture', 'Ordre et sécurité publics', 'Protection de l''environnement', 'Protection sociale', 'Santé', 'Transport', 'Vie / séjour à l''étranger', 'none');
  ALTER TABLE "entities" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_entities_kind";
  CREATE TYPE "public"."enum_entities_kind" AS ENUM('Agriculture', 'Emploi', 'Enseignement', 'État civil - Identité - Citoyenneté', 'Fiscalité', 'Justice', 'Logement - équipements collectifs', 'Loisirs - culture', 'Ordre et sécurité publics', 'Protection de l''environnement', 'Protection sociale', 'Santé', 'Transport', 'Vie / séjour à l''étranger', 'none');
  ALTER TABLE "entities" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_entities_kind" USING "kind"::"public"."enum_entities_kind";
  ALTER TABLE "declarations" ADD COLUMN "domain" "enum_declarations_domain";
  ALTER TABLE "_declarations_v" ADD COLUMN "version_domain" "enum__declarations_v_version_domain";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "entities" ALTER COLUMN "kind" SET DATA TYPE text;
  DROP TYPE "public"."enum_entities_kind";
  CREATE TYPE "public"."enum_entities_kind" AS ENUM('Protection sociale', 'Santé', 'Transport', 'Enseignement', 'Emploi', 'Fiscalité', 'Protection de l''environnement', 'Loisirs - culture', 'Logement - équipements collectifs', 'Ordre et sécurité publics', 'État civil - Identité - Citoyenneté', 'Justice', 'Agriculture', 'Vie / séjour à l''étranger', 'none');
  ALTER TABLE "entities" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_entities_kind" USING "kind"::"public"."enum_entities_kind";
  ALTER TABLE "declarations" DROP COLUMN "domain";
  ALTER TABLE "_declarations_v" DROP COLUMN "version_domain";
  DROP TYPE "public"."enum_declarations_domain";
  DROP TYPE "public"."enum__declarations_v_version_domain";`)
}
