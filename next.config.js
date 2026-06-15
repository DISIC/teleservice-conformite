import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	turbopack: {},
	transpilePackages: ["@codegouvfr/react-dsfr", "tss-react"],
	devIndicators: {
		position: "bottom-right",
	},
};

export default withPayload(config, { devBundleServerPackages: false });
