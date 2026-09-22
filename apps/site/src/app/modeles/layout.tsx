import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself is a client component (tss styles), so the title lives here.
export const metadata: Metadata = { title: "Modèles à télécharger" };

export default function TemplatesLayout({ children }: { children: ReactNode }) {
	return children;
}
