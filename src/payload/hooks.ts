// import type { FieldHook } from "payload";
// import type { Audit } from "./payload-types";

// type TGetCalcRateFromTwoCriterion = FieldHook<
// 	Audit,
// 	number | undefined,
// 	Partial<Audit>
// >;

// export const getCalcRateFromTwoCriterion: TGetCalcRateFromTwoCriterion = async (
// 	args,
// ) => {
// 	const { data } = args;

// 	const compliant = data?.compliant_criterion || 0;
// 	const nonCompliant = data?.non_compliant_criterion || 0;
// 	const total = compliant + nonCompliant;
// 	return total > 0 ? Math.round((compliant / total) * 100 * 100) / 100 : 0;
// };
