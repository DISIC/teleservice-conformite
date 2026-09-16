import { Button, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";

export type ConfirmationEmailProps = {
	link: string;
	linkDeclarationList: string;
	fullName: string;
	declarationName: string;
	administrationName: string;
	logoUrl?: string;
};

export function ConfirmationEmail({
	link,
	linkDeclarationList,
	fullName,
	declarationName,
	administrationName,
	logoUrl,
}: ConfirmationEmailProps) {
	return (
		<EmailLayout
			preview={`${fullName} a accepté votre invitation sur ${declarationName}`}
			logoUrl={logoUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				<strong>{fullName}</strong> vient d&apos;accepter votre invitation à la
				déclaration <strong>{declarationName}</strong>, de l&apos;administration{" "}
				<strong>{administrationName}</strong>.
			</Text>

			<Text style={paragraph}>
				Vous pouvez à tout moment gérer son statut depuis l&apos;onglet
				&quot;Membres&quot; de votre déclaration.
			</Text>

			<Section style={buttonContainer}>
				<Button style={button} href={link}>
					Accéder à l&apos;onglet Membres
				</Button>
			</Section>

			<Text style={paragraph}>
				<Link href={linkDeclarationList} style={dashboardLink}>
					Retrouvez toutes vos déclarations sur votre tableau de bord
				</Link>
			</Text>
		</EmailLayout>
	);
}

const paragraph: React.CSSProperties = {
	fontSize: "16px",
	lineHeight: "26px",
	color: "#1a1a1a",
	margin: "0 0 20px 0",
};

const buttonContainer: React.CSSProperties = {
	textAlign: "center",
	padding: "12px 0 32px 0",
};

const button: React.CSSProperties = {
	backgroundColor: "#000091",
	color: "#ffffff",
	fontSize: "16px",
	fontWeight: "bold",
	textDecoration: "none",
	padding: "14px 32px",
	display: "inline-block",
};

const dashboardLink: React.CSSProperties = {
	fontSize: "16px",
	color: "#000091",
	textDecoration: "underline",
};
