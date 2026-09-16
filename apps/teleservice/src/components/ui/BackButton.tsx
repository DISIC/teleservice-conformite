import Button from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

type BackButtonProps = {
	children: ReactNode;
	href?: string;
	className?: string;
};

export function BackButton({ children, href, className }: BackButtonProps) {
	const router = useRouter();

	if (href) {
		return (
			<Button
				priority="secondary"
				linkProps={{ href }}
				iconId="fr-icon-arrow-left-s-line"
				size="small"
				className={className}
			>
				{children}
			</Button>
		);
	}

	return (
		<Button
			priority="secondary"
			onClick={() => router.back()}
			iconId="fr-icon-arrow-left-s-line"
			size="small"
			className={className}
		>
			{children}
		</Button>
	);
}
