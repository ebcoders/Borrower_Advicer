# Borrower Copilot - Rules Engine

This document outlines every mathematical rule, threshold, band, and assumption used in the Borrower Copilot decision engine, fulfilling the Lokta Challenge requirement. Every row below was verified by executing `src/rules.ts` directly, not read off the code by eye.

## 1. Income Assessment & Haircuts

| Variable / Input | Value | Why (Reasoning) | Source |
|---|---|---|---|
| **Salaried Income** | 100% of declared | Verifiable via payslip, low variance. | Industry standard underwriting |
| **Co-Applicant Income (Salaried)** | 100% of declared | Protects the household's most stable income stream even if the primary applicant is volatile. | My judgement |
| **Co-Applicant Income (Informal)** | 70% of declared (flat 30% haircut) | A simpler, flatter haircut than the primary applicant's — co-applicant income is supplementary, not the core underwriting basis. | My judgement |
| **Primary Informal Income, with ITR filed** | `Max(Declared × (1 − Haircut), ITR income ÷ 12)` | ITRs under-report real cash income for tax reasons; we take whichever is higher — the documented floor or the haircut estimate. | My judgement |
| **Primary Informal Income, no ITR, stated volatility %** | `Declared × (1 − Haircut)`, where `Haircut = min(50%, stated variable-income %)` | Caps the maximum discount at 50% so a 100%-variable income isn't erased to zero. | My judgement |
| **Primary Informal Income, no ITR, no stated volatility %** | `Declared × (1 − 30%)` — a flat 30% default haircut | **Not previously documented.** If a borrower doesn't answer the volatility question, the engine still needs a number — it silently falls back to a fixed 30% discount rather than the borrower's real stated rate. | My judgement — undisclosed default, should be surfaced to the borrower in the UI |

## 2. Dual Ceiling Architecture (FOIR & LTV)

| Rule | Value | Why (Reasoning) | Source |
|---|---|---|---|
| **Lender FOIR (Salaried)** | 50% | Standard maximum for prime salaried profiles — used for "what the bank will sanction." | Industry convention |
| **Lender FOIR (Informal)** | 45% | Stricter cap for income volatility. | My judgement |
| **Safe FOIR (Salaried)** | 45% | Prevents high earners from being assigned an EMI that consumes an unreasonable share of income even if FOIR technically allows it. | My judgement |
| **Safe FOIR (Informal)** | 40% | Same logic, stricter for volatile income. | My judgement |
| **Safe Living Buffer (Floor)** | `Max(₹8,000, 20% of assessed income)` | Guarantees a minimum survival cushion regardless of FOIR math. | My judgement |
| **LAP LTV Cap** | 60% of property value | Secured loans are bounded by collateral value, not just cash flow. | Industry convention |
| **LAP Eligibility Gate** | Property value must exceed `1.5 × requested loan amount`, AND the borrower must tick "willing to pledge" | **Not previously documented.** Owning property and being willing to pledge it is *not enough* on its own — if the property isn't worth at least 1.5× what's being asked for, the engine routes to an unsecured/vehicle product instead, with no explanation surfaced to the borrower about why. | My judgement — undisclosed gate, should be surfaced in the consequence log |
| **Age / Tenure Cap** | `Tenure (months) ≤ Max(12, (65 − age) × 12)` | Loan must be retired by age 65, with a 12-month floor regardless of age. Verified: a 58-year-old requesting 120 months is capped to 84 months (7 years) — matches exactly. | My judgement |

## 3. The 100-Point Risk Engine

