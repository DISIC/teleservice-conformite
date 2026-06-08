import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";

export const useCommonStyles = tss.create({
	whiteBackground: {
		backgroundColor: fr.colors.decisions.background.raised.grey.default,
		width: "100%",
		display: "flex",
		flexDirection: "column",
	},
	actionButtonsContainer: {
		display: "flex",
		justifyContent: "space-between",
	},
	shellFormWrapper: {
		display: "flex",
		flexDirection: "column",
		gap: fr.spacing("6v"),
	},
	classicGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
	},
});
