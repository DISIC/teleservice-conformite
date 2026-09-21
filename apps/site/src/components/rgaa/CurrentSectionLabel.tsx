"use client";

import { useEffect, useState } from "react";
import type { MarkdownHeading } from "~/lib/content";

interface CurrentSectionLabelProps {
	sections: MarkdownHeading[];
}

// The breadcrumb names the section the reader jumped to; the first one until the url says otherwise.
export default function CurrentSectionLabel({
	sections,
}: CurrentSectionLabelProps) {
	const [hash, setHash] = useState("");

	useEffect(() => {
		const sync = () => setHash(window.location.hash.slice(1));

		sync();
		window.addEventListener("hashchange", sync);
		return () => window.removeEventListener("hashchange", sync);
	}, []);

	const current = sections.find(({ id }) => id === hash) ?? sections[0];

	return <>{current?.label ?? ""}</>;
}
