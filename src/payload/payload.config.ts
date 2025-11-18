import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { fr } from "@payloadcms/translations/languages/fr";
import { buildConfig } from "payload";
import sharp from "sharp";

import { AccessRights } from "./collections/AccessRight";
import { Accounts } from "./collections/Account";
import { Admins } from "./collections/Admin";
import { Audits } from "./collections/Audit";
import { Declarations } from "./collections/Declaration";
import { Domains } from "./collections/Domain";
import { Entities } from "./collections/Entity";
import { Sessions } from "./collections/Session";
import { Users } from "./collections/User";
import { Verifications } from "./collections/Verification";

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
		Audits,
		Declarations,
		AccessRights,
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
