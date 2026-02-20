import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });
    return config;
  },
  transpilePackages: [
    "@codegouvfr/react-dsfr",
    "tss-react", // This is for MUI or if you use htts://tss-react.dev
    "better-auth",
  ],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  devIndicators: {
    position: "bottom-right",
  },
};

export default withPayload(config, { devBundleServerPackages: false });
