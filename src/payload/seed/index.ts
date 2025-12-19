import "dotenv/config";

import config from "@payload-config";
import { getPayload } from "payload";
import { seedDeclarations } from "./declarations";

const seedData = async () => {
  try {
		const payload = await getPayload({
			config,
		});

    await seedDeclarations(payload);
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
		process.exit();
	}
}

await seedData();