# Borrower Copilot - Rules Engine

This document outlines every rule, threshold, band, and assumption used in the Borrower Copilot decision engine, fulfilling the Lokta Challenge requirement.

## 1. Income Assessment & Haircuts

| Variable / Input | Value | Why (Reasoning) |
| :--- | :--- | :--- |
| **Salaried Income** | 100% of declared | Salaried income with a payslip is highly verifiable and stable. |
| **Self-Employed / Informal (No ITR)** | 70% of declared (30% haircut) | High variance in cash income; borrowers typically overestimate gross vs net. 30% is a standard lender buffer for unverified cashflows. |
| **Self-Employed / Informal (With ITR)** | Max(Declared * 75%, ITR / 12) | ITRs often under-report real cash income for tax purposes. We blend reality (haircut declared) with the documented floor. |

## 2. Fixed Obligation to Income Ratio (FOIR) & Buffers

| Rule | Value | Why (Reasoning) |
| :--- | :--- | :--- |
| **Lender FOIR (Salaried)** | 50% | Industry standard maximum for prime salaried profiles. |
| **Lender FOIR (Self-Emp/Informal)**| 45% | Stricter cap due to income volatility. |
| **Safe Living Buffer (Floor)** | Max(₹8,000, 20% of Income) | Standard formulas allow borrowers to commit 50% of income even if they only earn ₹20k, leaving ₹10k for a whole family. This floor guarantees absolute survival cash. |
| **Missing Expenses Default** | 40% of assessed income | If a borrower skips entering household expenses, we assume 40% to prevent over-leveraging them. |

## 3. The 100-Point Risk Engine

| Modifier | Points | Why (Reasoning) |
| :--- | :--- | :--- |
| **Base Score** | 50 | Neutral starting ground. |
| **Missed Payment (Last 3mo)** | -50 (Hard Stop) | Bouncing payments while applying for new unsecured debt is the definition of a debt trap. Triggers "Don't Borrow". |
| **No Missed Payments** | +20 | Demonstrated recent reliable behavior. |
| **Salaried Employment** | +15 | Highly stable, lowest variance cash flow. |
| **Emergency Savings (≥ 3 mo)** | +10 | Provides a shock absorber for life events (medical, job loss) without defaulting. |
| **Emergency Savings (0 mo)** | -10 | High risk of default on the very next minor life emergency. |
| **Productive Loan Purpose** | +10 | Medical, Education, Business Equipment generate future returns or protect life. |
| **Risky Loan Purpose** | -20 | Speculative, gambling, or standard debt-traps offer no ROI. |
| **Debt-to-Income (DTI) < 20%** | +10 | Low existing leverage. |
| **Debt-to-Income (DTI) > 40%** | -20 | Nearing maximum carrying capacity. |

## 4. Product Routing & Rate Bands

| Scenario / Product | Rate Band | Why (Reasoning) |
| :--- | :--- | :--- |
| **LAP (Loan Against Property)** | 9.0% - 11.5% | Secured by hard asset (LTV assumed safe). Drastically lowers risk premium. |
| **Personal Loan (Prime)** | 10.5% - 12.5% | Unsecured, but borrower has 750+ CIBIL and salaried stability. |
| **Personal Loan (Standard)** | 13.0% - 17.0% | Unsecured, average credit profile or unknown score (priced defensively). |
| **Unsecured Business / Micro** | 18.0% - 24.0% | High-risk, informal/self-employed with no collateral. |
| **Unknown Credit Score Penalty** | +1.5% to +2.0% upper bound | Silence widens the band. Lenders assume the worst if a score isn't verifiable. |

## 5. Confidence, Silence, and Output Ranges

| Rule | Action | Why (Reasoning) |
| :--- | :--- | :--- |
| **Missing ITR** | Widen max loan range by ±15% | Decreased confidence in the base income number. |
| **Missing Expenses** | Widen max loan range by ±10% | Guessing 40% is safe, but inaccurate. Band must reflect uncertainty. |
| **Stress Test** | Income -10%, Rate +2% | "What happens if inflation rises and business slows?" If EMI > living buffer under these conditions, the loan is fragile. |
| **APR Calculation** | Base Rate + (2% / Tenure_Yrs) | Lenders quote nominal rates, but a 2% upfront processing fee mathematically raises the true Annual Percentage Rate (APR). RBI mandates this transparency. |
