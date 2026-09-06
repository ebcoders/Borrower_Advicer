# Borrower Copilot

A privacy-first, client-side React application that acts as a financial advocate for Indian borrowers. It uses a deterministic 100-point risk engine to separate what a bank will legally lend you from what you can actually afford, stress-tests that capacity, and generates a Negotiation Card to take to the lender.

## Interview Deliverables

As requested in the Lokta Challenge brief, the required deliverables are located in the root of this repository:

1.  **[RULES.md](./RULES.md)**: The complete, mathematically transparent documentation of the risk engine, LTV caps, FOIR logic, and adaptive algorithms.
2.  **[RUN_THROUGHS.md](./RUN_THROUGHS.md)**: Detailed documentation of how the engine handles Priya (Prime Salaried), Ravi (LAP, Missing Info), and Anita (Informal Debt Trap).
3.  **[WALKTHROUGH.md](./WALKTHROUGH.md)**: A 5-minute interview script explaining the architecture, the "Safe vs Lender" dual-ceiling, and the graceful degradation engine.

## Technical Architecture

*   **Pure SPA (Vite + React + TypeScript):** All logic runs in the browser. Financial data never touches a server.
*   **Separation of Concerns:** The UI (`src/App.tsx`) is strictly separated from the domain logic (`src/rules.ts`).
*   **Live Modifications:** If asked to "change a rule" during a live review, open `src/rules.ts`. All LTV caps, FOIR caps, haircuts, and rate bands are defined as named constants at the top of the file for instant modification.

## Getting Started

```bash
npm install
npm run dev
```

## Running the Automated Test Suite
To verify the engine mathematically without clicking through the UI:
```bash
npx tsx test-suite.ts
```
