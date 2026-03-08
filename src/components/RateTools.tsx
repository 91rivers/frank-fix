"use client";

import { useState } from "react";
import { RateCalculator } from "@/components/RateCalculator";
import { RateAlertForm } from "@/components/RateAlertForm";

export function RateTools() {
    const [amount, setAmount] = useState("2000");
    const [fromCurrency, setFromCurrency] = useState<"EUR" | "CHF">("CHF");

    return (
        <>
            <div className="w-full max-w-md mx-auto">
                <RateCalculator
                    amount={amount}
                    onAmountChange={setAmount}
                    fromCurrency={fromCurrency}
                    onFromCurrencyChange={setFromCurrency}
                />
            </div>

            <div className="w-full mt-4">
                <RateAlertForm linkedAmount={amount} linkedBaseCurrency={fromCurrency} />
            </div>
        </>
    );
}
