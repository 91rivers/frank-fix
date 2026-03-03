"use client";

import { useState, useEffect } from "react";

export function RateCalculator() {
    const [rate, setRate] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [amount, setAmount] = useState<string>("1000");
    const [fromCurrency, setFromCurrency] = useState<"EUR" | "CHF">("EUR");

    useEffect(() => {
        async function fetchRate() {
            try {
                setLoading(true);
                // We always fetch EUR to CHF, then invert if needed based on state
                const response = await fetch("/api/rate?from=EUR&to=CHF");
                if (!response.ok) throw new Error("Failed to fetch rate");
                const data = await response.json();
                setRate(data.rate);
            } catch (err) {
                setError("Could not load latest rate.");
            } finally {
                setLoading(false);
            }
        }

        fetchRate();
    }, []);

    const handleSwap = () => {
        setFromCurrency(prev => prev === "EUR" ? "CHF" : "EUR");
    };

    const toCurrency = fromCurrency === "EUR" ? "CHF" : "EUR";
    const currentRate = fromCurrency === "EUR" ? rate : (rate ? 1 / rate : null);
    const parsedAmount = parseFloat(amount) || 0;
    const convertedAmount = currentRate ? (parsedAmount * currentRate).toFixed(2) : "0.00";

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-6 text-center text-slate-900 dark:text-white">Fair Rate Calculator</h2>

            {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

            <div className="space-y-4">
                {/* You send */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">You send</label>
                    <div className="flex justify-between items-center">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-transparent text-3xl font-bold outline-none text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600"
                            placeholder="0"
                        />
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 ml-4">{fromCurrency}</span>
                    </div>
                </div>

                {/* Swap button */}
                <div className="flex justify-center -my-6 relative z-10">
                    <button
                        onClick={handleSwap}
                        className="bg-white dark:bg-slate-800 p-2 rounded-full shadow border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-400"><path d="m16 3-4 4 4 4" /><path d="M20 7H4" /><path d="m8 21 4-4-4-4" /><path d="M4 17h16" /></svg>
                    </button>
                </div>

                {/* They receive */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">They receive (mid-market rate)</label>
                    <div className="flex justify-between items-center">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white truncate">
                            {loading ? "..." : convertedAmount}
                        </div>
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 ml-4">{toCurrency}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                    <span>Current Rate</span>
                    <span>
                        {loading ? "Loading..." : rate ? `1 EUR = ${rate.toFixed(4)} CHF` : "unavailable"}
                    </span>
                </div>
                <div className="text-center text-xs mt-2">
                    Source: <a href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-chf.en.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">European Central Bank (ECB)</a> via Frankfurter API
                </div>
            </div>
        </div>
    );
}
