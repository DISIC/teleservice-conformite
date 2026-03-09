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

const hasNodemailerCreds = Boolean(
	process.env.NODEMAILER_HOST &&
		process.env.NODEMAILER_PORT &&
		process.env.NODEMAILER_FROM_ADDRESS,
);

const user = process.env.NODEMAILER_USER || process.env.MAILPACE_API_KEY;
const pass = process.env.NODEMAILER_PASSWORD || process.env.MAILPACE_API_KEY;
const hasAuth = !!user && !!pass && user !== "null" && pass !== "null";

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
	...(hasNodemailerCreds && {
		email: nodemailerAdapter({
			defaultFromAddress:
				process.env.NODEMAILER_FROM_ADDRESS || "info@payloadcms.com",
			defaultFromName: process.env.NODEMAILER_FROM_NAME || "Payload",
			transportOptions: {
				host: process.env.NODEMAILER_HOST,
				port: Number.parseInt(process.env.NODEMAILER_PORT as string, 10),
				secure:
					Number.parseInt(process.env.NODEMAILER_PORT as string, 10) === 465,
				auth: hasAuth ? { user, pass } : undefined,
			},
		}),
	}),
});
