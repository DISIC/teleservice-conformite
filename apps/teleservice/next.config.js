import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import("next").NextConfig} */
const config = {
	agentRules: false,
	reactStrictMode: true,
	// An e2e dev server may run beside the developer's: each needs its own dist directory and lock.
	distDir: process.env.NEXT_DIST_DIR,
	turbopack: {},
	transpilePackages: ["@codegouvfr/react-dsfr", "tss-react"],
	devIndicators: {
		position: "bottom-right",
	},
};

export default withPayload(config, { devBundleServerPackages: false });
