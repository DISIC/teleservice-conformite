import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";

export type InviteEmailProps = {
	link: string;
	fullName: string;
	declarationName: string;
	administrationName: string;
	logoUrl?: string;
};

export function InviteEmail({
	link,
	fullName,
	declarationName,
	administrationName,
	logoUrl,
}: InviteEmailProps) {
	return (
		<EmailLayout
			preview="Vous avez été invité à rejoindre une déclaration d'accessibilité"
			logoUrl={logoUrl}
		>
			<Text style={paragraph}>Bonjour,</Text>

			<Text style={paragraph}>
				<strong>{fullName}</strong> vous invite à rejoindre la plateforme
				Déclaration d&apos;accessibilité et vous donne accès à la déclaration{" "}
				<strong>{declarationName}</strong>, de l&apos;administration{" "}
				<strong>{administrationName}</strong>.
			</Text>

			<Text style={paragraph}>
				Afin de créer votre compte, veuillez cliquer sur le bouton ci-dessous :
			</Text>

			<Section style={buttonContainer}>
				<Button style={button} href={link}>
					Accepter l&apos;invitation
				</Button>
			</Section>
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
	padding: "12px 0 8px 0",
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
