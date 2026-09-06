import { runAssessment, AssessmentAnswers } from './src/rules.js';

const priya: AssessmentAnswers = {
  purpose: 'medical', loan_type_wanted: 'Personal Loan', amount_wanted: 800000, tenure_months: 60, age: 29,
  income_type: 'salaried', declared_income: 110000, co_applicant_income: null, variable_income_pct: null,
  years_in_income: 4, itr_income: null, expenses: 28000, existing_emi: 14000,
  credit_status: 'known', credit_score: 780, missed_payments: false, savings_months: 4,
  owns_property: false, property_value: null
};

const ravi: AssessmentAnswers = {
  purpose: 'business', loan_type_wanted: 'Business Loan', amount_wanted: 1500000, tenure_months: 60, age: 42,
  income_type: 'self_employed', declared_income: 120000, co_applicant_income: null, variable_income_pct: 60,
  years_in_income: 6, itr_income: null, expenses: null, existing_emi: null,
  credit_status: 'unknown', credit_score: null, missed_payments: false, savings_months: 1,
  owns_property: true, property_value: 4500000
};

const anita: AssessmentAnswers = {
  purpose: 'education', loan_type_wanted: 'Personal Loan', amount_wanted: 150000, tenure_months: 24, age: 35,
  income_type: 'informal', declared_income: 28000, co_applicant_income: null, variable_income_pct: 100,
  years_in_income: 2, itr_income: null, expenses: 14000, existing_emi: 6354,
  credit_status: 'known', credit_score: 620, missed_payments: true, savings_months: 0,
  owns_property: false, property_value: null
};

console.log("=== PRIYA (Prime Salaried) ===");
console.log(runAssessment(priya).verdict, "| Rate:", runAssessment(priya).fair_rate_band);

console.log("\n=== RAVI (LAP Routing, Missing EMI Silence Penalty) ===");
const rRes = runAssessment(ravi);
console.log(rRes.verdict, "| Route:", rRes.product_route, "| Requested:", rRes.product_requested);
console.log("Consequences:", rRes.consequences.find(c => c.includes("existing EMI")));

console.log("\n=== ANITA (Informal, Missed Payments) ===");
console.log(runAssessment(anita).verdict);