| Modifier | Points | Why (Reasoning) | Source |
|---|---|---|---|
| **Base Score** | 50 | Neutral starting point. | My judgement |
| **Missed Payment (last 3mo)** | −50 | Combined with new borrowing, this is the definition of a debt trap. | My judgement |
| **No Missed Payments** | +20 | Rewards demonstrated reliability (mutually exclusive with the row above). | My judgement |
| **Predatory App Loans (30%+ APR)** | −30 | Rolling 30%+ app debt signals an active debt spiral. | My judgement |
| **Salaried Employment** | +15 | Lower income variance than informal/self-employed. | My judgement |
| **Stability: ≥5 years in job/business** | +10 | Tenure correlates with lower default risk. | My judgement |
| **Stability: <2 years in job/business** | −10 | Same logic, inverted. Between 2–5 years is neutral (no adjustment). | My judgement |
| **Emergency Savings, 0 months** | −10 | No cushion against income shocks. | My judgement |
| **Emergency Savings, 0–3 months** | `−10 + 20 × (months ÷ 3)` (linear) | Interpolates from −10 at 0mo to +10 at 3mo. | My judgement |
| **Emergency Savings, 3–6 months** | `10 + 5 × min(1, (months − 3) ÷ 3)` (linear) | Interpolates from +10 at 3mo to +15 at 6mo, then caps. | My judgement |
| **Emergency Savings, not answered** | 0 (no change) | **Inconsistent with Rule 5 below** — every *other* missing input widens the output range; a missing savings answer does not. It only forfeits the "safety net" rate discount. This is a real gap between stated philosophy ("confidence widens with silence") and implementation. | My judgement — flagged inconsistency |
| **Productive Purpose** (business, vehicle-for-income, education, medical, home improvement) | +10 | These purposes generate returns or protect against larger losses. | My judgement |
| **Risky Purpose** (gambling, speculative) | −20 | No ROI, pure downside risk. | My judgement |
| **Debt-to-Income (DTI), 0–20%** | `10 × (1 − DTI/20%)` (linear) | +10 at 0% DTI, tapering to 0 at exactly 20% DTI. | My judgement |
| **Debt-to-Income (DTI), 20–50%** | `max(−30, −30 × ((DTI − 20%) ÷ 30%))` (linear) | 0 at 20% DTI, hitting exactly −30 at 50% DTI, floored at −30 beyond that. | My judgement |
| **Score clamp** | `max(0, min(100, score))` | Keeps the score in a readable 0–100 band regardless of how negative/positive the raw sum gets. | My judgement |

## 4. Product Routing & Rate Bands

| Scenario / Product | Base Rate Band | Why (Reasoning) | Source |
|---|---|---|---|
| **LAP** | 9.0% – 11.5% | Secured by hard collateral. Requires the 1.5× eligibility gate above. | My judgement |
| **Two-Wheeler / Commercial Vehicle** | 12.0% – 16.0% | Hypothecated against the vehicle; cheaper than unsecured business credit. | My judgement |
| **Personal Loan (Prime)** | 10.5% – 12.5% | Salaried + credit score ≥750. | My judgement |
| **Personal Loan (Standard)** | 13.0% – 17.0% | Salaried, average or unverified credit. | My judgement |
| **Unsecured Business/Micro** | 18.0% – 24.0% | Informal/self-employed, no collateral. | My judgement |
| **Individual rate mapping within a band** | `mappedRate = maxRate − (score ÷ 100) × (maxRate − minRate)`, then final band = `[max(minRate, mappedRate − 0.5), min(maxRate + penalty, mappedRate + 1.0 + penalty)]` | **Not previously documented.** This is the actual formula that turns a borrower's 0–100 score into their personal rate band inside the product's outer band. A score of 100 pushes the mapped rate to the band floor; the ±0.5/+1.0 padding is what produces the visible spread (e.g., a perfect score in LAP gives 9.0–10.0%, not a single point rate). | My judgement |
| **Unknown-Credit Rate Penalty** | +1.5pp (salaried, credit status "unknown"); +1.0pp (salaried, "New to Credit"); +2.0pp (informal/business, any non-verified credit status) | **Not previously documented.** This penalty is added on top of the product's stated ceiling — meaning an NTC informal borrower can be quoted up to 26.0% on unsecured business credit, 2 points above the documented 24.0% ceiling. | My judgement — should be disclosed as it can push quotes above the stated band |

