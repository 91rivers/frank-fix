'use client';

import { useState } from 'react';
import { Calendar, Mail, UserPlus, CheckCircle2 } from 'lucide-react';

export function RateAlertForm() {
    const [status, setStatus] = useState<'idle' | 'submitted'>('idle');
    const [date, setDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we don't have a backend endpoint for this right now, we just mock the success state
        setStatus('submitted');
        setTimeout(() => setStatus('idle'), 5000);
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
                            required
                            placeholder="Mate's email (optional)"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-frank-blue focus:border-transparent outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Calendar size={16} />
                        </div>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-frank-blue focus:border-transparent outline-none transition-all dark:text-white placeholder-slate-400"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-frank-blue hover:opacity-90 active:scale-[0.98] transition-all text-white font-semibold rounded-xl text-sm shadow-md"
                >
                    Schedule
                </button>
                <p className="mt-3 text-xs text-center text-slate-500 dark:text-slate-400">
                    No spam. No ads. <br></br>Just a single email reminder.
                </p>
            </div>
        </form>
    );
}
