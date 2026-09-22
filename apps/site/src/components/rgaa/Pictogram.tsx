"use client";

import Application from "@codegouvfr/react-dsfr/picto/Application";
import DocumentSearch from "@codegouvfr/react-dsfr/picto/DocumentSearch";
import Search from "@codegouvfr/react-dsfr/picto/Search";
import TechnicalError from "@codegouvfr/react-dsfr/picto/TechnicalError";
import type { PictoProps } from "@codegouvfr/react-dsfr/picto/utils/PictoWrapper";
import JusticeScales from "@codegouvfr/react-dsfr/picto/JusticeScales";
import Coding from "@codegouvfr/react-dsfr/picto/Coding";

// Pictograms are named, not passed as components: server pages can only hand serialisable props to client components.
const PICTOGRAMS = {
	application: Application,
	"document-search": DocumentSearch,
	search: Search,
	"technical-error": TechnicalError,
	"justice-scales": JusticeScales,
	coding: Coding,
};

export type PictogramId = keyof typeof PICTOGRAMS;

export default function Pictogram({
	id,
	...props
}: PictoProps & { id: PictogramId }) {
	const Picto = PICTOGRAMS[id];
	return <Picto {...props} />;
}
