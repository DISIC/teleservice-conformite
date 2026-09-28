import type { NextConfig } from "next";

const config: NextConfig = {
	output: "export",
	trailingSlash: true,
	reactStrictMode: true,
	transpilePackages: ["@codegouvfr/react-dsfr", "@rgaa/content", "tss-react"],
	images: { unoptimized: true },
};

export default config;
