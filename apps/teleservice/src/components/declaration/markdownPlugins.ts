import type { Options } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { OBSOLETE_NOTICE_CLASS } from "~/domain/declaration/published/markdown";

const BADGE_CLASSES = [
	"fr-badge",
	"fr-badge--success",
	"fr-badge--info",
	"fr-badge--warning",
	"fr-badge--error",
	"fr-badge--sm",
	"fr-badge--no-icon",
];

// The generated markdown embeds badges, the obsolete notice and <br/>; user-typed HTML must not survive.
const schema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		div: [
			...(defaultSchema.attributes?.div ?? []),
			["className", OBSOLETE_NOTICE_CLASS],
		],
		p: [
			...(defaultSchema.attributes?.p ?? []),
			["className", ...BADGE_CLASSES, "fr-h6"],
		],
	},
};

export const remarkPlugins: Options["remarkPlugins"] = [remarkGfm];

export const rehypePlugins: Options["rehypePlugins"] = [
	rehypeRaw,
	[rehypeSanitize, schema],
];
