import { fetchFrankfurterRate } from "@/lib/rates";

// Fetch the real market rate (ECB reference)
async function getExchangeRate() {
    const result = await fetchFrankfurterRate("EUR", "CHF");
    return result?.rate ?? null;
}

export async function SpreadComparison() {
    const rate = await getExchangeRate();
    const amountChf = 1000;

    if (!rate) return null;

    // Calculs de comparaison (pour 1000 CHF)
    const midMarketEur = amountChf / rate;

    // Hypothèses de marges bancaires: 1.5% de spread + frais fixes
    const bankSpreadFactor = 0.015;
    const bankFixedFeeEur = 5;

    // Acheter des CHF (la banque donne moins de CHF pour 1 EUR)
    const bankRateBuyChf = rate * (1 - bankSpreadFactor);
    const bankCostEur = (amountChf / bankRateBuyChf) + bankFixedFeeEur;

    // Vendre des CHF (la banque demande plus de CHF pour 1 EUR)
    const bankRateSellChf = rate * (1 + bankSpreadFactor);
    const bankYieldEur = (amountChf / bankRateSellChf) - bankFixedFeeEur;

    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 my-8 text-left shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Le coût réel du change
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                Montants en Euros (EUR) pour l'achat ou la vente de <strong className="text-slate-700 dark:text-slate-300">1 000 CHF</strong>.<br />
                Taux interbancaire actuel de référence : <strong>1 EUR = {rate.toFixed(4)} CHF</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                {/* Acheter */}
                <div>
                    <h3 className="text-[15px] font-medium text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        Acheter 1 000 CHF
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Via une banque*</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vous payez ~ {bankCostEur.toFixed(2)} €</span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic">inclut marge et frais</p>
                        </div>

                        <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className="text-sm font-semibold text-frank-red dark:text-red-400">Franc Pair-à-pair</span>
                                <span className="text-sm font-semibold text-frank-red dark:text-red-400">Vous payez {midMarketEur.toFixed(2)} €</span>
                            </div>
                            <p className="text-xs text-frank-red/70 dark:text-red-400/70">taux réel, sans marge</p>
                        </div>
                    </div>
                </div>

                {/* Vendre */}
                <div>
                    <h3 className="text-[15px] font-medium text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        Vendre 1 000 CHF
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Via une banque*</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vous touchez ~ {bankYieldEur.toFixed(2)} €</span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic">déduit de marge et frais</p>
                        </div>

                        <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className="text-sm font-semibold text-frank-blue dark:text-blue-400">Franc Pair-à-pair</span>
                                <span className="text-sm font-semibold text-frank-blue dark:text-blue-400">Vous touchez {midMarketEur.toFixed(2)} €</span>
                            </div>
                            <p className="text-xs text-frank-blue/70 dark:text-blue-400/70">taux réel, sans marge</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                    * Les montants bancaires sont des estimations illustratives (marge de change estimée à 1.5% et 5€ de frais de dossier). Chaque établissement applique sa propre grille tarifaire. Dans l'échange pair-à-pair, il n'y a pas d'intermédiaire financier, le prix d'achat et le prix de vente sont strictement identiques.
                </p>
            </div>
        </div>
    );
}

// Fallback component while loading
export function SpreadComparisonSkeleton() {
    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 my-8 text-left shadow-sm animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                {[1, 2].map((i) => (
                    <div key={i}>
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-4"></div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                                </div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                            </div>
                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                <div className="flex justify-between mb-2">
                                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3"></div>
                                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3"></div>
                                </div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
            </div>
        </div>
    );
}
