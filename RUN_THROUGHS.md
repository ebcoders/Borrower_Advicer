# Persona Run-Throughs

The following run-throughs show the exact adaptive questions asked, the exact inputs used, and the exact outputs produced by running `src/rules.ts`'s `runAssessment()` directly against the three personas in the Lokta Challenge brief. Every figure below was verified by execution, not calculated by hand.

## 1. Priya (Prime Salaried, Overpaying)

**Questions asked (adaptive path — 3-step form):**
- *Step 1 — Basics:* Purpose → Wedding · Loan type wanted → Personal · Amount → ₹8,00,000 · Lender-quoted rate (optional) → 14% · Tenure → 60 months (default for this purpose) · Age → 29
- *Step 2 — Cashflow:* Income type → Salaried · Monthly income → ₹1,10,000 · Co-applicant income → left blank · Monthly expenses → ₹28,000 · Existing EMIs → ₹14,000
  *(Because income type is Salaried, the "Informal Income Assessment" block — variable-income % and ITR — never appears; it's adaptively skipped.)*
- *Step 3 — Profile & Assets:* Predatory app loans → No · Credit status → Known, score 780 · Missed payments → No · Years in job → 5 · Emergency savings → 3 months · Owns property → No
  *(Because "owns property" is unchecked, the pledge/property-value fields never appear.)*

**Step-by-step calculation:**

| Step | Calculation | Result |
|---|---|---|
| 1. Tenure cap | Age 29 → max tenure `(65−29)×12 = 432mo`; requested 60mo is under the cap | Effective tenure: 60 months |
| 2. Assessed income | Salaried → 100% of declared | ₹1,10,000/mo |
| 3. Expenses / EMI | Both provided directly | ₹28,000 / ₹14,000 |
| 4. Score | 50 (base) +20 (no missed payment) +15 (salaried) +10 (≥5yrs) +10.0 (savings, 3mo) +3.6 (DTI 12.7%) | **100** (clamped) |
| 5. Routing | Salaried + score≥750 credit → Personal Loan (Prime) | Not rerouted (matches her own request) |
| 6. Rate mapping | Band 10.5–12.5%, score 100 → mapped rate = 10.5% → padded to floor | **Fair rate band: 10.50% – 11.50%** |
| 7. Ceilings | Lender FOIR 50% → ₹35,500/mo available (after existing EMI); Safe FOIR 45% → also ₹35,500/mo (cashflow isn't the binding constraint here) | Safe EMI ceiling: ₹35,500 |
| 8. Stress test | Income −10% → EMI becomes ₹18,202 against the ₹8L loan, ₹38,798/mo left over | Passes comfortably |
| 9. Widening | No missing fields → baseline ±5% only | |
| **Output 2 — Two Amounts** | | **Lender will sanction: ₹17,90,000 – ₹19,80,000** — **Borrower can safely carry: ₹12,70,000 – ₹14,00,000** |
| **Output 3 — Fair Rate** | | **10.5% – 11.5%**, true APR (incl. 2% fee) **10.9% – 11.9%** |
| **Output 4 — EMI Ceiling** | | **₹35,500/mo** max safe EMI |
| Tenure trade-off | 36mo → ₹26,191 EMI, ₹1,42,875 total interest (within ceiling) · 60mo → ₹17,394 EMI, ₹2,43,636 interest (within ceiling) · 84mo → ₹13,698 EMI, ₹3,50,628 interest (within ceiling) | All three tenures stay under her safe ceiling |
| **Output 1 — Verdict** | ₹8,00,000 requested is well inside the ₹14,00,000 safe ceiling and survives the stress test | **Borrow** |

**Consequences log:** empty — she answered every question, so only the baseline ±5% uncertainty applies.

**Negotiation Card:**
- Target product: Personal Loan (Prime)
- Fair rate: **10.5% – 11.5%** (true APR ~10.9% – 11.9%)
- Lender quoted her **14%** — since this is above the fair band's ceiling, the card tells her she's overpaying and should negotiate.
- Max EMI to accept: ₹35,500
- Reject if: EMI above ₹35,500, rate above 12.5%, or any fee not deducted from principal upfront.

## 2. Ravi (Asset Rich, Missing Info, Co-Applicant)

**Questions asked (adaptive path):**
- *Step 1 — Basics:* Purpose → Business · Loan type wanted → Business · Amount → ₹15,00,000 · Lender-quoted rate → left blank · Tenure → 60 months · Age → 42
- *Step 2 — Cashflow:* Income type → Self-Employed/Informal *(triggers the Informal Income Assessment block)* · Monthly income → ₹60,000 · Variable-income % → 60% · Annual ITR income → ₹4,20,000 · Co-applicant income → ₹18,000, marked Salaried · Monthly expenses → **left blank** · Existing EMIs → **left blank**
- *Step 3 — Profile & Assets:* Predatory app loans → No · Credit status → Never taken a formal loan (NTC) *(no credit-score field appears for this status)* · Missed payments → No · Years in business → 14 · Emergency savings → **left blank** · Owns property → Yes → Willing to pledge → Yes → Property value → ₹45,00,000

**Step-by-step calculation:**

| Step | Calculation | Result |
|---|---|---|
| 1. Tenure cap | Age 42 → max tenure `(65−42)×12 = 276mo`; requested 60mo is fine | Effective tenure: 60 months |
| 2. Assessed income | Informal, 60% stated volatility → haircut = min(50%, 60%) = **50%** → ₹60,000×0.5 = ₹30,000 haircut value; ITR floor = ₹4,20,000÷12 = ₹35,000/mo → **use the higher of the two = ₹35,000**. Co-applicant salaried → full ₹18,000 preserved. | **Total assessed income: ₹53,000/mo** |
| 3. Expenses / EMI | Both blank → expenses assumed at 40% of income = ₹21,200; EMI assumed ₹0 (flagged) | |
| 4. Score | 50 (base) +20 (no missed payment) +10 (≥5yrs, actually 14yrs) +10.0 (business = productive purpose) +10.0 (DTI 0%, since assumed EMI is ₹0) — savings not answered, no change | **100** (clamped) |
| 5. Routing | Owns property + willing to pledge + property value (₹45L) exceeds 1.5× the ₹15L request (₹22.5L) → **LAP-eligible** | Loan Against Property — rerouted from his own "Business" request |
| 6. Rate mapping | Band 9.0–11.5%, score 100 → mapped rate = 9.0% → padded up to +1.0 | **Fair rate band: 9.00% – 10.00%** |
| 7. Ceilings | Informal → Lender FOIR 45%, Safe FOIR 40%. Safe EMI ceiling = min(FOIR-based ₹21,200, cashflow-based ₹21,200) | Safe EMI ceiling: ₹21,200 |
| 8. Stress test | Income −10% → EMI becomes ₹21,333 against the recommended loan, only **₹5,167/mo left over** — thin, but still positive | Passes, barely |
| 9. Widening | Base 5% + missing expenses 10% + missing EMI 20% = **35% total** (not 30% — see RULES.md §5) | |
| **Output 2 — Two Amounts** | | **Lender will sanction: ₹7,30,000 – ₹15,30,000** — **Borrower can safely carry: ₹4,60,000 – ₹9,70,000** |
| **Output 3 — Fair Rate** | | **9.0% – 10.0%**, true APR **9.4% – 10.4%** |
| **Output 4 — EMI Ceiling** | | **₹21,200/mo** max safe EMI |
| Tenure trade-off | 36mo → ₹31,072 EMI, ₹1,48,591 total interest — **exceeds his ₹21,200 safe ceiling, flagged** · 60mo → ₹20,372 EMI, ₹2,52,308 interest (within ceiling) · 84mo → ₹15,854 EMI, ₹3,61,708 interest (within ceiling) | Shortening his tenure to save interest is not actually safe for him |
| **Output 1 — Verdict** | ₹15,00,000 requested exceeds his ₹9,70,000 safe ceiling | **Borrow Less** — reduce to ₹9,70,000 |

**Consequences log (verbatim from the engine):**
1. "Your co-applicant's stable salaried income fully increased your eligible capacity."
2. "You skipped entering household expenses, so we assumed a conservative 40% of your income. This widens your estimate band."
3. "You didn't confirm your existing EMIs. We assumed zero debt for the calculation, but if you actually have debt, your real eligibility is significantly lower than shown."
4. "We don't know your emergency savings, so we couldn't give you the 'Safety Net' rate discount."

**Negotiation Card:**
- Target product: Loan Against Property (rerouted, since a secured product at 9–10% beats his requested unsecured Business loan at 18–24%)
- Fair rate: **9.0% – 10.0%** (true APR ~9.4% – 10.4%)
- Max EMI to accept: ₹21,200 — recommended amount ₹9,70,000, not the ₹15,00,000 he asked for
- Reject if: EMI above ₹21,200, rate above 11.0%, or any undeducted upfront fee.

## 3. Anita (Informal Debt Trap)

**Questions asked (adaptive path):**
- *Step 1 — Basics:* Purpose → Commercial Vehicle/2-Wheeler · Loan type wanted → Vehicle Loan · Amount → ₹1,50,000 · Lender-quoted rate → left blank · Tenure → manually set to 24 months *(the app's own default for this purpose is 36 months; 24 was set deliberately to match "standard for 2-wheelers")* · Age → 35
- *Step 2 — Cashflow:* Income type → Self-Employed/Informal *(triggers Informal Income Assessment block)* · Monthly income → ₹28,000 · Variable-income % → 100% · Annual ITR income → **left blank** · Co-applicant income → left blank · Monthly expenses → ₹14,000 · Existing EMIs → ₹6,354
- *Step 3 — Profile & Assets:* Predatory app loans → **Yes** · Credit status → Never taken a formal loan (NTC) · Missed payments → **Yes** · Years in business → left blank · Emergency savings → 0 months · Owns property → No

**Step-by-step calculation:**

| Step | Calculation | Result |
|---|---|---|
| 1. Tenure cap | Age 35 → max tenure `(65−35)×12 = 360mo`; 24mo is fine | Effective tenure: 24 months |
| 2. Assessed income | Informal, 100% stated volatility → haircut = min(50%, 100%) = **50% cap applies**; no ITR provided → use haircut value directly: ₹28,000×0.5 = **₹14,000/mo** | **Total assessed income: ₹14,000/mo** |
| 3. Expenses / EMI | Both provided directly | ₹14,000 / ₹6,354 |
| 4. Score | 50 (base) −50 (missed payment) −30 (predatory app loans) −10.0 (0 savings months) +10.0 (vehicle-for-income = productive purpose) −25.4 (DTI 45.4%) | **0** (clamped from −55.4) |
| 5. Routing | Not property-eligible, purpose is vehicle-for-income → Two-Wheeler/Commercial band | Not rerouted (matches her own request) |
| 6. Rate mapping | Band 12.0–16.0%, score 0 → mapped rate = 16.0% (band ceiling) → padded down 0.5 | **Fair rate band: 15.50% – 16.00%** |
| 7. Ceilings | Informal → Safe FOIR 40%. FOIR-based ceiling = ₹14,000×0.40 − ₹6,354 = **−₹754** (already negative before expenses are even subtracted) | Safe EMI ceiling: **₹0** (floored) |
| 8. Stress test | Income −10% → assessed income ₹12,600; EMI possible = ₹0; **₹7,754/mo shortfall** even before any new loan | Fails — she is cashflow-negative today, independent of any new borrowing |
| 9. Widening | Base 5% + missing ITR 15% = 20% total (moot — the ceiling is already ₹0) | |
| **Output 2 — Two Amounts** | | **Lender will sanction: ₹0** — **Borrower can safely carry: ₹0.** Both ceilings are exactly zero, not "a small amount" — her existing debt alone already exceeds her safe FOIR. |
| **Output 3 — Fair Rate** | | 15.5% – 16.0% (informational only — she shouldn't be borrowing regardless) |
| **Output 4 — EMI Ceiling** | | **₹0** — no new EMI is safe |
| Tenure trade-off | Not generated — recommended loan amount is ₹0, so there is nothing to trade off | |
| **Output 1 — Verdict** | Missed payment in the last 3 months triggers the hard-stop rule before any other check runs | **Don't Borrow** |

**Consequences log (verbatim from the engine):**
1. "Because you didn't provide an ITR, we discounted your primary income by 50% based on your stated irregular income."
2. "Existing high-interest (30%+) app loans are a severe red flag indicating a debt trap."

*(Note: the "you missed a payment" message is the verdict's own reason text, not a separate entry in this consequences log — the UI renders these as two different sections: the big verdict banner, and the "Copilot Engine Log" below it.)*

**Negotiation Card:** Not generated in a meaningful form — recommended amount is ₹0, and the card exists mainly to show her *why*: her existing ₹6,354/mo in app-loan EMIs already exceeds what her ₹14,000 assessed income can safely support, before any new borrowing is even considered.
