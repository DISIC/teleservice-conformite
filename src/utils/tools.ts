import { getPayload } from "payload";
import type { Config } from "~/payload/payload-types";
import payloadConfig from "~/payload/payload.config";

export async function fetchOrReturnRealValue<
	T extends keyof Config["collections"],
>(
	item: number | Config["collections"][T],
	collection: T,
): Promise<Config["collections"][T]> {
	if (typeof item === "number") {
		const payload = await getPayload({ config: payloadConfig });
		return (await payload.findByID({
			collection,
			id: item,
		})) as Config["collections"][T];
	}

	return item as Config["collections"][T];
}
