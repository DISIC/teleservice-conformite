import { Link, Section, Text } from "@react-email/components";

export function EmailFooter() {
	return (
		<Section style={footer}>
			<Text style={footerText}>
				Ce message est envoyé automatiquement par le site{" "}
				<strong>Déclaration d&apos;accessibilité</strong>, développé par la
				Brigade d&apos;Intervention Numérique, propulsé par la Direction
				interministérielle du numérique.
			</Text>
			<Text style={footerContact}>
				Pour toute question :{" "}
				<Link href="mailto:contact@accessibilite.gouv.fr" style={footerLink}>
					contact@accessibilite.gouv.fr
				</Link>
			</Text>
		</Section>
	);
}

const footer: React.CSSProperties = {
	backgroundColor: "#E9EDFE",
	padding: "20px 24px",
};

const footerText: React.CSSProperties = {
	fontSize: "13px",
	lineHeight: "20px",
	color: "#666666",
	margin: "0 0 10px 0",
};

const footerContact: React.CSSProperties = {
	fontSize: "13px",
	lineHeight: "20px",
	color: "#666666",
	margin: 0,
};

const footerLink: React.CSSProperties = {
	color: "#000091",
	textDecoration: "underline",
};
