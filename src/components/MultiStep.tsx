import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { tss } from "tss-react";

type MultiStepProps = {
	steps: Array<{
		slug: string;
		title: string;
	}>;
	currentStep: string;
	children: React.ReactNode;
};

export function MultiStep({ steps, currentStep, children }: MultiStepProps) {
	const { classes } = useStyles();

	const currentStepIndex = steps.findIndex((step) => step.slug === currentStep);

	const step = steps[currentStepIndex] as MultiStepProps["steps"][number];

	return (
		<div>
			<Stepper
				title={step.title}
				stepCount={steps.length}
				currentStep={currentStepIndex + 1}
				nextTitle={
					currentStepIndex + 1 < steps.length
						? steps[currentStepIndex + 1]?.title
						: undefined
				}
			/>
			{children}
		</div>
	);
}

const useStyles = tss.withName(MultiStep.name).create(() => ({
	container: {
		marginTop: 20,
	},
}));
