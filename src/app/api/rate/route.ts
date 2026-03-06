import { NextResponse } from "next/server";
import { fetchFrankfurterRate, LIVE_RATE_UNAVAILABLE_MESSAGE } from "@/lib/rates";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || "EUR";
    const to = searchParams.get("to") || "CHF";

    try {
        const result = await fetchFrankfurterRate(from, to);
        if (!result) {
            throw new Error("Frankfurter API returned invalid response");
        }

        return NextResponse.json({ rate: result.rate, from, to, date: result.date });
    } catch (error) {
        console.error("Rate fetch error:", error);
        return NextResponse.json(
            { error: LIVE_RATE_UNAVAILABLE_MESSAGE },
            { status: 500 }
        );
    }
}
