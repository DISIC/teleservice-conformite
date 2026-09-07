import type { NextPage } from "next";
import type { ReactNode } from "react";

// A page returning `null` keeps the téléservice header.
export type PageWithHeader<P = Record<string, never>> = NextPage<P> & {
	renderHeader?: (props: P) => ReactNode;
};
