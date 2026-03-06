import Image from "next/image";
import Link from "next/link";
import { RateAlertForm } from "@/components/RateAlertForm";
import { fetchFrankfurterRate, LIVE_RATE_UNAVAILABLE_MESSAGE } from "@/lib/rates";

async function getRate() {
  const result = await fetchFrankfurterRate("EUR", "CHF");
  return result?.rate ?? null;
}

export default async function Home() {
  const rate = await getRate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-8 text-center sm:p-20">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 flex-1 mt-10">
        <div className="flex flex-col items-center gap-5">
          <Image src="/frank-logo.svg" alt="Frank's Friendly Fixing Logo" width={100} height={100} priority className="drop-shadow-md rounded-2xl" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-frank-blue dark:text-white">
            Frank&apos;s Friendly Fixing
          </h1>
        </div>

        <div className="space-y-2 mt-4">
          <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
            Frank&apos;s rate for today:
          </p>
          <div className="text-5xl sm:text-6xl font-black text-frank-blue dark:text-blue-400 font-mono tracking-tighter">
            {rate ? rate.toFixed(4) : "..."}
          </div>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Fairer EUR/CHF rate provided by the ECB.
          </p>
          {!rate && (
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              {LIVE_RATE_UNAVAILABLE_MESSAGE}
            </p>
          )}
        </div>

        <div className="w-full mt-4">
          <RateAlertForm />
        </div>

        <div className="mt-6 mb-12 w-full max-w-md mx-auto flex items-stretch gap-3">
          <Link
            href="/concept"
            className="inline-flex flex-1 items-center justify-center px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-frank-blue dark:text-slate-300 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Not convinced yet? <br></br>Run the numbers &rarr;
          </Link>
          <button
            type="button"
            className="inline-flex flex-1 flex-col items-center justify-center gap-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 cursor-not-allowed"
            aria-disabled="true"
          >
            Make it recurring, <br></br>save money for Xmas.
            <span className="rounded-full border border-slate-300 dark:border-slate-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">
              Coming soon
            </span>
          </button>
        </div>
      </main>

      <footer className="w-full max-w-2xl mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center flex-shrink-0">
        <p className="mb-2"><strong>Legal Disclaimer:</strong> Frank is a tool for finding fair exchange rates between peers. We are not a bank, broker, or financial institution. Frank does not hold, transfer, or manage any funds. Any exchange of currency must be conducted independently between consenting users at their own risk.</p>
        <p>&copy; {new Date().getFullYear()} Frank&apos;s Friendly Fixing. All rights reserved.</p>
      </footer>
    </div>
  );
}
