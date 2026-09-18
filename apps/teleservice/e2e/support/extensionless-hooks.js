// `@codegouvfr/react-dsfr` ships ESM whose relative imports have no extension: only bundlers resolve them.
const CANDIDATES = [".js", "/index.js"];

/**
 * @param {string} specifier
 * @param {object} context
 * @param {(specifier: string, context: object) => Promise<object>} nextResolve
 */
export async function resolve(specifier, context, nextResolve) {
	try {
		return await nextResolve(specifier, context);
	} catch (error) {
		const notFound =
			error instanceof Error &&
			"code" in error &&
			error.code === "ERR_MODULE_NOT_FOUND";
		if (!notFound || !specifier.startsWith(".") || /\.[cm]?js$/.test(specifier))
			throw error;
		for (const candidate of CANDIDATES) {
			try {
				return await nextResolve(specifier + candidate, context);
			} catch {}
		}
		throw error;
	}
}
