# Borrower Copilot - Rules Engine

This document outlines every mathematical rule, threshold, band, and assumption used in the Borrower Copilot decision engine, fulfilling the Lokta Challenge requirement.

## 1. Income Assessment & Haircuts

| Variable / Input | Value | Why (Reasoning) |
| :--- | :--- | :--- |
| **Salaried Income** | 100% of declared | Salaried income with a payslip is highly verifiable and stable. |
| **Self-Employed / Informal (No ITR)** | Declared * (1 - Variable%) | Dynamic. Replaces generic haircuts with the borrower's stated reality of how much of their income is volatile. |
| **Self-Employed / Informal (With ITR)** | Max(Haircut Declared, ITR/12) | ITRs often under-report real cash income for tax purposes. We blend the documented floor with the haircut reality. |

## 2. Dual Ceiling Architecture (FOIR & LTV)

| Rule | Value | Why (Reasoning) |
| :--- | :--- | :--- |
| **Lender FOIR (Salaried)** | 50% | Industry standard maximum for prime salaried profiles. Used to compute "What the bank will sanction." |
| **Lender FOIR (Informal)**| 45% | Stricter cap due to income volatility. |
| **Safe FOIR** | 45% (Sal), 40% (Inf) | *Critical Fix:* Prevents high-income earners from being assigned absurd safe EMIs (e.g. 80% of income) if their expenses are low. |
| **Safe Living Buffer (Floor)** | Max(₹8,000, 20% of Income) | Protects low-income earners. A 50% FOIR on a ₹20k income leaves just ₹10k for survival. This floor guarantees absolute survival cash. |
| **LAP LTV Cap** | 60% | *Critical Fix:* Secured loans must be bounded by collateral value, not just FOIR. If the collateral is ₹40L, the absolute ceiling for the loan is ₹24L, even if their income supports ₹50L. |

## 3. The 100-Point Risk Engine

| Modifier | Points | Why (Reasoning) |
| :--- | :--- | :--- |
| **Base Score** | 50 | Neutral starting ground. |
| **Missed Payment (Last 3mo)** | -50 (Hard Stop) | Bouncing payments while applying for new unsecured debt is the definition of a debt trap. |
| **No Missed Payments** | +20 | Demonstrated recent reliable behavior. |
| **Salaried Employment** | +15 | Highly stable, lowest variance cash flow. |
| **Stability (>5 yrs vs <2 yrs)** | +10 / -10 | Time in current job/business heavily correlates with future default risk. |
| **Emergency Savings (≥ 3 mo)** | +10 / -10 (for 0) | Provides a shock absorber for life events. |
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
| **"New To Credit" (NTC)** | +1.0% bound | NTC borrowers are priced higher due to thin-file risk. |
| **"Unknown Credit" Penalty** | +1.5% - +2.0% bound | Silence widens the band. Lenders assume the worst if a score isn't verifiable. |

## 5. Confidence, Silence, and Output Ranges

| Rule | Action | Why (Reasoning) |
| :--- | :--- | :--- |
| **Missing ITR** | Widen safe range by ±15% | Decreased confidence in the base income number. |
| **Missing Expenses** | Widen safe range by ±10% | Guessing 40% is safe, but inaccurate. Band must reflect uncertainty. |
| **Binding Stress Test** | Income -10%, Rate +2% | *Critical Fix:* The maximum safe loan is explicitly capped by whatever survives this stress test without breaching the living buffer. |
| **APR Calculation** | Base Rate + (2% / Tenure_Yrs) | Lenders quote nominal rates, but a 2% upfront processing fee mathematically raises the true APR. |
