import { Suspense } from "react";
import Image from "next/image";
import { Simulator } from "@/components/Simulator";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-8 text-center sm:p-20">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 flex-1 mt-10">
        <div className="flex flex-col items-center gap-5">
          <Image src="/frank-logo.svg" alt="Frank's Friendly Fixing Logo" width={100} height={100} priority className="drop-shadow-md rounded-2xl" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-frank-blue dark:text-white">
            Frank&apos;s Friendly Fixing
          </h1>
        </div>

        <p className="text-lg text-slate-600 dark:text-slate-400 sm:text-xl mb-6">
        Fair rate for EUR/CHF bro-to-mate swaps.
        </p>

        <div className="w-full my-4 md:my-8 scale-100 sm:scale-105 origin-top mb-16">
          <Simulator />
        </div>

        <div id="waitlist-section" className="w-full mt-12 mb-8">
          <WaitlistForm />
        </div>
      </main>

      <footer className="w-full max-w-2xl mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center">
        <p className="mb-2"><strong>Legal Disclaimer:</strong> Frank is a tool for finding fair exchange rates between peers. We are not a bank, broker, or financial institution. Frank does not hold, transfer, or manage any funds. Any exchange of currency must be conducted independently between consenting users at their own risk.</p>
        <p>&copy; {new Date().getFullYear()} Frank&apos;s Friendly Fixing. All rights reserved.</p>
      </footer>
    </div>
  );
}
