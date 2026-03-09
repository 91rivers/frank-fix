'use client';

import { useEffect, useState } from 'react';
import { Calendar, Mail, UserPlus, CheckCircle2, Coins } from 'lucide-react';
import { createAlert } from '@/app/actions/alerts';

const getTodayDateString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().split('T')[0];
};

type RateAlertFormProps = {
    linkedAmount: string;
    linkedBaseCurrency: 'EUR' | 'CHF';
};

export function RateAlertForm({ linkedAmount, linkedBaseCurrency }: RateAlertFormProps) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
    const [date, setDate] = useState(getTodayDateString());
    const [amount, setAmount] = useState(linkedAmount);
    const [baseCurrency, setBaseCurrency] = useState<'EUR' | 'CHF'>(linkedBaseCurrency);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setAmount(linkedAmount);
    }, [linkedAmount]);

    useEffect(() => {
        setBaseCurrency(linkedBaseCurrency);
    }, [linkedBaseCurrency]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        setError(null);

        try {
            const formData = new FormData(e.currentTarget);
            const result = await createAlert(formData);

            if (result.success) {
                setStatus('submitted');
                setTimeout(() => {
                    setStatus('idle');
                    setDate(getTodayDateString());
                    setAmount(linkedAmount);
                }, 5000);
            } else {
                setStatus('idle');
                setError(result.error || 'Failed to schedule alert');
            }
        } catch (err) {
            setStatus('idle');
            setError('An unexpected error occurred.');
        }
    };

    if (status === 'submitted') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="w-12 h-12 mb-3" />
                <h3 className="font-bold text-lg">Alert Scheduled!</h3>
                <p className="text-sm text-center mt-2 opacity-80">
                    We'll send an email with the exact Frank rate on the date you selected.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
            <div className="space-y-4 bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                    Plan swap with your mate
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                    Frank will notify you the fair rate on the day you agree to swap.
                </p>

                <div className="space-y-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Mail size={16} />
                        </div>
                        <input
                            type="email"
                            required
                            name="email"
                            placeholder="Your email"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-frank-blue focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <UserPlus size={16} />
                        </div>
                        <input
                            type="email"
                            name="mateEmail"
                            placeholder="Mate's email (optional)"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-frank-blue focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Coins size={16} />
                            </div>
                            <input
                                type="number"
                                required
                                name="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount"
                                min="1"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-frank-blue focus:border-transparent outline-none transition-all dark:text-white"
                            />
                        </div>
                        <select
                            name="baseCurrency"
                            value={baseCurrency}
                            onChange={(e) => setBaseCurrency(e.target.value as 'EUR' | 'CHF')}
                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-frank-blue focus:border-transparent dark:text-white transition-all font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                            <option value="EUR">EUR</option>
                            <option value="CHF">CHF</option>
                        </select>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Calendar size={16} />
                        </div>
                        <input
                            type="date"
                            required
name="targetDate"
style={{ maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={getTodayDateString()}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-frank-blue focus:border-transparent outline-none transition-all dark:text-white placeholder-slate-400"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-red-500 font-medium px-2">
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full mt-4 py-3 bg-frank-blue hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all text-white font-semibold rounded-xl text-sm shadow-md flex justify-center items-center"
                >
                    {status === 'submitting' ? 'Scheduling...' : 'Schedule'}
                </button>
                <p className="mt-3 text-xs text-center text-slate-500 dark:text-slate-400">
                    No spam. No ads. <br></br>Just a single email reminder.
                </p>
            </div>
        </form>
    );
}
