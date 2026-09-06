# Persona Run-Throughs

The following run-throughs demonstrate how the Borrower Copilot mathematically handles the three personas outlined in the Lokta Challenge brief. These are based on exact outputs from `test-suite.ts`.

## 1. Priya (Prime Salaried, Overpaying)
*   **Brief Data:** ₹1.1L/mo salaried, 5 years at job, ₹28k expenses, ₹14k existing EMI. Wants ₹8L for a wedding. 780 Credit Score. 
*   **Assumptions Made:** 60-month tenure. We gave her a "Quoted Rate" of 14% to demonstrate the negotiation feature.
*   **Engine Reaction:** 
    *   **Score:** 100/100 (Salaried +15, >5 years +10, Savings +10). (Wedding purpose now neutral 0 points).
    *   **Routing:** Personal Loan (Prime).
    *   **Dual-Ceiling:** The bank would sanction up to ₹19.8L (FOIR limit). However, her Safe Carry limit is slightly lower (₹14.0L) based on preserving her cashflow buffers under a stress test. Both easily clear her requested ₹8L.
*   **Verdict:** `borrow` (Safe to Borrow)
*   **Negotiation Card:** 
    *   "The lender quoted you 14%. This is higher than our fair band (10.5% - 11.5%). You are overpaying and should negotiate."
    *   Recommends walking away from a rate higher than 12.5%.

## 2. Ravi (Asset Rich, Missing Info, Co-Applicant)
*   **Brief Data:** ₹40k-80k income (modeled as ₹60k midpoint). Wife earns ₹18k (salaried teaching). ITR shows ₹4.2L. Owns a ₹45L house unencumbered. Never taken a formal loan (NTC). Wants ₹15L.
*   **Assumptions Made:** 60-month tenure. Left his expenses and existing EMIs *blank*. Modeled his willingness to pledge property as `true`. Modeled his business income volatility as 60%.
*   **Engine Reaction:** 
    *   **Co-Applicant Fix:** The engine correctly protects his wife's ₹18k salary from being discounted. Only Ravi's ₹60k is haircut. Because his ITR shows ₹35k/mo, the engine uses the ITR floor (`Max(₹24k haircut, ₹35k ITR) = ₹35k`). Total assessed income = ₹53,000.
    *   **Silence Penalties:** Because Ravi didn't answer Expenses or Existing EMIs, the engine assumes 40% expenses and 0 EMIs, but **drastically widens the confidence band** (`±10%` for missing expenses, `±20%` for missing EMI).
    *   **Consequence Log:** "You didn't confirm your existing EMIs. We assumed zero debt, but if you actually have debt, your real eligibility is significantly lower."
    *   **Dual-Ceiling:** The bank would sanction him up to ₹15.3L based on his assets and ITR. However, because of the massive uncertainty widening and his living floor requirements, his Safe Carry limit drops to ₹9.7L under stress test conditions.
*   **Verdict:** `borrow_less` (Borrow Less)
*   **Outcome:** The engine tells Ravi he can only safely survive a ₹9.7L loan, not ₹15L. It routes him to a LAP (9.0% - 10.0%) to keep his monthly payments as low as possible.

## 3. Anita (Informal Debt Trap)
*   **Brief Data:** ₹28k/mo (informal). Wants an electric scooter (₹1.5L) to double her delivery runs. Currently has ₹35k outstanding across 3 loan apps. No formal credit score.
*   **Assumptions Made:** 24-month tenure (standard for 2-wheelers). Modeled her existing app loans as a ₹6,354 monthly EMI burden. Modeled her 30%+ app loans via the `has_predatory_loans` flag.
*   **Engine Reaction:**
    *   **Routing (Domain Fix):** Because her purpose is "Commercial Vehicle", the engine correctly routes her to a secured **Two-Wheeler** loan band (15.5-16.0%), rather than hitting her with a 24% unsecured business rate.
    *   **Score Crash:** Her score drops to 0. Why? 100% informal variable income, no savings (-10), severe DTI penalty, the massive predatory loan penalty (-30), and the missed payment (-50). 
    *   **Dual-Ceiling:** A bank might theoretically sanction her for a tiny amount, but her Safe Carry limit is **₹0**. After her current app loan EMIs (₹6.3k), living expenses (₹14k), and the strict minimum living buffer floor, she has mathematically negative cash flow under a 10% income stress test.
*   **Verdict:** `dont_borrow` (Do Not Borrow)
*   **Consequence Log:** "You missed a payment in the last 3 months. Taking new debt to cover old debt almost always leads to a trap. Stay current for 3 months before borrowing." "Existing high-interest (30%+) app loans are a severe red flag indicating a debt trap."
