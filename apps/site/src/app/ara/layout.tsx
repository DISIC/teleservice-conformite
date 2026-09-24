import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Ara - Outil d’audit d’accessibilité",
};

export default function AraLayout({ children }: { children: ReactNode }) {
	return children;
}