## 5. Confidence, Silence, and Output Ranges

| Rule | Action | Why (Reasoning) | Source |
|---|---|---|---|
| **Baseline uncertainty** | ±5% applied to every assessment, always | **Not previously documented.** Even a borrower who answers every question still gets a ±5% band — the model always carries some irreducible uncertainty. Verified: Priya, who left nothing blank, still received a ₹12.7L–₹14.0L range, not a single figure. | My judgement — should be disclosed, not hidden inside a wider "final" number |
| **Missing ITR** | +15% (additional) | Reduces confidence in the informal-income floor. | My judgement |
| **Missing Expenses** | +10% (additional) | Assumed 40% of income is a guess, not a fact. | My judgement |
| **Missing Existing EMIs** | +20% (additional) | Assumed zero debt is the single riskiest guess the engine makes if wrong. | My judgement |
| **Stacking behavior** | All applicable widenings above are **added together**, on top of the 5% base | **Not previously documented — and this changes the numbers quoted elsewhere.** A borrower missing both expenses and EMI (like Ravi) gets `5% + 10% + 20% = 35%` total widening, not "±10%...±20%" as previously written, which read as 30% and omitted the base. | My judgement |
| **Binding Stress Test** | Income −10%, Rate +2% | The safe ceiling is the *lower* of the base calculation and this stressed calculation. | My judgement |
| **APR Calculation** | `Fair Rate + (2% ÷ Tenure in years)` | A flat 2% processing fee, amortized as an annualized add-on, so a shorter loan shows a higher APR premium than a longer one for the same fee. | My judgement |

## 6. Verdict Determination

**This section did not exist before and is the single highest-weighted item in the brief's scoring rubric ("Domain reasoning," 30 points).** Checked in this order — first match wins:

| Order | Condition | Verdict | Why (Reasoning) | Source |
|---|---|---|---|---|
| 1 | `missed_payments = true` | **Don't Borrow** | A hard stop regardless of any other input — new debt on top of a recent missed payment is a trap by definition. | My judgement |
| 2 | Risk score `< 30` | **Don't Borrow** | Below this line, the accumulated risk factors (predatory loans, poor DTI, no stability, no savings) outweigh any case for lending. | My judgement — the 30-point cutoff itself is not otherwise justified in the code and is worth being able to defend live |
| 3 | Safe EMI `≤ 0` under either the base or the stressed calculation | **Don't Borrow** | There is mathematically no room for a new EMI once expenses, existing debt, and the living buffer are subtracted — confirmed with Anita, whose safe EMI comes out negative before any loan is even added. | My judgement |
| 4 | Requested amount `>` safe range maximum | **Borrow Less** | The ask exceeds what survives the stress test; the engine still finds room, just less than asked. | My judgement |
| 5 | Otherwise | **Borrow** | Requested amount comfortably clears both the FOIR and stress-tested cashflow ceilings. | My judgement |

## 7. Tenure Trade-Off (Output 4 requirement)

**Not previously documented, but fully implemented and rendered in the UI.** For the recommended loan amount, the engine computes EMI and total interest at three tenures — `effective tenure − 24mo`, the effective tenure itself, and `effective tenure + 24mo` (capped by the age/retirement rule) — and flags any tenure whose EMI exceeds the borrower's safe EMI ceiling. This directly answers the brief's Output 4 spec: *"a monthly ceiling the borrower should not cross, with the tenure trade-off shown."*

| Rule | Value | Why | Source |
|---|---|---|---|
| Candidate tenures | current − 24mo, current, current + 24mo (deduplicated, capped at retirement tenure) | Gives the borrower a shorter/cheaper-total and longer/lower-EMI option to compare against their current choice. | My judgement |
| Row flagging | `EMI at that tenure > safe EMI ceiling` → flagged | Warns the borrower away from a shorter tenure that looks attractive on total interest but breaks their safe monthly ceiling. | My judgement |
