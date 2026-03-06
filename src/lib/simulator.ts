const DEFAULT_INTERBANK_RATE_CHF_PER_EUR = 0.95;
const DEFAULT_BANK_SPREAD_PERCENT = 1.5;
const DEFAULT_FELIX_AMOUNT_CHF = 1000;
const DEFAULT_FELIX_FIXED_FEE_CHF = 5;
const DEFAULT_FLORA_FIXED_FEE_EUR = 5;

export function getSafeInitialFrankRate(initialFrankRateChfPerEur?: number) {
  if (!initialFrankRateChfPerEur || initialFrankRateChfPerEur <= 0) {
    return DEFAULT_INTERBANK_RATE_CHF_PER_EUR;
  }

  return initialFrankRateChfPerEur;
}

export function calculateDefaultAnnualLossChf(initialFrankRateChfPerEur?: number) {
  const safeRate = getSafeInitialFrankRate(initialFrankRateChfPerEur);
  const defaultFelixBankRate = safeRate * (1 + DEFAULT_BANK_SPREAD_PERCENT / 100);
  const defaultFloraBankRate = safeRate * (1 - DEFAULT_BANK_SPREAD_PERCENT / 100);
  const defaultFloraAmountEur = DEFAULT_FELIX_AMOUNT_CHF / safeRate;

  // Felix (CHF -> EUR) loss converted back to CHF.
  const frankEurForFelix = DEFAULT_FELIX_AMOUNT_CHF / safeRate;
  const bankEurForFelix =
    (DEFAULT_FELIX_AMOUNT_CHF - DEFAULT_FELIX_FIXED_FEE_CHF) * (1 / defaultFelixBankRate);
  const bankLossFelixChf = Math.max(0, frankEurForFelix - bankEurForFelix) * safeRate;

  // Flora (EUR -> CHF) loss already in CHF.
  const frankChfForFlora = defaultFloraAmountEur * safeRate;
  const bankChfForFlora =
    (defaultFloraAmountEur - DEFAULT_FLORA_FIXED_FEE_EUR) * defaultFloraBankRate;
  const bankLossFloraChf = Math.max(0, frankChfForFlora - bankChfForFlora);

  const totalLossChf = bankLossFelixChf + bankLossFloraChf;
  return totalLossChf * 12;
}

