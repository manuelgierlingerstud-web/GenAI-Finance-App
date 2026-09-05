# Functional Requirements Document (FRD) — GenAI Finance Terminal & Portfolio Dashboard

## 1. Purpose & Academic Context
The GenAI Finance Terminal is an advanced academic quantitative investment research platform designed for investment committee exercises. It manages a fictitious USD 1,000,000 AI and semiconductor value-chain strategy. The system combines deterministic quantitative technical indicators with source-grounded neural sentiment research powered by OpenRouter.

## 2. Investment Thesis & Equity Universe
**Thesis Statement:**
> “The strategy invests across the AI semiconductor value chain when technical trend and momentum signals align with positive, source-grounded earnings and news signals. Exposure is reduced when signals conflict, data coverage is incomplete, or volatility becomes excessive. All calculations are deterministic and auditable; the language model extracts and explains text evidence but never calculates portfolio weights.”

### Ten-Stock Core Thesis Universe
1. **NVDA** — NVIDIA — AI accelerators
2. **AMD** — Advanced Micro Devices — AI accelerators and CPUs
3. **AVGO** — Broadcom — networking and custom silicon
4. **TSM** — Taiwan Semiconductor ADR — semiconductor foundry
5. **ASML** — ASML ADR — lithography
6. **ARM** — Arm Holdings ADR — processor architecture and IP
7. **MU** — Micron Technology — memory
8. **AMAT** — Applied Materials — wafer fabrication equipment
9. **LRCX** — Lam Research — wafer fabrication equipment
10. **KLAC** — KLA — process control and inspection

### Ten Portfolio Satellites
11. **QCOM** — Qualcomm — connectivity and edge AI
12. **MRVL** — Marvell Technology — networking and custom silicon
13. **ANET** — Arista Networks — AI data-center networking
14. **SMCI** — Super Micro Computer — AI servers
15. **DELL** — Dell Technologies — enterprise AI infrastructure
16. **MSFT** — Microsoft — cloud and AI software
17. **GOOGL** — Alphabet — cloud, models and AI platforms
18. **AMZN** — Amazon — AWS AI infrastructure
19. **META** — Meta Platforms — AI platforms and infrastructure investment
20. **ORCL** — Oracle — cloud infrastructure

## 3. Finance-Track Portfolio Construction & Scoring
- **Label:** "Finance Track — Rules-Based Signal-Weighted Portfolio; not a mean-variance optimization."
- **Technical Score (0–100):** Computed deterministically across Trend (30 pts), Momentum (25 pts), RSI (15 pts), Volume (10 pts), Risk/Volatility (10 pts), and Data Quality (10 pts).
- **Text Score (0–100):** Derived from extracted positive/negative phrases divided by word count (`sentiment_density`), mapped via a neutral band (±0.005).
- **Composite Score:** `0.70 * technicalScore + 0.30 * textScore` (or technical score provisionally if text coverage is unavailable).
- **Capped Normalization:** Raw weights computed via `max(0.01, compositeScore / max(volatility, 10))`, capped at 8% max stock weight and 2% min active stock weight. Unresolved or missing data allocated to a visible CASH row. Sums to exactly 100% and USD 1,000,000.

## 4. Market Data & API Security
- **Twelve Data:** Official OHLCV feed via multi-symbol requests.
- **OpenRouter:** Neural research via Perplexity Sonar and structured extraction via Claude 3.5 Sonnet.
- **Security:** API keys are stored solely in browser `sessionStorage` (cleared on tab close). Backend `/api/status` returns boolean availability flags only without exposing raw keys.
