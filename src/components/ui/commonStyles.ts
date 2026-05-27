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
});
