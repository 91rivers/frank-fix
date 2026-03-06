type ExchangeRateResult = {
    rate: number;
    date: string;
};

const FRANKFURTER_API_URL = "https://api.frankfurter.app/latest";
export const LIVE_RATE_UNAVAILABLE_MESSAGE = "Live exchange rate temporarily unavailable.";

export async function fetchFrankfurterRate(from = "EUR", to = "CHF"): Promise<ExchangeRateResult | null> {
    try {
        const response = await fetch(`${FRANKFURTER_API_URL}?from=${from}&to=${to}`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const rate = data?.rates?.[to];

        if (typeof rate !== "number") {
            return null;
        }

        return {
            rate,
            date: data.date ?? "",
        };
    } catch (error) {
        console.error("Failed to fetch Frankfurter rate:", error);
        return null;
    }
}
