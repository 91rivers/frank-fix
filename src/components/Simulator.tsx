'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal } from 'lucide-react';
import { getSafeInitialFrankRate } from '@/lib/simulator';

type EditedSide = 'felix' | 'flora';
type AssumptionsPreset = 'default' | 'custom' | 'wise';

type SimulatorProps = {
    initialFrankRateChfPerEur?: number;
};

export function Simulator({ initialFrankRateChfPerEur = 0.95 }: SimulatorProps) {
    const safeInitialFrankRate = getSafeInitialFrankRate(initialFrankRateChfPerEur);
    const defaultBankSpreadPercent = 1.5;
    const defaultFelixBankRate = safeInitialFrankRate * (1 + defaultBankSpreadPercent / 100);
    const defaultFloraBankRate = safeInitialFrankRate * (1 - defaultBankSpreadPercent / 100);
    const defaultAssumptions = {
        frankRateChfPerEur: safeInitialFrankRate,
        bankSpreadPercent: defaultBankSpreadPercent,
        felixAmountChf: 1000,
        felixBankRateChfPerEur: defaultFelixBankRate,
        felixFixedFeeChf: 5,
        felixVariableFeePercent: 0,
        floraAmountEur: 1000 / safeInitialFrankRate,
        floraBankRateChfPerEur: defaultFloraBankRate,
        floraFixedFeeEur: 5,
        floraVariableFeePercent: 0
    };

    const [frankRateChfPerEur, setFrankRateChfPerEur] = useState(defaultAssumptions.frankRateChfPerEur);
    const [felixAmountChf, setFelixAmountChf] = useState(defaultAssumptions.felixAmountChf);
    const [felixBankRateChfPerEur, setFelixBankRateChfPerEur] = useState(defaultAssumptions.felixBankRateChfPerEur);
    const [felixFixedFeeChf, setFelixFixedFeeChf] = useState(defaultAssumptions.felixFixedFeeChf);
    const [felixVariableFeePercent, setFelixVariableFeePercent] = useState(defaultAssumptions.felixVariableFeePercent);
    const [floraAmountEur, setFloraAmountEur] = useState(defaultAssumptions.floraAmountEur);
    const [floraBankRateChfPerEur, setFloraBankRateChfPerEur] = useState(defaultAssumptions.floraBankRateChfPerEur);
    const [floraFixedFeeEur, setFloraFixedFeeEur] = useState(defaultAssumptions.floraFixedFeeEur);
    const [floraVariableFeePercent, setFloraVariableFeePercent] = useState(defaultAssumptions.floraVariableFeePercent);
    const [selectedAssumptionsPreset, setSelectedAssumptionsPreset] = useState<AssumptionsPreset>('default');
    const [lastEditedSide, setLastEditedSide] = useState<EditedSide>('felix');
    const [isAssumptionsModalOpen, setIsAssumptionsModalOpen] = useState(false);
    const [isLoadingWise, setIsLoadingWise] = useState(false);
    const [wiseError, setWiseError] = useState<string | null>(null);
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
        setFrankRateChfPerEur(defaultAssumptions.frankRateChfPerEur);
        setFelixAmountChf(defaultAssumptions.felixAmountChf);
        setFelixBankRateChfPerEur(defaultAssumptions.felixBankRateChfPerEur);
        setFelixFixedFeeChf(defaultAssumptions.felixFixedFeeChf);
        setFelixVariableFeePercent(defaultAssumptions.felixVariableFeePercent);
        setFloraAmountEur(defaultAssumptions.floraAmountEur);
        setFloraBankRateChfPerEur(defaultAssumptions.floraBankRateChfPerEur);
        setFloraFixedFeeEur(defaultAssumptions.floraFixedFeeEur);
        setFloraVariableFeePercent(defaultAssumptions.floraVariableFeePercent);
        setSelectedAssumptionsPreset('default');
        setLastEditedSide('felix');
    };

    const handleAssumptionsPresetChange = (value: AssumptionsPreset) => {
        setWiseError(null);
        if (value === 'default') {
            resetDefaults();
            return;
        }
        if (value === 'wise') {
            setSelectedAssumptionsPreset('wise');
            return;
        }
        setSelectedAssumptionsPreset('custom');
    };

    const fetchWiseData = async () => {
        setIsLoadingWise(true);
        setWiseError(null);
        try {
            // Fetch Felix (CHF -> EUR)
            const felixRes = await fetch(`/api/wise?sourceCurrency=CHF&targetCurrency=EUR&sendAmount=${felixAmountChf}`);
            if (!felixRes.ok) throw new Error('Failed to fetch Felix Wise data');
            const felixData = await felixRes.json();

            // Fetch Flora (EUR -> CHF)
            const floraRes = await fetch(`/api/wise?sourceCurrency=EUR&targetCurrency=CHF&sendAmount=${floraAmountEur}`);
            if (!floraRes.ok) throw new Error('Failed to fetch Flora Wise data');
            const floraData = await floraRes.json();

            // Update States based on the response
            // For Flora (EUR -> CHF), Wise's rate is typically CHF per EUR (e.g., 0.95), which is what we need to use for Frank's parity
            const newFrankRate = floraData.rate;

            setFrankRateChfPerEur(newFrankRate);

            // Felix's bank rate needs to be converted back to CHF per EUR
            setFelixBankRateChfPerEur(1 / felixData.rate);
            setFelixFixedFeeChf(felixData.fee);
            setFelixVariableFeePercent(0);

            // Flora's bank rate is already in CHF per EUR (e.g. 0.95)
            setFloraBankRateChfPerEur(floraData.rate);
            setFloraFixedFeeEur(floraData.fee);
            setFloraVariableFeePercent(0);

        } catch (err: any) {
            console.error('Wise integration error:', err);
            setWiseError('Could not fetch latest Wise rates.');
        } finally {
            setIsLoadingWise(false);
        }
    };

    useEffect(() => {
        if (selectedAssumptionsPreset !== 'wise') return;

        const timer = setTimeout(() => {
            fetchWiseData();
        }, 600);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [felixAmountChf, floraAmountEur, selectedAssumptionsPreset]);


    // Math for Felix (CHF -> EUR)
    const frankEURForA = felixAmountChf / frankRateChfPerEur;
    const bankRateA_EurPerChf = 1 / felixBankRateChfPerEur;
    const felixVariableFeeChf = (felixAmountChf * felixVariableFeePercent) / 100;
    const felixTotalBankFeeChf = felixFixedFeeChf + felixVariableFeeChf;
    const bankEURForA = Math.max(0, (felixAmountChf - felixTotalBankFeeChf) * bankRateA_EurPerChf);
    const bankLossA_EUR = Math.max(0, frankEURForA - bankEURForA);

    // Math for Flora (EUR -> CHF)
    const frankCHFForB = floraAmountEur * frankRateChfPerEur;
    const bankRateB_ChfPerEur = floraBankRateChfPerEur;
    const floraVariableFeeEur = (floraAmountEur * floraVariableFeePercent) / 100;
    const floraTotalBankFeeEur = floraFixedFeeEur + floraVariableFeeEur;
    const bankCHFForB = Math.max(0, (floraAmountEur - floraTotalBankFeeEur) * bankRateB_ChfPerEur);
    const bankLossB_CHF = Math.max(0, frankCHFForB - bankCHFForB);

    // Total Loss
    const totalLossCHF = (bankLossA_EUR * frankRateChfPerEur) + bankLossB_CHF;
    const totalLossEUR = totalLossCHF / frankRateChfPerEur;
    const annualLossCHF = totalLossCHF * 12;
    const isFelixBankRateBetter = felixBankRateChfPerEur < frankRateChfPerEur;
    const isFloraBankRateBetter = floraBankRateChfPerEur > frankRateChfPerEur;
    const isFelixBankReturnBetter = bankEURForA > frankEURForA;
    const isFloraBankReturnBetter = bankCHFForB > frankCHFForB;

    const openAssumptionsModal = () => setIsAssumptionsModalOpen(true);
    const closeAssumptionsModal = () => setIsAssumptionsModalOpen(false);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">

            {/* 1. Unified Balance Sheet Flow */}
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-800">

                    {/* --- FELIX COLUMN (CHF -> EUR) --- */}
                    <div className="p-6 sm:p-8 flex flex-col space-y-6">
                        {/* 1. Sends */}
                        <div className="flex flex-col items-start gap-2 pb-6 border-b border-slate-200 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-frank-blue/10 dark:bg-frank-blue/30 text-frank-blue dark:text-white font-bold flex items-center justify-center shadow-inner">F</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Felix</h3>
                                    <p className="text-xs text-slate-500">CHF to EUR</p>
                                </div>
                            </div>
                            <div className="w-full text-left sm:w-auto sm:text-right">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Sends</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{felixAmountChf.toFixed(2)} CHF</p>
                            </div>
                        </div>

                        {/* 2. Bank Pathway */}
                        <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Bank rate*</span>
                                <span className={`font-mono font-medium ${isFelixBankRateBetter ? 'text-emerald-500' : 'text-frank-red'}`}>{felixBankRateChfPerEur.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Bank fees*</span>
                                <span className={`font-mono font-medium ${felixTotalBankFeeChf > 0 ? 'text-frank-red' : 'text-slate-700 dark:text-slate-300'}`}>-{felixTotalBankFeeChf.toFixed(2)} CHF</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Bank returns</span>
                                <span className={`text-lg font-bold ${isFelixBankReturnBetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-frank-red dark:text-red-400'}`}>{bankEURForA.toFixed(2)} €</span>
                            </div>
                        </div>

                        {/* 3. Frank Pathway */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Interbank rate</span>
                                <span className={`font-mono font-medium ${isFelixBankRateBetter ? 'text-frank-red' : 'text-emerald-500'}`}>{frankRateChfPerEur.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Flora fees</span>
                                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">0.00 €</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Flora returns</span>
                                <span className={`text-lg font-bold ${isFelixBankReturnBetter ? 'text-frank-red dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{frankEURForA.toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>


                    {/* --- FLORA COLUMN (EUR -> CHF) --- */}
                    <div className="p-6 sm:p-8 flex flex-col space-y-6">
                        {/* 1. Sends */}
                        <div className="flex flex-col items-start gap-2 pb-6 border-b border-slate-200 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-frank-blue/10 dark:bg-frank-blue/30 text-frank-blue dark:text-white font-bold flex items-center justify-center shadow-inner">F</div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Flora</h3>
                                    <p className="text-xs text-slate-500">EUR to CHF</p>
                                </div>
                            </div>
                            <div className="w-full text-left sm:w-auto sm:text-right">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Sends</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{floraAmountEur.toFixed(2)} EUR</p>
                            </div>
                        </div>

                        {/* 2. Bank Pathway */}
                        <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Bank rate*</span>
                                <span className={`font-mono font-medium ${isFloraBankRateBetter ? 'text-emerald-500' : 'text-frank-red'}`}>{floraBankRateChfPerEur.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Bank fees*</span>
                                <span className={`font-mono font-medium ${floraTotalBankFeeEur > 0 ? 'text-frank-red' : 'text-slate-700 dark:text-slate-300'}`}>-{floraTotalBankFeeEur.toFixed(2)} EUR</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Bank returns</span>
                                <span className={`text-lg font-bold ${isFloraBankReturnBetter ? 'text-emerald-600 dark:text-emerald-400' : 'text-frank-red dark:text-red-400'}`}>{bankCHFForB.toFixed(2)} CHF</span>
                            </div>
                        </div>

                        {/* 3. Frank Pathway */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Interbank rate</span>
                                <span className={`font-mono font-medium ${isFloraBankRateBetter ? 'text-frank-red' : 'text-emerald-500'}`}>{frankRateChfPerEur.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Felix fees</span>
                                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">0.00 CHF</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">Felix returns</span>
                                <span className={`text-lg font-bold ${isFloraBankReturnBetter ? 'text-frank-red dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{frankCHFForB.toFixed(2)} CHF</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Shared Loss Bottom Bar */}
                <div className="relative bg-frank-red/5 dark:bg-frank-red/10 p-6 md:px-8 border-t border-frank-red/20 dark:border-frank-red/30">
                    <div className="w-full text-center">
                        <p className="text-frank-red dark:text-red-400 font-bold flex items-center justify-center gap-2 text-lg">
                            Banks&apos; bite: <span className="text-2xl">{totalLossCHF.toFixed(2)} CHF</span>
                            <span className="text-[11px] font-medium text-frank-red/80 dark:text-red-400/80">({totalLossEUR.toFixed(2)} EUR)</span>
                        </p>
                        <p className="text-sm text-frank-red/80 dark:text-red-400/80 mt-1 text-center">
                            Felix and Flora's annuel loss: {annualLossCHF.toFixed(2)} CHF
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAssumptionsModal}
                        aria-label="Customize assumptions"
                        title="Customize assumptions"
                        className="mt-3 md:mt-0 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 mx-auto md:mx-0 h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400 transition-colors hover:bg-white dark:hover:bg-slate-900 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center group"
                    >
                        <SlidersHorizontal size={14} aria-hidden="true" className="group-hover:text-frank-blue transition-colors" />
                    </button>
                </div>

            </div>

            <div className="text-xs text-slate-500 -mt-3 text-left px-1">
                <span>
                    * Default assumptions for this comparison: interbank reference rate {frankRateChfPerEur.toFixed(4)} CHF/EUR; default bank spread {defaultAssumptions.bankSpreadPercent.toFixed(1)}%; bank fees = fixed {defaultAssumptions.felixFixedFeeChf.toFixed(2)} CHF / {defaultAssumptions.floraFixedFeeEur.toFixed(2)} EUR + variable {defaultAssumptions.felixVariableFeePercent.toFixed(2)}% / {defaultAssumptions.floraVariableFeePercent.toFixed(2)}%.{' '}
                    <button
                        type="button"
                        onClick={openAssumptionsModal}
                        className="inline p-0 bg-transparent border-0 font-semibold text-slate-700 dark:text-slate-300 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 dark:hover:text-white dark:decoration-slate-600 transition"
                    >
                        Click here
                    </button>{' '}
                    to customize assumptions.
                </span>
            </div>

            {isAssumptionsModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="assumptions-modal-title"
                    onClick={closeAssumptionsModal}
                >
                    <div
                        ref={modalPanelRef}
                        className="w-full sm:w-[640px] max-h-[90dvh] overflow-y-auto overscroll-contain bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 id="assumptions-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                                    Run your own numbers
                                </h3>
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

                        <div className="space-y-1 text-left relative">
                            <label htmlFor="assumptions-preset" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-left">
                                Preset configuration
                            </label>
                            <div className="flex gap-2 items-center">
                                <select
                                    id="assumptions-preset"
                                    value={selectedAssumptionsPreset}
                                    onChange={e => handleAssumptionsPresetChange(e.target.value as AssumptionsPreset)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-frank-blue text-slate-900 dark:text-white disabled:opacity-50"
                                    disabled={isLoadingWise}
                                >
                                    <option value="default">Default</option>
                                    <option value="wise">Wise (Real-time)</option>
                                    <option value="custom">Custom simulation</option>
                                </select>
                                {selectedAssumptionsPreset === 'wise' && (
                                    <button
                                        type="button"
                                        onClick={fetchWiseData}
                                        disabled={isLoadingWise}
                                        className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-frank-blue dark:hover:text-frank-blue disabled:opacity-50 transition-colors"
                                        title="Refresh Wise rates"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={isLoadingWise ? "animate-spin" : ""}
                                        >
                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                            <path d="M3 3v5h5" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed text-left min-h-[16px]">
                                {isLoadingWise ? (
                                    <span className="text-frank-blue animate-pulse">Fetching latest rates from Wise...</span>
                                ) : wiseError ? (
                                    <span className="text-red-500">{wiseError}</span>
                                ) : selectedAssumptionsPreset === 'default'
                                    ? 'Using Frank standard assumptions for Felix and Flora.'
                                    : selectedAssumptionsPreset === 'wise'
                                        ? 'Using actual rates and fees retrieved from Wise.'
                                        : 'One or more values were adjusted from the default assumptions.'}
                            </p>
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
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-frank-blue text-slate-900 dark:text-white"
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
                                            onChange={e => {
                                                setSelectedAssumptionsPreset('custom');
                                                setFelixBankRateChfPerEur(Number(e.target.value) || 0);
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-frank-blue text-slate-900 dark:text-white"
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
                                            onChange={e => {
                                                setSelectedAssumptionsPreset('custom');
                                                setFelixFixedFeeChf(Number(e.target.value) || 0);
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-frank-blue text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="felix-variable-fee" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                            Variable fee (%)
                                        </label>
                                        <input
                                            id="felix-variable-fee"
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={felixVariableFeePercent}
                                            onChange={e => {
                                                setSelectedAssumptionsPreset('custom');
                                                setFelixVariableFeePercent(Number(e.target.value) || 0);
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-frank-blue text-slate-900 dark:text-white"
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
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-frank-blue text-slate-900 dark:text-white"
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
                                            onChange={e => {
                                                setSelectedAssumptionsPreset('custom');
                                                setFloraBankRateChfPerEur(Number(e.target.value) || 0);
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-frank-blue text-slate-900 dark:text-white"
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
                                            onChange={e => {
                                                setSelectedAssumptionsPreset('custom');
                                                setFloraFixedFeeEur(Number(e.target.value) || 0);
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-frank-blue text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="flora-variable-fee" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                                            Variable fee (%)
                                        </label>
                                        <input
                                            id="flora-variable-fee"
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={floraVariableFeePercent}
                                            onChange={e => {
                                                setSelectedAssumptionsPreset('custom');
                                                setFloraVariableFeePercent(Number(e.target.value) || 0);
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-frank-blue text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={closeAssumptionsModal}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-frank-blue text-white hover:opacity-90 transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div>
    )
}
