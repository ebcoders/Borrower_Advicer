import { runAssessment, AssessmentAnswers } from './src/rules.js'; // Assumes esm/ts-node

const priya: AssessmentAnswers = {
  purpose: 'wedding',
  loan_type_wanted: 'personal',
  amount_wanted: 800000,
  quoted_rate: 14.0, // Shows she is overpaying vs fair rate
  tenure_months: 60,
  age: 29,
  income_type: 'salaried',
  declared_income: 110000,
  co_applicant_income: null,
  co_applicant_salaried: false,
  variable_income_pct: null,
  years_in_income: 5,
  itr_income: null,
  expenses: 28000,
  existing_emi: 14000,
  has_predatory_loans: false,
  credit_status: 'known',
  credit_score: 780,
  missed_payments: false,
  savings_months: 3,
  owns_property: false,
  pledge_property: false,
  property_value: null
};

const ravi: AssessmentAnswers = {
  purpose: 'business',
  loan_type_wanted: 'business',
  amount_wanted: 1500000,
  quoted_rate: null,
  tenure_months: 60, // Assumed 5 years
  age: 42,
  income_type: 'informal',
  declared_income: 60000, // Midpoint of 40-80k
  co_applicant_income: 18000, // Wife's teaching salary
  co_applicant_salaried: true, // IMPORTANT FIX: Do not haircut the wife's salary
  variable_income_pct: 60, // Assumed volatility of small business
  years_in_income: 10,
  itr_income: 420000, // 35,000/mo
  expenses: null, // Left blank to trigger silence penalty
  existing_emi: null, // Left blank to trigger silence penalty
  has_predatory_loans: false,
  credit_status: 'ntc', // Never taken a formal loan
  credit_score: null,
  missed_payments: false,
  savings_months: null,
  owns_property: true,
  pledge_property: true, // Assumed he is willing to pledge his home for a better rate
  property_value: 4500000 
};

const anita: AssessmentAnswers = {
  purpose: 'vehicle_for_income', // Electric Scooter
  loan_type_wanted: 'auto',
  amount_wanted: 150000,
  quoted_rate: null,
  tenure_months: 24, // Assumed typical 2-wheeler tenure
  age: 35,
  income_type: 'informal',
  declared_income: 28000,
  co_applicant_income: null,
  co_applicant_salaried: false,
  variable_income_pct: 100, // Extreme volatility
  years_in_income: 1, // Assumed new delivery gig
  itr_income: null,
  expenses: 14000, // Assumed 50%
  existing_emi: 6354, // "Pay off a total of ₹35k on 3 apps" - modeled as monthly EMI constraint
  has_predatory_loans: true, // Trigger 30%+ app loan penalty
  credit_status: 'unknown', // Informal, no formal credit score mentioned
  credit_score: null,
  missed_payments: false, 
  savings_months: 0, // Modeled as no savings
  owns_property: false,
  pledge_property: false,
  property_value: null
};

console.log("=== PRIYA ===");
console.log(JSON.stringify(runAssessment(priya), null, 2));

console.log("\n=== RAVI ===");
console.log(JSON.stringify(runAssessment(ravi), null, 2));

console.log("\n=== ANITA ===");
console.log(JSON.stringify(runAssessment(anita), null, 2));
