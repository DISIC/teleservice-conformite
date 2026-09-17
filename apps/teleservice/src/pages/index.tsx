import { AdvantagesSection } from "~/components/home/AdvantagesSection";
import { AraSection } from "~/components/home/AraSection";
import { FaqSection } from "~/components/home/FaqSection";
import { HomeHero } from "~/components/home/HomeHero";
import { WhySection } from "~/components/home/WhySection";
import { useProConnectSignIn } from "~/hooks/useProConnectSignIn";

export default function Home() {
	const signIn = useProConnectSignIn();

	return (
		<>
			<HomeHero onStart={signIn} />
			<WhySection />
			<AdvantagesSection onStart={signIn} />
			<AraSection />
			<FaqSection />
		</>
	);
}
