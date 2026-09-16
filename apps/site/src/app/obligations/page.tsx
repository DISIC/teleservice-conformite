import type { Metadata } from "next";
import { StartDsfrOnHydration } from "~/dsfr-bootstrap";

export const metadata: Metadata = { title: "Obligations légales" };

export default function LegalObligationsPage() {
	return <StartDsfrOnHydration />;
}
