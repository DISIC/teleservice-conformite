import sharp from "sharp";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fr } from "@payloadcms/translations/languages/fr";

import { Admins } from "./collections/Admin";
import { Users } from "./collections/User";
import { Sessions } from "./collections/Session";
import { Accounts } from "./collections/Account";
import { Verifications } from "./collections/Verification";
import { Domains } from "./collections/Domain";
import { Entities } from "./collections/Entity";
import { Declarations } from "./collections/Declaration";
import { AccessRights } from "./collections/AccessRight";
import { ThirdPartyAccess } from "./collections/ThirdPartyAccess";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: { user: "admins" },
  editor: lexicalEditor(),
  collections: [
    Admins,
    Users,
    Sessions,
    Accounts,
    Verifications,
    Domains,
    Entities,
    Declarations,
    AccessRights,
    ThirdPartyAccess,
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRESQL_ADDON_URI || "",
    },
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  sharp,
  i18n: {
    fallbackLanguage: "fr",
    supportedLanguages: { fr },
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
