import { Hr, Img, Section, Text } from "@react-email/components";

type EmailBannerProps = {
	logoUrl?: string;
};

export function EmailBanner({ logoUrl }: EmailBannerProps) {
	return (
		<Section style={banner}>
			<div style={row}>
				{logoUrl && (
					<Img
						src={logoUrl}
						alt="République Française"
						width="100"
						style={logo}
					/>
				)}
				<Text style={title}>Déclaration d&apos;accessibilité</Text>
			</div>
			<Hr style={divider} />
		</Section>
	);
}

const banner: React.CSSProperties = {
	padding: "20px 0",
	width: "100%",
};

const row: React.CSSProperties = {
	display: "flex",
	flexDirection: "row",
	alignItems: "center",
	gap: "16px",
};

const logo: React.CSSProperties = {
	display: "block",
	border: 0,
	outline: "none",
	textDecoration: "none",
	flexShrink: 0,
};

const title: React.CSSProperties = {
	fontSize: "20px",
	fontWeight: "bold",
	margin: 0,
	lineHeight: "28px",
};

const divider: React.CSSProperties = {
	borderColor: "#e0e0e0",
	margin: "0",
	marginTop: "16px",
};
