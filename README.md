# GenAI Finance Terminal & Portfolio Dashboard

An advanced academic quantitative investment research platform and Portfolio Dashboard managing a fictitious USD 1,000,000 AI and semiconductor value-chain strategy.

## Features
- **Two-View SPA:**
  - `#/analysis` — Single Asset Analysis with live Twelve Data OHLCV charts, technical indicators, and backtesting.
  - `#/portfolio` — Portfolio Dashboard managing 20 AI & semiconductor stocks (10 Core Thesis + 10 Satellites) with rules-based signal weighting.
- **Rules-Based Scoring:** Deterministic 6-dimensional technical scoring combined with source-grounded neural text sentiment via OpenRouter.
- **Secure Key Handling:** API keys are stored solely in browser `sessionStorage` (never in `localStorage` or server logs). Backend status returns boolean flags only.
- **Robust Testing & Build:** Fully tested with Node's test runner (`npm test`) and built for static hosting on GitHub Pages (`npm run build`).

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Run test suite:
   ```bash
   npm test
   ```
4. Build for production:
   ```bash
   npm run build
   ```
