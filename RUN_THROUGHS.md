# Three Borrower Run-Throughs

The Lokta brief requires a walk-through of three specific borrowers. Here is exactly how the Borrower Copilot handles Priya, Ravi, and Anita.

## 1. Priya (Prime Salaried)
**Profile:** 29 years old, Salaried, ₹1,10,000/mo net income. Excellent credit history (780 CIBIL), no missed payments. Looking for ₹8,00,000 over 5 years. Pays ₹28,000 rent and a ₹14,000 car EMI.

**How the Engine Handles Her:**
*   **Scoring:** She gets the maximum stability points (+15 for salaried, +20 for clean payments, +10 for low DTI). 
*   **Routing:** Because of her 780 CIBIL, she is routed directly to the **Personal Loan (Prime)** band at the lowest possible rate (10.5%).
*   **The Dual-Ceiling Output:** The bank’s FOIR says she can afford an EMI of ₹41,000 (Sanction range up to ₹19L). But the *Safe FOIR* engine subtracts her ₹28k rent and living buffer, telling her she can safely carry a ₹31,000 EMI. 
*   **Verdict:** **Borrow.** The ₹8,00,000 loan easily fits inside her safe ceiling. The Negotiation Card advises her to accept an EMI no higher than ₹31k and a true APR of ~10.9%.

## 2. Ravi (Self-Employed, High Collateral, Missing Info)
**Profile:** 42 years old, Self-Employed, ₹1,20,000/mo stated income (60% variable). Wants ₹15,00,000 for business expansion. Doesn't know his credit score. Has a ₹45,00,000 shop. Skips entering his ITR and Living Expenses.

**How the Engine Handles Him:**
*   **Collateral Routing & LTV:** The engine detects his ₹45L unencumbered property. Instead of giving him an 18% unsecured business loan, it overrides his requested product and routes him to a **Loan Against Property (LAP)** at 9.0% - 11.5%.
*   **Graceful Degradation (Silence Penalty):** Because he skipped his ITR and Expenses, the engine assumes a 40% expense ratio and applies a 30% haircut to his income (capped variable discount). More importantly, it widens his output estimate bands by **±25%**.
*   **Verdict:** **Borrow Less.** The engine determines that ₹15L is borderline unsafe under stress testing for his discounted cash flow. The UI displays the Consequence Card: *"Because you didn't provide an ITR, we discounted your income... You didn't know your credit score, so we modeled standard rates."*

## 3. Anita (Informal, Debt Trap)
**Profile:** 35 years old, Informal gig worker, ₹28,000/mo income (100% variable). Wants ₹1,50,000 for her child's education. Pays ₹14,000 in living expenses, plus ₹6,354 across 3 app loans. **Missed a payment last month.**

**How the Engine Handles Her:**
*   **The Hard Stop:** The engine registers the missed payment in the last 3 months and immediately subtracts 50 points from her risk score, pushing her below the 30-point survival threshold.
*   **Cashflow Exhaustion:** The engine assesses her income (applying a strict 50% discount because she stated it was 100% variable and lacks an ITR). It enforces the absolute minimum regional living buffer (₹8,000). After her rent (14k) and existing loans (6.3k), her safe cash flow is entirely negative.
*   **Verdict:** **Don't Borrow.** The system halts and presents the Fallback Card: *"Lenders who offer you money right now are likely predatory... Focus on clearing existing overdue EMIs. Build a 3-month track record of zero missed payments."*
