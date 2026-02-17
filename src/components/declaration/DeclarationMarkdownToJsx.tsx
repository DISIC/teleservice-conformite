import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";

export default function DeclarationMarkdownToJsx({
	content,
	mode = "published",
}: { content: string; mode?: "published" | "preview" }) {
	const { classes } = useStyles();

	const shiftHeading =
		(from: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") =>
		(
			props: React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLHeadingElement>,
				HTMLHeadingElement
			>,
		) => {
			const level = Number(from.slice(1));
			const newLevel = Math.min(6, level + 1);
			const Tag = `h${newLevel}`;
			return <Tag {...props} />;
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
		...(mode === "preview"
			? {
					h1: shiftHeading("h1"),
					h2: shiftHeading("h2"),
					h3: shiftHeading("h3"),
					h4: shiftHeading("h4"),
					h5: shiftHeading("h5"),
					h6: shiftHeading("h6"),
				}
			: {}),
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

const useStyles = tss.withName(DeclarationMarkdownToJsx.name).create({
	link: {
		color: fr.colors.decisions.text.actionHigh.blueFrance.default,
	},
	markdownContainer: {
		p: {
			marginBottom: 0,
		},
		"h1, h2, h3, h4, h5, h6": {
			marginTop: fr.spacing("10v"),
			marginBottom: fr.spacing("4v"),
		},
	},
});
