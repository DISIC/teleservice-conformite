import { AdvantagesSection } from "~/components/home/AdvantagesSection";
import { AraSection } from "~/components/home/AraSection";
import { FaqSection } from "~/components/home/FaqSection";
import { Hero } from "~/components/home/Hero";
import { LegalObligationsSection } from "~/components/home/LegalObligationsSection";
import { WhySection } from "~/components/home/WhySection";
import { useIsAuthenticated } from "~/hooks/useIsAuthenticated";

const DASHBOARD_HREF = "/dashboard/declarations";

export default function Home({
	hasSessionCookie,
}: {
	hasSessionCookie?: boolean;
}) {
	const isAuthenticated = useIsAuthenticated(hasSessionCookie);
	const startHref = isAuthenticated ? DASHBOARD_HREF : "/api/connexion";
	const startLabel = isAuthenticated ? "Voir mes déclarations" : "Commencer";

	return (
		<>
			<Hero startHref={startHref} startLabel={startLabel} />
			<WhySection />
			<AdvantagesSection startHref={startHref} startLabel={startLabel} />
			<LegalObligationsSection />
			<AraSection />
			<FaqSection />
		</>
	);
}
