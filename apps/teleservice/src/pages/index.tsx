import { AdvantagesSection } from "~/components/home/AdvantagesSection";
import { AraSection } from "~/components/home/AraSection";
import { FaqSection } from "~/components/home/FaqSection";
import { Hero } from "~/components/home/Hero";
import { LegalObligationsSection } from "~/components/home/LegalObligationsSection";
import { WhySection } from "~/components/home/WhySection";
import { authClient } from "~/lib/auth-client";

const DASHBOARD_HREF = "/dashboard/declarations";

export default function Home() {
	const { data: authSession } = authClient.useSession();
	const startHref = authSession ? DASHBOARD_HREF : "/api/connexion";
	const startLabel = authSession ? "Voir mes déclarations" : "Commencer";

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
