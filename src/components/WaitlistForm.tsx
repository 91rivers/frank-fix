"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function WaitlistForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");

        try {
            const { error } = await supabase
                .from("waitlist")
                .insert([{ email }]);

            if (error && Object.keys(error).length > 0) {
                // If the table doesn't exist yet, we'll suggest creating it
                console.error("Supabase Error:", error);
                throw error;
            }

            setStatus("success");
            setMessage("You're on the list! We'll notify you when Frank is live.");
            setEmail("");
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            // Handle potential 'relation "waitlist" does not exist' error gracefully
            if (error.code === '42P01') {
                setMessage("Waitlist is currently inactive. Please try again later.");
            } else if (error.code === '23505') {
                // Unique violation
                setStatus("success");
                setMessage("You are already on the waitlist!");
                setEmail("");
            } else {
                setMessage("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-8">
            {status === "success" ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-2xl text-center border border-green-200 dark:border-green-800">
                    <p className="font-medium">{message}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="flex-1 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-frank-blue focus:outline-none focus:ring-1 focus:ring-frank-blue transition shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={status === "loading" || !email}
                        className="rounded-full bg-frank-blue px-8 py-3 font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {status === "loading" ? "Joining..." : "Join Waitlist"}
                    </button>
                </form>
            )}
            {status === "error" && (
                <p className="mt-3 text-sm text-frank-red text-center">{message}</p>
            )}
        </div>
    );
}
