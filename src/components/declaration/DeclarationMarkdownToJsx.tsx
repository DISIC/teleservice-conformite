import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export default function DeclarationMarkdownToJsx({
	content,
	mode = "default",
}: { content: string; mode?: "default" | "preview" }) {
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

	const components =
		mode === "preview"
			? {
					h1: shiftHeading("h1"),
					h2: shiftHeading("h2"),
					h3: shiftHeading("h3"),
					h4: shiftHeading("h4"),
					h5: shiftHeading("h5"),
					h6: shiftHeading("h6"),
				}
			: {};

	return (
		<Markdown
			remarkPlugins={[remarkGfm]}
			rehypePlugins={[rehypeRaw]}
			components={components}
		>
			{content}
		</Markdown>
	);
}
