"use client";

import type { ReactNode } from "react";
import { NextAppDirEmotionCacheProvider } from "tss-react/next/appDir";

export function EmotionCacheProvider({ children }: { children: ReactNode }) {
	return (
		<NextAppDirEmotionCacheProvider options={{ key: "css" }}>
			{children}
		</NextAppDirEmotionCacheProvider>
	);
}
