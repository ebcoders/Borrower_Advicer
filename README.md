# Borrower Copilot

A deterministic, privacy-first React Single Page Application (SPA) that helps Indian borrowers answer four critical questions before they speak to a lender: 
*Should I borrow at all? How much am I really eligible for? What is a fair rate? What EMI should I agree to?*

No login. No credit bureau pull. Nothing you enter is stored anywhere. Everything runs locally in your browser.

## Run it locally (under 2 minutes)

Ensure you have [Node.js](https://nodejs.org/) installed, then run:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

This starts the Vite dev server. Open your browser to `http://localhost:3000`.

## Architecture & Files

The application strictly separates the UI from the domain logic to ensure explainability and testability:

- `src/rules.ts` — **The Decision Engine.** Contains zero UI code. Houses the 100-point risk scoring model, dual-ceiling FOIR calculators, product routing logic (LAP vs Unsecured), and the mathematical formulas for EMI and Principal.
- `src/App.tsx` — **The User Interface.** A responsive 4-step wizard built with React and Tailwind CSS. Collects inputs and renders the final Negotiation Card based on the engine's outputs.
- `RULES.md` — **The Domain Documentation.** A human-readable matrix of every rule, threshold, and assumption used in `rules.ts` (what it is, its value, and why it exists).

## Core Logic Highlights

1. **Dual-Ceiling Architecture:** Explicitly separates what a bank will legally sanction (based on Gross FOIR) vs. what the borrower can safely carry without risking default (Net Cashflow minus a regional living buffer).
2. **Graceful Degradation:** Adheres to the principle that *confidence widens with silence*. If a user skips sensitive inputs (like ITR or Credit Score), the application mathematically widens the output bands (±15%) and explicitly displays the cost of missing information.
3. **Product Routing:** Maps borrowers to real Indian financial products (e.g., automatically routing a self-employed borrower with collateral to a 9-11.5% LAP instead of an 18% unsecured business loan).
4. **Stress Testing:** Mathematically simulates a 10% drop in income and a 2% rise in interest rates to verify the loan is survivable in bad weather.