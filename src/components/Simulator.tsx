'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';

type EditedSide = 'felix' | 'flora';

export function Simulator() {
    const defaultAssumptions = {
        frankRateChfPerEur: 0.95,
        felixAmountChf: 1000,
        felixBankRateChfPerEur: 0.9645,
        felixFixedFeeChf: 5,
        floraAmountEur: 1000 / 0.95,
        floraBankRateChfPerEur: 0.9358,
        floraFixedFeeEur: 5
    };

    const frankRateChfPerEur = defaultAssumptions.frankRateChfPerEur;
    const [felixAmountChf, setFelixAmountChf] = useState(defaultAssumptions.felixAmountChf);
    const [felixBankRateChfPerEur, setFelixBankRateChfPerEur] = useState(defaultAssumptions.felixBankRateChfPerEur);
    const [felixFixedFeeChf, setFelixFixedFeeChf] = useState(defaultAssumptions.felixFixedFeeChf);
    const [floraAmountEur, setFloraAmountEur] = useState(defaultAssumptions.floraAmountEur);
    const [floraBankRateChfPerEur, setFloraBankRateChfPerEur] = useState(defaultAssumptions.floraBankRateChfPerEur);
    const [floraFixedFeeEur, setFloraFixedFeeEur] = useState(defaultAssumptions.floraFixedFeeEur);
    const [lastEditedSide, setLastEditedSide] = useState<EditedSide>('felix');
    const [isAssumptionsModalOpen, setIsAssumptionsModalOpen] = useState(false);
    const firstInputRef = useRef<HTMLInputElement>(null);
    const modalPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAssumptionsModalOpen) return;
        const onEsc = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsAssumptionsModalOpen(false);
            }
        };
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [isAssumptionsModalOpen]);

    useEffect(() => {
        if (!isAssumptionsModalOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const timer = window.setTimeout(() => firstInputRef.current?.focus(), 0);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.clearTimeout(timer);
        };
    }, [isAssumptionsModalOpen]);

    useEffect(() => {
        if (!isAssumptionsModalOpen) return;

        const panel = modalPanelRef.current;
        if (!panel) return;

        const handleTabTrap = (event: globalThis.KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            const focusable = panel.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        panel.addEventListener('keydown', handleTabTrap);
        return () => panel.removeEventListener('keydown', handleTabTrap);
    }, [isAssumptionsModalOpen]);

    const handleFelixAmountChange = (value: string) => {
        const nextAmount = Number(value) || 0;
        setLastEditedSide('felix');
        setFelixAmountChf(nextAmount);
        setFloraAmountEur(nextAmount / frankRateChfPerEur);
    };

    const handleFloraAmountChange = (value: string) => {
        const nextAmount = Number(value) || 0;
        setLastEditedSide('flora');
        setFloraAmountEur(nextAmount);
        setFelixAmountChf(nextAmount * frankRateChfPerEur);
    };

    const resetDefaults = () => {
        setFelixAmountChf(defaultAssumptions.felixAmountChf);
        setFelixBankRateChfPerEur(defaultAssumptions.felixBankRateChfPerEur);
        setFelixFixedFeeChf(defaultAssumptions.felixFixedFeeChf);
        setFloraAmountEur(defaultAssumptions.floraAmountEur);
        setFloraBankRateChfPerEur(defaultAssumptions.floraBankRateChfPerEur);
        setFloraFixedFeeEur(defaultAssumptions.floraFixedFeeEur);
        setLastEditedSide('felix');
    };

    // Math for Felix (CHF -> EUR)
    const frankEURForA = felixAmountChf / frankRateChfPerEur;
    const bankRateA_EurPerChf = 1 / felixBankRateChfPerEur;
    const bankEURForA = Math.max(0, (felixAmountChf - felixFixedFeeChf) * bankRateA_EurPerChf);
    const bankLossA_EUR = Math.max(0, frankEURForA - bankEURForA);

    // Math for Flora (EUR -> CHF)
    const frankCHFForB = floraAmountEur * frankRateChfPerEur;
    const bankRateB_ChfPerEur = floraBankRateChfPerEur;
    const bankCHFForB = Math.max(0, (floraAmountEur - floraFixedFeeEur) * bankRateB_ChfPerEur);
    const bankLossB_CHF = Math.max(0, frankCHFForB - bankCHFForB);

    // Total Loss
    const totalLossCHF = (bankLossA_EUR * frankRateChfPerEur) + bankLossB_CHF;
    const totalLossEUR = totalLossCHF / frankRateChfPerEur;

    const openAssumptionsModal = () => setIsAssumptionsModalOpen(true);
    const closeAssumptionsModal = () => setIsAssumptionsModalOpen(false);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">

            {/* 1. Intro + assumptions summary */}
            <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 text-left">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Compare fair exchange vs bank pricing
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Same transaction, same people, two outcomes: banks extract spread and fixed fees.
                </p>
                <p className="text-xs text-slate-500 mt-3">
                    Frank rate: 1 EUR = {frankRateChfPerEur.toFixed(4)} CHF. Felix bank: {felixBankRateChfPerEur.toFixed(4)} CHF/EUR + {felixFixedFeeChf.toFixed(2)} CHF fee. Flora bank: {floraBankRateChfPerEur.toFixed(4)} CHF/EUR + {floraFixedFeeEur.toFixed(2)} EUR fee.
                </p>
            </div>

            {/* 2. Unified Balance Sheet Flow */}
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">

                    {/* --- FELIX COLUMN (CHF -> EUR) --- */}
                    <div className="p-6 sm:p-8 flex flex-col space-y-6">
                        {/* 1. Sends */}
                        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shadow-inner">F</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Felix</h3>
                                    <p className="text-xs text-slate-500">CHF to EUR</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Sends</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{felixAmountChf.toFixed(2)} CHF</p>
                            </div>
                        </div>

                        {/* 2. Bank Pathway */}
                        <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Bank rate*</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{felixBankRateChfPerEur.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Bank fees*</span>
                                <span className="font-mono text-red-500 font-medium">-{bankLossA_EUR.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Bank returns</span>
                                <span className="text-lg font-bold text-red-600 dark:text-red-400">{bankEURForA.toFixed(2)} €</span>
                            </div>
                        </div>

                        {/* 3. Frank Pathway */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Frank rate</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{frankRateChfPerEur.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Flora fees</span>
                                <span className="font-mono text-emerald-500 font-medium">0.00 €</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Flora returns</span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{frankEURForA.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>


                    {/* --- FLORA COLUMN (EUR -> CHF) --- */}
                    <div className="p-6 sm:p-8 flex flex-col space-y-6">
                        {/* 1. Sends */}
                        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shadow-inner">F</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Flora</h3>
                                    <p className="text-xs text-slate-500">EUR to CHF</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Sends</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{floraAmountEur.toFixed(2)} EUR</p>
                            </div>
                        </div>

                        {/* 2. Bank Pathway */}
                        <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Bank rate*</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{floraBankRateChfPerEur.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Bank fees*</span>
                                <span className="font-mono text-red-500 font-medium">-{bankLossB_CHF.toFixed(2)} CHF</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Bank returns</span>
                                <span className="text-lg font-bold text-red-600 dark:text-red-400">{bankCHFForB.toFixed(2)} CHF</span>
                            </div>
                        </div>

                        {/* 3. Frank Pathway */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Frank rate</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{frankRateChfPerEur.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Felix fees</span>
                                <span className="font-mono text-emerald-500 font-medium">0.00 CHF</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Felix returns</span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{frankCHFForB.toFixed(2)} CHF</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Shared Loss Bottom Bar */}
                <div className="bg-red-50 dark:bg-red-950/30 p-6 md:px-8 border-t border-red-100 dark:border-red-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2 text-lg">
                            Banks&apos; bite: <span className="text-2xl">{totalLossCHF.toFixed(2)} CHF</span>
                            <span className="text-[11px] font-medium text-red-600/80 dark:text-red-400/80">({totalLossEUR.toFixed(2)} EUR)</span>
                        </p>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                            Felix and Flora could go out for a pizza instead.
                        </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => {
                                document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm transition-all shadow-md transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <Zap size={16} className="fill-current" /> Stop paying banks
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-xs text-slate-500 -mt-3 text-left px-1 flex flex-wrap items-center gap-2">
                <span>
                    * Default assumptions: Frank rate {defaultAssumptions.frankRateChfPerEur.toFixed(4)} CHF/EUR; Felix ({defaultAssumptions.felixAmountChf.toFixed(0)} CHF, bank rate {defaultAssumptions.felixBankRateChfPerEur.toFixed(4)}, fee {defaultAssumptions.felixFixedFeeChf.toFixed(2)} CHF); Flora ({defaultAssumptions.floraAmountEur.toFixed(2)} EUR, bank rate {defaultAssumptions.floraBankRateChfPerEur.toFixed(4)}, fee {defaultAssumptions.floraFixedFeeEur.toFixed(2)} EUR). Use Customize assumptions or Reset defaults in the modal.
                </span>
                <button
                    type="button"
                    onClick={openAssumptionsModal}
                    className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full font-semibold text-xs transition"
                >
                    Customize assumptions
                </button>
            </div>

            {isAssumptionsModalOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-end sm:items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="assumptions-modal-title"
                    onClick={closeAssumptionsModal}
                >
                    <div
                        ref={modalPanelRef}
                        className="w-full sm:w-[640px] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 id="assumptions-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                                    Customize assumptions
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Felix and Flora amounts are linked using the fixed Frank rate shown on the page.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeAssumptionsModal}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                aria-label="Close assumptions editor"
                            >
                                x
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Felix</h4>
                                    <div className="space-y-1">
                                        <label htmlFor="felix-amount" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                            Initial amount (CHF)
                                        </label>
                                        <input
                                            id="felix-amount"
                                            ref={firstInputRef}
                                            type="number"
                                            inputMode="decimal"
                                            value={felixAmountChf}
                                            onChange={e => handleFelixAmountChange(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="felix-bank-rate" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                            Bank rate (CHF per EUR)
                                        </label>
                                        <input
                                            id="felix-bank-rate"
                                            type="number"
                                            inputMode="decimal"
                                            step="0.0001"
                                            min="0.0001"
                                            max="5"
                                            value={felixBankRateChfPerEur}
                                            onChange={e => setFelixBankRateChfPerEur(Number(e.target.value) || 0)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="felix-fee" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                            Fixed fee (CHF)
                                        </label>
                                        <input
                                            id="felix-fee"
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            min="0"
                                            value={felixFixedFeeChf}
                                            onChange={e => setFelixFixedFeeChf(Number(e.target.value) || 0)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Flora</h4>
                                    <div className="space-y-1">
                                        <label htmlFor="flora-amount" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                            Initial amount (EUR)
                                        </label>
                                        <input
                                            id="flora-amount"
                                            type="number"
                                            inputMode="decimal"
                                            value={floraAmountEur}
                                            onChange={e => handleFloraAmountChange(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="flora-bank-rate" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                            Bank rate (CHF per EUR)
                                        </label>
                                        <input
                                            id="flora-bank-rate"
                                            type="number"
                                            inputMode="decimal"
                                            step="0.0001"
                                            min="0.0001"
                                            max="5"
                                            value={floraBankRateChfPerEur}
                                            onChange={e => setFloraBankRateChfPerEur(Number(e.target.value) || 0)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="flora-fee" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                            Fixed fee (EUR)
                                        </label>
                                        <input
                                            id="flora-fee"
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            min="0"
                                            value={floraFixedFeeEur}
                                            onChange={e => setFloraFixedFeeEur(Number(e.target.value) || 0)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                            <button
                                type="button"
                                onClick={resetDefaults}
                                className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                Reset defaults
                            </button>
                            <button
                                type="button"
                                onClick={closeAssumptionsModal}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
