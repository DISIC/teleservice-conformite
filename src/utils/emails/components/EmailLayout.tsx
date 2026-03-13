import { Body, Container, Head, Html, Preview } from "@react-email/components";
import type { ReactNode } from "react";
import { EmailBanner } from "./EmailBanner";
import { EmailFooter } from "./EmailFooter";

type EmailLayoutProps = {
	preview: string;
	logoUrl?: string;
	children: ReactNode;
};

export function EmailLayout({ preview, logoUrl, children }: EmailLayoutProps) {
	return (
		<Html lang="fr">
			<Head>
				<style>{globalStyles}</style>
			</Head>
			<Preview>{preview}</Preview>
			<Body style={body}>
				<Container style={container}>
					<EmailBanner logoUrl={logoUrl} />
					<div style={content}>{children}</div>
					<EmailFooter />
				</Container>
			</Body>
		</Html>
	);
}

const globalStyles = `
	* { font-family: Marianne, Arial, sans-serif; box-sizing: border-box; }
	p, td { margin: 0; padding: 0; }
`;

const body: React.CSSProperties = {
	margin: 0,
	padding: 0,
	backgroundColor: "#ffffff",
};

const container: React.CSSProperties = {
	width: "600px",
	maxWidth: "600px",
	margin: "30px auto",
	backgroundColor: "#ffffff",
};

const content: React.CSSProperties = {
	padding: "32px 0",
};
