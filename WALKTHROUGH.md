# The 5-Minute Interview Script

**Goal:** Explain the architecture of Borrower Copilot, specifically highlighting how it acts as a fiduciary advocate rather than a lead-gen tool.

## 1. The Core Architecture (1 min)

"Borrower Copilot is a client-side React application built specifically for the Indian credit market. It's totally private—no data is sent to a server. 

The engine uses a deterministic 100-point scoring system. However, its real value is in the 'Dual Ceiling Architecture.' Lead-generation sites calculate a single number (FOIR) to figure out what a bank will legally sell you. The Copilot calculates two numbers:
1. What the bank will sanction you (FOIR).
2. What you can actually survive (Cashflow minus expenses, existing debt, and an absolute minimum living floor buffer)."

## 2. The Stress Test & Silence Widening (2 min)

"The app doesn't just calculate your limit under sunny-day conditions. 

If you say you want ₹5 Lakhs, it runs a macroeconomic stress test. It drops your income by 10% and spikes the interest rate by 2%. If that resulting EMI breaches your living buffer, the app tells you to 'Borrow Less.'

More importantly, it handles **silence**. If a user like Ravi leaves his existing EMIs blank, standard calculators just assume `0` and tell him he can afford a massive loan. The Copilot assumes `0`, but aggressively widens the safety output band by 20% and fires a warning card saying, *'We assumed zero debt because you didn't tell us, but if you have it, this number is dangerously wrong.'* Confidence widens with silence."

## 3. Product Judgments & The Fiduciary Approach (2 min)

"A true financial advocate educates, it doesn't force. Notice that the engine largely ignores the initial 'What loan type did you want?' dropdown. A fiduciary engine routes on substance (collateral, purpose, income type), not on the borrower's uneducated guess. 

For example, if you declare that you own unencumbered property, the Copilot asks you: *'Are you willing to pledge this property as collateral to lower your rate?'* 
* If you say yes, it routes you to a Loan Against Property (LAP) at ~9%. 
* If you say no, it routes you to an unsecured loan at ~14%, but adds a 'Smart Nudge' to the log saying, *'You kept your home safe, but you are overpaying by 5%.'* 
This educates the borrower on their leverage without forcing them to risk foreclosure for a slightly cheaper loan.

Similarly, we protect stable co-applicants. If Ravi is a volatile gig worker but his wife is a salaried teacher, we only apply the volatility haircut to his income. We preserve 100% of her salary, accurately reflecting the household's actual risk profile."

## 4. The Live Demo Handover

"All mathematical variables—LTV caps, FOIR limits, haircuts, and rate bands—are declared as named constants at the top of `src/rules.ts`. If you want to see what happens when the RBI tightens FOIR from 50% to 40%, we can change one line of code right now and watch the engine adapt instantly."
