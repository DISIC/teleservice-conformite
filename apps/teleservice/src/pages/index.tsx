import { useRouter } from "next/router";

import { AdvantagesSection } from "~/components/home/AdvantagesSection";
import { AraSection } from "~/components/home/AraSection";
import { FaqSection } from "~/components/home/FaqSection";
import { Hero } from "~/components/home/Hero";
import { WhySection } from "~/components/home/WhySection";
import { authClient, signInWithProConnect } from "~/lib/auth-client";

const DASHBOARD_HREF = "/dashboard/declarations";

export default function Home() {
	const router = useRouter();
	const { data: authSession } = authClient.useSession();

	const start = () =>
		authSession
			? router.push(DASHBOARD_HREF)
			: signInWithProConnect(DASHBOARD_HREF);

	return (
		<>
			<Hero onStart={start} />
			<WhySection />
			<AdvantagesSection onStart={start} />
			<AraSection />
			<FaqSection />
		</>
	);
}
