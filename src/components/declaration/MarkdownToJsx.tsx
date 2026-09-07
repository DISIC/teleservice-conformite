import { fr } from "@codegouvfr/react-dsfr";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { tss } from "tss-react";
import { OBSOLETE_NOTICE_CLASS } from "~/utils/declaration/publishedMarkdown";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const HEADING_CLASS: Record<HeadingLevel, string> = {
	h1: fr.cx("fr-h2"),
	h2: fr.cx("fr-h3"),
	h3: fr.cx("fr-h5"),
	h4: fr.cx("fr-h6"),
	h5: fr.cx("fr-h6"),
	h6: fr.cx("fr-h6"),
};

export default function MarkdownToJsx({
	content,
	mode = "published",
}: {
	content: string;
	mode?: "published" | "preview";
}) {
	const { classes } = useStyles();

	// The mockup sets each heading one DSFR size below its rank; in preview mode
	// the tag also drops a rank so the page's own h1 stays unique.
	const headingRenderer =
		(from: HeadingLevel) =>
		(
			props: React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLHeadingElement>,
				HTMLHeadingElement
			>,
		) => {
			const level = Number(from.slice(1));
			const tagLevel = mode === "preview" ? Math.min(6, level + 1) : level;
			const Tag = `h${tagLevel}` as HeadingLevel;
			return <Tag {...props} className={HEADING_CLASS[from]} />;
		};

	const linkRenderer = (
		props: React.DetailedHTMLProps<
			React.HTMLAttributes<HTMLAnchorElement>,
			HTMLAnchorElement
		>,
	) => {
		return (
			<a {...props} className={classes.link}>
				{props.children}
			</a>
		);
	};

	const components = {
		a: linkRenderer,
		h1: headingRenderer("h1"),
		h2: headingRenderer("h2"),
		h3: headingRenderer("h3"),
		h4: headingRenderer("h4"),
		h5: headingRenderer("h5"),
		h6: headingRenderer("h6"),
	};

	return (
		<div className={classes.markdownContainer}>
			<Markdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
				components={components}
			>
				{content}
			</Markdown>
		</div>
	);
}

const useStyles = tss.withName(MarkdownToJsx.name).create({
	link: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
	},
	// Mirrors the published-declaration mockup: 24px between blocks, lists indented
	// past the marker, section headings one step smaller than the DSFR defaults.
	markdownContainer: {
		"p, ul, ol": {
			marginTop: 0,
			marginBottom: fr.spacing("6v"),
		},
		"ul, ol": {
			paddingLeft: fr.spacing("8v"),
		},
		"h1, h2, h3, h4, h5, h6": {
			marginTop: fr.spacing("8v"),
			marginBottom: fr.spacing("4v"),
		},
		"h1:first-child": {
			marginTop: 0,
		},
		".fr-badge": {
			marginBottom: fr.spacing("4v"),
		},
		[`.${OBSOLETE_NOTICE_CLASS}`]: {
			backgroundColor: fr.colors.options.redMarianne._975_75.default,
			padding: fr.spacing("6v"),
			marginBottom: fr.spacing("6v"),
			"& .fr-badge": { marginBottom: fr.spacing("2v") },
			"& p": { marginBottom: fr.spacing("1v") },
			"& p:last-child": { marginBottom: 0 },
		},
	},
});
