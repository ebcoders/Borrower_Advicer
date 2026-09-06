# Five-Minute Walkthrough (Interview Pitch)

*(Use this script to guide the interviewers through the application architecture and philosophy).*

## 1. The Core Philosophy (1 min)
"Standard loan calculators are built for banks. They ask for your gross income, multiply it by 50%, and tell you what the bank will legally lend you. They don't care if you have to starve to make the EMI. 

Borrower Copilot is built for the borrower. It asks the hard questions—like actual living expenses and income volatility—and separates what the bank will **sanction** from what the borrower can **safely carry**."

## 2. The Architecture & Privacy (1 min)
"Because financial data is deeply sensitive, I built this as a pure client-side React SPA. There is no backend. There is no database. 

I rigorously separated the UI (`App.tsx`) from the domain logic (`rules.ts`). The UI is just a dumb wizard; the `rules.ts` file is a deterministic 100-point risk engine. This ensures the underwriting logic is 100% unit-testable and explainable. No LLM hallucinations, just documented math."

## 3. Graceful Degradation & "Silence Widens" (1.5 min)
"In the real world, borrowers don't know all their numbers. If they don't know their CIBIL score or skip their ITR, a standard app crashes. 

I implemented a principle called **'Confidence widens with silence'**. If a user skips entering their Existing EMIs, the math assumes zero, but the engine adds a massive penalty to the `wideningFactor`. The output ranges stretch (e.g., showing ₹5L - ₹12L instead of a precise ₹8L), and the UI generates a Consequence Card explicitly telling the user: *'Because you hid your existing debt, this estimate is dangerously wide.'* It forces honesty without breaking the flow."

## 4. The Rules Engine in Action (1.5 min)
"The engine does three advanced things behind the scenes:
1.  **Product Routing:** It asks what loan you *want*, but routes you to what you *should get*. If you ask for an unsecured loan but list ₹50L in collateral, it overrides you and routes you to LAP (Loan Against Property) to save you 8% in interest.
2.  **Age/Tenure Capping:** It checks your age. If you are 58 and ask for a 10-year loan, it mathematically caps your tenure to 7 years to ensure you pay it off by the retirement age of 65.
3.  **Binding Stress Test:** It mathematically drops your income by 10% and spikes the rate by 2%. If the proposed loan causes you to breach your absolute basic living buffer (₹8,000) under that stress, the app downgrades your verdict to 'Borrow Less'."
