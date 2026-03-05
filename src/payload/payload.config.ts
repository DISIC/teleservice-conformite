import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { fr } from "@payloadcms/translations/languages/fr";
import { buildConfig } from "payload";
import sharp from "sharp";

import { AccessRights } from "./collections/AccessRight";
import { Accounts } from "./collections/Account";
import { ActionPlans } from "./collections/ActionPlans";
import { Admins } from "./collections/Admin";
import { Audits } from "./collections/Audit";
import { Contacts } from "./collections/Contact";
import { Declarations } from "./collections/Declaration";
import { Domains } from "./collections/Domain";
import { Entities } from "./collections/Entity";
import { Media } from "./collections/Media";
import { Sessions } from "./collections/Session";
import { Users } from "./collections/User";
import { Verifications } from "./collections/Verification";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const hasSmtpCreds = Boolean(
	process.env.SMTP_HOST &&
		process.env.SMTP_PORT &&
		process.env.SMTP_FROM_ADDRESS,
);

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
		Media,
		ActionPlans,
		Contacts,
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
	...(hasSmtpCreds && {
		email: nodemailerAdapter({
			defaultFromAddress:
				process.env.SMTP_FROM_ADDRESS || "info@payloadcms.com",
			defaultFromName: process.env.SMTP_FROM_NAME || "Payload",
			transportOptions: {
				host: process.env.SMTP_HOST,
				port: Number.parseInt(process.env.SMTP_PORT as string),
				secure: process.env.NODE_ENV === "production",
				auth:
					process.env.SMTP_USER && process.env.SMTP_PASSWORD
						? {
								user: process.env.SMTP_USER,
								pass: process.env.SMTP_PASSWORD,
							}
						: undefined,
			},
		}),
	}),
});
