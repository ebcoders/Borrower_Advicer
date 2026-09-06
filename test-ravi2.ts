import { runAssessment } from './src/rules.js';

const ravi = {
  purpose: 'business',
  loan_type_wanted: 'business',
  amount_wanted: 1500000,
  quoted_rate: null,
  tenure_months: 60,
  age: 35,
  income_type: 'informal',
  declared_income: 60000,
  co_applicant_income: 18000,
  co_applicant_salaried: true,
  variable_income_pct: 60,
  years_in_income: 5,
  itr_income: 420000,
  expenses: null,
  existing_emi: null,
  has_predatory_loans: false,
  credit_status: 'ntc' as any,
  credit_score: null,
  missed_payments: false,
  savings_months: null,
  owns_property: true,
  pledge_property: true,
  property_value: 2000000,
};

console.log(JSON.stringify(runAssessment(ravi), null, 2));
