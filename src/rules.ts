export const PRODUCTIVE_PURPOSES = new Set(["business", "vehicle_for_income", "education", "medical", "home_improvement"]);
export const RISKY_PURPOSES = new Set(["gambling", "speculative"]);

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
  declared_income: number; // net for salaried, midpoint for others
  itr_income: number | null;
  expenses: number | null;
  existing_emi: number;
  credit_score: number | null;
  missed_payments: boolean;
  savings_months: number | null;
  owns_property: boolean;
  property_value: number | null;
}

export function runAssessment(answers: AssessmentAnswers) {
  const consequences: string[] = [];
  
  // 1. ASSESS INCOME
  let assessedIncome = answers.declared_income;
  let missingItr = false;
  
  if (answers.income_type !== 'salaried') {
    if (answers.itr_income) {
      assessedIncome = Math.max(answers.declared_income * 0.75, answers.itr_income / 12);
    } else {
      assessedIncome = answers.declared_income * 0.70; // 30% haircut
      missingItr = true;
      consequences.push("Because you didn't provide an ITR, we had to heavily discount your self-declared income to match how a bank views risk. Providing an ITR usually increases your eligible amount.");
    }
  }

  // 2. ASSESS EXPENSES & DISPOSABLE INCOME
  let actualExpenses = 0;
  let missingExpenses = false;
  if (answers.expenses !== null) {
    actualExpenses = answers.expenses;
  } else {
    actualExpenses = assessedIncome * 0.40; // Default to 40% if skipped
    missingExpenses = true;
    consequences.push("You skipped entering your household expenses, so we assumed a conservative 40% of your income. Because we are guessing, your safe loan band is much wider. Enter real expenses for a tighter estimate.");
  }

  // 3. THE 100-POINT RISK ENGINE
  let score = 50; // Neutral start
  
  if (answers.missed_payments) {
    score -= 50; // Hard stop
  } else {
    score += 20;
  }
  
  if (answers.income_type === 'salaried') score += 15;
  
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

  score = Math.max(0, Math.min(100, score));

  // 4. ROUTING & RATE BANDING
  let product = "";
  let baseBand: [number, number] = [0, 0];
  let unknownScorePenalty = 0;

  const isLapEligible = answers.owns_property && answers.property_value && answers.property_value > answers.amount_wanted * 1.5;

  if (isLapEligible && answers.income_type !== 'salaried') {
    product = "Loan Against Property (LAP)";
    baseBand = RATE_BANDS.lap;
  } else if (answers.income_type === 'salaried') {
    if (answers.credit_score !== null) {
      if (answers.credit_score >= 750) {
        product = "Personal Loan (Prime)";
        baseBand = RATE_BANDS.personal_prime;
      } else {
        product = "Personal Loan (Standard)";
        baseBand = RATE_BANDS.personal_standard;
      }
    } else {
      // UNKNOWN IS NEVER ZERO
      product = "Personal Loan (Standard)";
      baseBand = RATE_BANDS.personal_standard;
      unknownScorePenalty = 1.5; // Widen the upper band
      consequences.push("You didn't know your credit score, so we modeled standard rates (up to 17%). Consequence: If you actually have a score > 750, you qualify for Prime rates (10.5%), saving you thousands in interest. Check your score.");
    }
  } else {
    product = "Unsecured Business/Personal";
    baseBand = RATE_BANDS.unsecured_business;
    if (answers.credit_score === null) {
      unknownScorePenalty = 2.0;
      consequences.push("Without a known credit score, unsecured business loans price for maximum risk. Check your score before applying.");
    }
  }

  // Calculate specific rate based on score
  const [minRate, maxRate] = baseBand;
  const rateSpread = maxRate - minRate;
  // Score 100 = minRate, Score 0 = maxRate
  let mappedRate = maxRate - ((score / 100) * rateSpread);
  
  // Widen final rate band
  let finalRateMin = Math.max(minRate, mappedRate - 0.5);
  let finalRateMax = Math.min(maxRate + unknownScorePenalty, mappedRate + 1.0 + unknownScorePenalty);

  // 5. CEILINGS (DUAL CALCULATION)
  const lenderFoir = answers.income_type === 'salaried' ? 0.50 : 0.45;
  const lenderAvailableEmi = Math.max(0, (assessedIncome * lenderFoir) - answers.existing_emi);

  // Regional/Living Buffer: Min 8000 OR 20% of income, protecting low-income earners like Anita
  const livingBuffer = Math.max(8000, assessedIncome * 0.20);
  const safeAvailableEmi = Math.max(0, assessedIncome - actualExpenses - answers.existing_emi - livingBuffer);

  const avgRate = (finalRateMin + finalRateMax) / 2;
  const lenderBasePrincipal = principalFromEmi(lenderAvailableEmi, avgRate, answers.tenure_months);
  const safeBasePrincipal = principalFromEmi(safeAvailableEmi, avgRate, answers.tenure_months);

  // Widen principal band based on silence
  let wideningFactor = 0.05; // Base 5% variance
  if (missingItr) wideningFactor += 0.15;
  if (missingExpenses) wideningFactor += 0.10;

  const safeRangeMin = roundTo(safeBasePrincipal * (1 - wideningFactor), 10000);
  const safeRangeMax = roundTo(safeBasePrincipal * (1 + wideningFactor), 10000);
  
  const lenderRangeMin = roundTo(lenderBasePrincipal * (1 - wideningFactor), 10000);
  const lenderRangeMax = roundTo(lenderBasePrincipal * (1 + wideningFactor), 10000);

  // RBI-Style APR (rough approximation: base rate + (processing fee / (tenure/12)))
  // Assuming standard 2% processing fee upfront
  const processingFeePct = 2.0;
  const tenureYears = answers.tenure_months / 12;
  const aprMin = finalRateMin + (processingFeePct / tenureYears);
  const aprMax = finalRateMax + (processingFeePct / tenureYears);

  // 6. STRESS TEST
  const stressedIncome = assessedIncome * 0.90;
  const stressedRate = avgRate + 2.0;
  // The stress test checks if the proposed safe EMI is survivable under worse conditions
  const proposedLoan = Math.min(answers.amount_wanted, safeRangeMax);
  const stressedEmi = emi(proposedLoan, stressedRate, answers.tenure_months);
  const remainingUnderStress = stressedIncome - actualExpenses - answers.existing_emi - stressedEmi;
  const stressHolds = remainingUnderStress >= (livingBuffer * 0.8); // Can survive with 80% of normal buffer

  // 7. VERDICT
  let verdict = "borrow";
  let reason = "";

  if (answers.missed_payments) {
    verdict = "dont_borrow";
    reason = "You missed a payment in the last 3 months. Taking new debt to cover old debt almost always leads to a trap. Stay current for 3 months before borrowing.";
  } else if (score < 30) {
    verdict = "dont_borrow";
    reason = "Your risk score is extremely high due to existing debt levels or loan purpose. A lender will likely reject this, or charge predatory rates.";
  } else if (safeAvailableEmi <= 0) {
    verdict = "dont_borrow";
    reason = "After your living expenses, existing EMI, and a minimal safety buffer, you have ₹0 left. There is no mathematical room for a new loan.";
  } else if (answers.amount_wanted > safeRangeMax) {
    verdict = "borrow_less";
    reason = "The amount you want requires a monthly payment that eats directly into your living expenses and safety buffer. Borrow a smaller amount to stay safe.";
  } else {
    verdict = "borrow";
    reason = "The requested amount fits well within your disposable income and safety buffer.";
  }

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
      text: `If your income drops 10% and rates rise 2%, your EMI becomes ₹${Math.round(stressedEmi).toLocaleString('en-IN')}. You will have ₹${Math.round(remainingUnderStress).toLocaleString('en-IN')} left over for living expenses.`,
      holds: stressHolds
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
