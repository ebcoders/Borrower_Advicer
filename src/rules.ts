export const PRODUCTIVE_PURPOSES = new Set(["business", "vehicle_for_income", "education", "medical", "home_improvement"]);
export const RISKY_PURPOSES = new Set(["gambling", "speculative"]);

// LTV & FOIR Constants (Easy to change during interview)
export const LAP_LTV_CAP = 0.60;
export const LENDER_FOIR_SALARIED = 0.50;
export const LENDER_FOIR_INFORMAL = 0.45;
export const SAFE_FOIR_SALARIED = 0.45;
export const SAFE_FOIR_INFORMAL = 0.40;

export const RATE_BANDS: Record<string, [number, number]> = {
  lap: [9.0, 11.5],
  personal_prime: [10.5, 12.5],
  personal_standard: [13.0, 17.0],
  unsecured_business: [18.0, 24.0]
};

export function emi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function principalFromEmi(emiAmt: number, annualRatePct: number, months: number): number {
  if (emiAmt <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return emiAmt * months;
  return (emiAmt * (Math.pow(1 + r, months) - 1)) / (r * Math.pow(1 + r, months));
}

function roundTo(num: number, step: number) {
  return Math.floor(num / step) * step;
}

export interface AssessmentAnswers {
  purpose: string;
  amount_wanted: number;
  tenure_months: number;
  income_type: string;
  declared_income: number;
  variable_income_pct: number | null; // Replaces flat 30% haircut
  years_in_income: number | null; // Stability modifier
  itr_income: number | null;
  expenses: number | null;
  existing_emi: number;
  credit_status: 'known' | 'unknown' | 'ntc';
  credit_score: number | null;
  missed_payments: boolean;
  savings_months: number | null;
  owns_property: boolean;
  property_value: number | null;
}

function assessIncome(answers: AssessmentAnswers, consequences: string[]) {
  let assessedIncome = answers.declared_income;
  let missingItr = false;
  
  if (answers.income_type !== 'salaried') {
    const haircutPct = answers.variable_income_pct !== null ? (answers.variable_income_pct / 100) : 0.30;
    
    if (answers.itr_income) {
      assessedIncome = Math.max(answers.declared_income * (1 - haircutPct), answers.itr_income / 12);
    } else {
      assessedIncome = answers.declared_income * (1 - haircutPct);
      missingItr = true;
      consequences.push(`Because you didn't provide an ITR, we discounted your income by ${Math.round(haircutPct*100)}% based on your stated irregular income. Providing an ITR increases your eligible amount.`);
    }
  }
  return { assessedIncome, missingItr };
}

function computeScore(answers: AssessmentAnswers, assessedIncome: number, consequences: string[]) {
  let score = 50; 
  
  if (answers.missed_payments) score -= 50; 
  else score += 20;
  
  if (answers.income_type === 'salaried') score += 15;
  
  // New Stability Metric
  if (answers.years_in_income !== null) {
    if (answers.years_in_income >= 5) score += 10;
    else if (answers.years_in_income < 2) score -= 10;
  }

  if (answers.savings_months !== null) {
    if (answers.savings_months >= 3) score += 10;
    else if (answers.savings_months === 0) score -= 10;
  } else {
    consequences.push("We don't know your emergency savings, so we couldn't give you the 'Safety Net' rate discount.");
  }

  if (PRODUCTIVE_PURPOSES.has(answers.purpose)) score += 10;
  if (RISKY_PURPOSES.has(answers.purpose)) score -= 20;

  const dti = assessedIncome > 0 ? answers.existing_emi / assessedIncome : 1;
  if (dti < 0.20) score += 10;
  if (dti > 0.40) score -= 20;

  return Math.max(0, Math.min(100, score));
}

function determineRouting(answers: AssessmentAnswers, score: number, consequences: string[]) {
  let product = "";
  let baseBand: [number, number] = [0, 0];
  let unknownScorePenalty = 0;

  const isLapEligible = answers.owns_property && answers.property_value && answers.property_value > answers.amount_wanted * 1.5;

  if (isLapEligible) {
    product = "Loan Against Property (LAP)";
    baseBand = RATE_BANDS.lap;
  } else if (answers.income_type === 'salaried') {
    if (answers.credit_status === 'known' && answers.credit_score !== null) {
      if (answers.credit_score >= 750) {
        product = "Personal Loan (Prime)";
        baseBand = RATE_BANDS.personal_prime;
      } else {
        product = "Personal Loan (Standard)";
        baseBand = RATE_BANDS.personal_standard;
      }
    } else {
      product = "Personal Loan (Standard)";
      baseBand = RATE_BANDS.personal_standard;
      if (answers.credit_status === 'unknown') {
        unknownScorePenalty = 1.5; 
        consequences.push("You didn't know your credit score, so we modeled standard rates. Check your score—if it is > 750, you qualify for Prime rates (10.5%).");
      } else if (answers.credit_status === 'ntc') {
        unknownScorePenalty = 1.0;
        consequences.push("As a 'New to Credit' borrower, you will be priced higher until you build a credit history.");
      }
    }
  } else {
    product = "Unsecured Business/Personal";
    baseBand = RATE_BANDS.unsecured_business;
    if (answers.credit_status !== 'known') {
      unknownScorePenalty = 2.0;
      consequences.push("Without a known credit score, unsecured business loans price for maximum risk.");
    }
  }

  const [minRate, maxRate] = baseBand;
  const rateSpread = maxRate - minRate;
  let mappedRate = maxRate - ((score / 100) * rateSpread);
  
  return {
    product,
    finalRateMin: Math.max(minRate, mappedRate - 0.5),
    finalRateMax: Math.min(maxRate + unknownScorePenalty, mappedRate + 1.0 + unknownScorePenalty)
  };
}

export function runAssessment(answers: AssessmentAnswers) {
  const consequences: string[] = [];
  
  // 1. Income
  const { assessedIncome, missingItr } = assessIncome(answers, consequences);

  // 2. Expenses & Silence Penalty
  let actualExpenses = 0;
  let missingExpenses = false;
  if (answers.expenses !== null) {
    actualExpenses = answers.expenses;
  } else {
    actualExpenses = assessedIncome * 0.40;
    missingExpenses = true;
    consequences.push("You skipped entering household expenses, so we assumed a conservative 40% of your income. This widens your estimate band.");
  }

  // 3. Score & Routing
  const score = computeScore(answers, assessedIncome, consequences);
  const { product, finalRateMin, finalRateMax } = determineRouting(answers, score, consequences);
  const avgRate = (finalRateMin + finalRateMax) / 2;

  // 4. CEILINGS (FIXED: Safe FOIR + LTV applied)
  const lenderFoir = answers.income_type === 'salaried' ? LENDER_FOIR_SALARIED : LENDER_FOIR_INFORMAL;
  const safeFoir = answers.income_type === 'salaried' ? SAFE_FOIR_SALARIED : SAFE_FOIR_INFORMAL;
  
  const lenderAvailableEmi = Math.max(0, (assessedIncome * lenderFoir) - answers.existing_emi);
  
  const maxFoirSafeEmi = (assessedIncome * safeFoir) - answers.existing_emi;
  const livingBuffer = Math.max(8000, assessedIncome * 0.20);
  const maxCashflowSafeEmi = assessedIncome - actualExpenses - answers.existing_emi - livingBuffer;
  const safeAvailableEmi = Math.max(0, Math.min(maxFoirSafeEmi, maxCashflowSafeEmi));

  let lenderBasePrincipal = principalFromEmi(lenderAvailableEmi, avgRate, answers.tenure_months);
  let safeBasePrincipal = principalFromEmi(safeAvailableEmi, avgRate, answers.tenure_months);

  // LTV BINDING (Fix #3)
  let ltvCeiling = Infinity;
  if (product === "Loan Against Property (LAP)" && answers.property_value) {
    ltvCeiling = answers.property_value * LAP_LTV_CAP;
    lenderBasePrincipal = Math.min(lenderBasePrincipal, ltvCeiling);
    safeBasePrincipal = Math.min(safeBasePrincipal, ltvCeiling);
  }

  // 5. STRESS TEST (FIXED: Now Binding, Fix #2)
  const stressedIncome = assessedIncome * 0.90;
  const stressedRate = avgRate + 2.0;
  
  const maxStressedFoirEmi = (stressedIncome * safeFoir) - answers.existing_emi;
  const maxStressedCashflowEmi = stressedIncome - actualExpenses - answers.existing_emi - livingBuffer;
  const safeStressedEmi = Math.max(0, Math.min(maxStressedFoirEmi, maxStressedCashflowEmi));
  
  let safeStressedPrincipal = principalFromEmi(safeStressedEmi, stressedRate, answers.tenure_months);
  if (product === "Loan Against Property (LAP)") safeStressedPrincipal = Math.min(safeStressedPrincipal, ltvCeiling);

  // The actual safe principal must survive the stress test
  const finalSafePrincipal = Math.min(safeBasePrincipal, safeStressedPrincipal);

  // Silence widening
  let wideningFactor = 0.05;
  if (missingItr) wideningFactor += 0.15;
  if (missingExpenses) wideningFactor += 0.10;

  const safeRangeMin = roundTo(finalSafePrincipal * (1 - wideningFactor), 10000);
  const safeRangeMax = roundTo(finalSafePrincipal * (1 + wideningFactor), 10000);
  
  const lenderRangeMin = roundTo(lenderBasePrincipal * (1 - wideningFactor), 10000);
  const lenderRangeMax = roundTo(lenderBasePrincipal * (1 + wideningFactor), 10000);

  // APR
  const processingFeePct = 2.0;
  const tenureYears = answers.tenure_months / 12;
  const aprMin = finalRateMin + (processingFeePct / tenureYears);
  const aprMax = finalRateMax + (processingFeePct / tenureYears);

  // 7. VERDICT
  let verdict = "borrow";
  let reason = "";

  if (answers.missed_payments) {
    verdict = "dont_borrow";
    reason = "You missed a payment in the last 3 months. Taking new debt to cover old debt almost always leads to a trap. Stay current for 3 months before borrowing.";
  } else if (score < 30) {
    verdict = "dont_borrow";
    reason = "Your risk score is extremely high due to existing debt levels or loan purpose. A lender will likely reject this, or charge predatory rates.";
  } else if (safeAvailableEmi <= 0 || safeStressedEmi <= 0) {
    verdict = "dont_borrow";
    reason = "After your living expenses, existing EMI, and a minimal safety buffer, there is no mathematical room for a new loan—especially if your income drops even slightly.";
  } else if (answers.amount_wanted > safeRangeMax) {
    verdict = "borrow_less";
    reason = `The amount you want (₹${answers.amount_wanted.toLocaleString('en-IN')}) exceeds what you can survive under a stress test (₹${safeRangeMax.toLocaleString('en-IN')}). Borrow a smaller amount to stay safe.`;
  } else {
    verdict = "borrow";
    reason = "The requested amount fits well within your disposable income and survives our macroeconomic stress test.";
  }

  const proposedLoan = Math.min(answers.amount_wanted, safeRangeMax);
  const stressedEmiOnProposed = emi(proposedLoan, stressedRate, answers.tenure_months);
  const remainingUnderStress = stressedIncome - actualExpenses - answers.existing_emi - stressedEmiOnProposed;

  return {
    verdict,
    verdict_reason: reason,
    product_route: product,
    fair_rate_band: [finalRateMin, finalRateMax],
    apr_band: [aprMin, aprMax],
    safe_carry_range: [Math.max(0, safeRangeMin), safeRangeMax],
    lender_sanction_range: [Math.max(0, lenderRangeMin), lenderRangeMax],
    consequences,
    score,
    stress_test: {
      text: `Stress Test: If income drops 10% and rates rise 2%, your EMI becomes ₹${Math.round(stressedEmiOnProposed).toLocaleString('en-IN')}. You will have ₹${Math.round(remainingUnderStress).toLocaleString('en-IN')} left over for living expenses.`,
      holds: remainingUnderStress > 0
    },
    negotiation_card: {
      recommended_amount: Math.min(answers.amount_wanted, safeRangeMax),
      fair_rate: `${finalRateMin.toFixed(1)}% - ${finalRateMax.toFixed(1)}%`,
      apr_note: `True APR is ~${aprMin.toFixed(1)}% - ${aprMax.toFixed(1)}% (assuming 2% processing fee)`,
      max_emi: Math.round(safeAvailableEmi),
      ask: [
        "Is the interest rate reducing-balance or flat-rate?",
        "What is the exact processing fee %?",
        "Are there pre-payment penalties if I clear it early?"
      ],
      reject: [
        `An EMI higher than ₹${Math.round(safeAvailableEmi).toLocaleString('en-IN')}`,
        `A rate higher than ${(finalRateMax + 1.0).toFixed(1)}%`,
        "Any upfront fees not deducted from the principal"
      ]
    }
  };
}
