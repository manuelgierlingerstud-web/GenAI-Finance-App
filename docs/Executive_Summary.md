# Executive Summary — AI Semiconductor Portfolio Strategy

## Overview
This document summarizes the academic investment committee exercise managing a fictitious USD 1,000,000 portfolio across 20 leading artificial intelligence and semiconductor equities.

## Core Strategy & Methodology
- **Dual-View SPA:** Single Asset Analysis (`#/analysis`) and Portfolio Dashboard (`#/portfolio`).
- **Rules-Based Weighting:** Combines deterministic technical indicators (70% weight) with neural text sentiment analysis (30% weight).
- **Risk Management:** Volatility-adjusted sizing with strict 8% maximum stock caps and 2% minimum active thresholds.
- **Auditability:** Every calculation is fully auditable in JavaScript; the LLM extracts sentiment evidence but never determines weights.

## Portfolio Composition
- **Core Thesis Universe (10 stocks):** NVDA, AMD, AVGO, TSM, ASML, ARM, MU, AMAT, LRCX, KLAC.
- **Satellites (10 stocks):** QCOM, MRVL, ANET, SMCI, DELL, MSFT, GOOGL, AMZN, META, ORCL.

## Deliverables & Compliance
- Full test suite (`npm test`) and production build (`npm run build`).
- PDF export and human review surface.
