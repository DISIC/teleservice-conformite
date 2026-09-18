import path from "node:path";

/** The ProConnect integration identity every run signs in with; the seeder resolves the user from it. */
export const E2E_IDENTITY = { email: "test@fia1.fr" } as const;

/** Session saved by the setup project and loaded by every browser project. */
export const STORAGE_STATE = path.join(
	import.meta.dirname,
	"../.auth/user.json",
);
