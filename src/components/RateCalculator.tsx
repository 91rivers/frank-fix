"use client";

import { useState, useEffect } from "react";

type RateCalculatorProps = {
    amount: string;
    onAmountChange: (value: string) => void;
    fromCurrency: "EUR" | "CHF";
    onFromCurrencyChange: (currency: "EUR" | "CHF") => void;
};

export function RateCalculator({
    amount,
    onAmountChange,
    fromCurrency,
    onFromCurrencyChange,
}: RateCalculatorProps) {
    const [rate, setRate] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchRate() {
            try {
                setLoading(true);
                // We always fetch EUR to CHF, then invert if needed based on state
                const response = await fetch("/api/rate?from=EUR&to=CHF");
                if (!response.ok) throw new Error("Failed to fetch rate");
                const data = await response.json();
                setRate(data.rate);
            } catch {
                setRate(null);
            } finally {
                setLoading(false);
            }
        }

        fetchRate();
    }, []);

    const handleSwap = () => {
        onFromCurrencyChange(fromCurrency === "EUR" ? "CHF" : "EUR");
    };

    const toCurrency = fromCurrency === "EUR" ? "CHF" : "EUR";
    const currentRate = fromCurrency === "EUR" ? rate : (rate ? 1 / rate : null);
    const parsedAmount = parseFloat(amount) || 0;
    const convertedAmount = currentRate ? (parsedAmount * currentRate).toFixed(2) : "0.00";

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="relative flex items-stretch overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/70 to-slate-100/60 shadow-[0_8px_30px_rgba(2,6,23,0.08)] backdrop-blur dark:border-slate-700/70 dark:from-slate-900/90 dark:via-slate-900/75 dark:to-slate-800/70">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-slate-300/20" />
                <div className="flex-1 min-w-0 px-4 py-3 text-left">
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        You send
                    </label>
                    <div className="flex justify-between items-center">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => onAmountChange(e.target.value)}
                            className="w-full min-w-0 bg-transparent text-2xl font-semibold outline-none text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600"
                            placeholder="0"
                        />
                        <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {fromCurrency}
                        </span>
                    </div>
                </div>

                <div className="relative flex w-10 items-center justify-center">
                    <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-600" />
                    <button
                        onClick={handleSwap}
                        className="relative z-10 rounded-full border border-slate-200/90 bg-white/95 p-1.5 text-slate-500 shadow-[0_2px_10px_rgba(15,23,42,0.12)] transition hover:-translate-y-px hover:border-frank-blue hover:text-frank-blue dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
                        aria-label="Swap currencies"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3-4 4 4 4" /><path d="M20 7H4" /><path d="m8 21 4-4-4-4" /><path d="M4 17h16" /></svg>
                    </button>
                </div>

                <div className="flex-1 min-w-0 px-4 py-3 text-left">
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        You receive
                    </label>
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-semibold text-slate-900 dark:text-white truncate">
                            {loading ? "..." : convertedAmount}
                        </div>
                        <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {toCurrency}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
