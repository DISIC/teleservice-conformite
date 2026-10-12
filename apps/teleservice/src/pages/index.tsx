import { AdvantagesSection } from "~/components/home/AdvantagesSection";
import { AraSection } from "~/components/home/AraSection";
import { FaqSection } from "~/components/home/FaqSection";
import { Hero } from "~/components/home/Hero";
import { WhySection } from "~/components/home/WhySection";
import { authClient } from "~/lib/auth-client";

const DASHBOARD_HREF = "/dashboard/declarations";

export default function Home() {
	const { data: authSession } = authClient.useSession();
	const startHref = authSession ? DASHBOARD_HREF : "/api/connexion";

	return (
		<>
			<Hero startHref={startHref} />
			<WhySection />
			<AdvantagesSection startHref={startHref} />
			<AraSection />
			<FaqSection />
		</>
	);
}
