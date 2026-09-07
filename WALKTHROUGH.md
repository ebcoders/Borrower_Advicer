

**Goal:** Explain the architecture of Borrower Copilot, specifically highlighting how it acts as a fiduciary advocate rather than a lead-gen tool.

## 1. The Core Architecture (1 min)

"Borrower Copilot is a client-side React application for the Indian credit market. It's totally private — no data leaves the browser, no login, no bureau pull.

The engine uses a deterministic 100-point scoring system. Its real value is the 'Dual Ceiling Architecture': lead-gen sites calculate one FOIR number to show what a bank will legally sell you. The Copilot calculates two:

1. What the bank will sanction (FOIR-based).
2. What the borrower can actually survive — cashflow minus expenses, existing debt, an absolute minimum living-floor buffer, and a stress test."

## 2. The Stress Test & Silence Widening (2 min)

"The app runs every recommendation through a stress test: income drops 10%, rates rise 2%. If the resulting EMI breaches the living buffer, the app says 'Borrow Less' or 'Don't Borrow.'

It also handles silence carefully. Every assessment carries a baseline ±5% uncertainty band, even a fully answered one — the model never claims false precision. Then, each piece of missing information *adds* to that band: missing ITR adds 15%, missing expenses adds 10%, missing existing EMIs adds 20%. These stack. A borrower like Ravi, who leaves both expenses and EMIs blank, ends up with a total ±35% band — 5% base, plus 10%, plus 20% — not a smaller number, because each gap is a genuinely separate source of uncertainty."

## 3. Product Judgments & The Fiduciary Approach (2 min)

"The engine largely ignores the borrower's own 'what loan type did you want?' guess and routes on substance instead — collateral, purpose, and income type.

If someone owns unencumbered property and is willing to pledge it, they're only routed to a Loan Against Property if that property is worth at least 1.5 times what they're asking for — otherwise the collateral isn't meaningful enough to change the underwriting, and they stay on an unsecured or vehicle-specific band instead.

If they own property and choose *not* to pledge it, the engine logs: *'You chose not to pledge your property. That keeps your home safe, but you are getting [product] rates. Pledging it as collateral could lower your rate to ~10.5%.'* — an honest trade-off, not a push toward risk.

We also protect stable co-applicants: if one partner is a volatile gig worker but the other is a salaried teacher, only the volatile partner's income gets haircut. The salaried partner's income is preserved at 100%, reflecting the household's real risk profile."

## 4. The Tenure Trade-Off

"Beyond the single EMI ceiling, the app shows the same recommended loan amount at three tenures — 2 years shorter, the current choice, and 2 years longer — with EMI and total interest for each, and flags any option that would exceed the borrower's safe EMI ceiling. This lets a borrower see the real lever they're pulling: a shorter tenure saves on total interest but can push the EMI past what's actually safe."

## 6. What I'd Build Next, and What I'd Cut

**What I'd build next:**

**What I'd cut if I had less time:**

- Broad product coverage beyond what the three brief personas actually exercise — I built more breadth than the scoring rubric asks for ("Not scored: breadth of loan products beyond what the three borrowers need").
