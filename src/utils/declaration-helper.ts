export const getConformityStatus = (rate: number): string => {
		if (rate < 50) {
			return "non conforme";
		}
		if (rate >= 50 && rate <= 99) {
			return "partiellement conforme";
		}

		return "conforme";
	};