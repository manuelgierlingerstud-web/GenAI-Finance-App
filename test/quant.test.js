import test from 'node:test';
import assert from 'node:assert';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateRealizedVolatility, checkDataIntegrity } from '../src/quant/indicators.js';
import { calculateTechnicalScore, calculateTextScore, calculateCompositeScore } from '../src/quant/scoring.js';
import { calculatePortfolioWeights } from '../src/quant/weights.js';
import { escapeHTML, sanitizeUrl } from '../src/security/rendering.js';
import { PORTFOLIO_UNIVERSE } from '../src/config/portfolio.js';

test('Indicator calculations: SMA & EMA', () => {
  const dummyData = Array.from({ length: 30 }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    open: 100 + i,
    high: 105 + i,
    low: 95 + i,
    close: 100 + i,
    volume: 1000000
  }));

  const sma20 = calculateSMA(dummyData, 20);
  assert.strictEqual(sma20.length, 30);
  assert.strictEqual(sma20[18], null);
  assert.strictEqual(typeof sma20[19], 'number');

  const ema12 = calculateEMA(dummyData, 12);
  assert.strictEqual(ema12.length, 30);
  assert.strictEqual(ema12[10], null);
  assert.strictEqual(typeof ema12[11], 'number');
});

test('RSI calculation bounds', () => {
  const dummyData = Array.from({ length: 25 }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    open: 100 + (i % 3 === 0 ? 2 : -1),
    high: 105,
    low: 95,
    close: 100 + (i % 3 === 0 ? 2 : -1),
    volume: 1000000
  }));

  const rsi = calculateRSI(dummyData, 14);
  assert.strictEqual(rsi.length, 25);
  const lastRsi = rsi[24];
  assert.ok(lastRsi >= 0 && lastRsi <= 100);
});

test('Text density and composite score calculation', () => {
  const textResult = {
    available: true,
    positive_count: 15,
    negative_count: 3,
    source_word_count: 1000,
    sourcesUsed: [{ title: 'Earnings Report', url: 'https://example.com', date: '2026-08-01' }]
  };

  const textScoreObj = calculateTextScore(textResult);
  assert.strictEqual(textScoreObj.available, true);
  assert.strictEqual(textScoreObj.label, 'POSITIVE');
  assert.strictEqual(typeof textScoreObj.score, 'number');

  const comp = calculateCompositeScore(80, textScoreObj);
  assert.strictEqual(comp.hasText, true);
  assert.strictEqual(typeof comp.compositeScore, 'number');
  assert.strictEqual(comp.signalLabel, 'OVERWEIGHT');
});

test('Portfolio weights normalization, caps and sums', () => {
  const mockStocks = PORTFOLIO_UNIVERSE.map((stock, idx) => ({
    ticker: stock.ticker,
    compositeScore: 60 + (idx % 20),
    annualizedVolatility: 0.25 + (idx * 0.01),
    hasValidData: true
  }));

  const portfolio = calculatePortfolioWeights(mockStocks);
  assert.strictEqual(portfolio.allocations.length, 20);
  assert.ok(portfolio.cashAllocation < 0.000001);
  assert.strictEqual(Math.abs(portfolio.totalCheckWeight - 1.0) < 0.0001, true);
  assert.strictEqual(portfolio.totalCheckUsd, 1000000);

  // Check max weight cap (8%) and min active weight (2%)
  portfolio.allocations.forEach(alloc => {
    assert.ok(alloc.weight <= 0.08001);
    if (alloc.weight > 0) {
      assert.ok(alloc.weight >= 0.01999);
    }
  });
});

test('Missing symbol allocation to cash', () => {
  const mockStocks = PORTFOLIO_UNIVERSE.map((stock, idx) => ({
    ticker: stock.ticker,
    compositeScore: 70,
    annualizedVolatility: 0.3,
    hasValidData: idx !== 0 // first stock has invalid data
  }));

  const portfolio = calculatePortfolioWeights(mockStocks);
  const nvdaAlloc = portfolio.allocations.find(a => a.ticker === 'NVDA');
  assert.strictEqual(nvdaAlloc.weight, 0);
  assert.strictEqual(nvdaAlloc.usdAllocation, 0);
  assert.ok(portfolio.cashAllocation > 0);
  assert.strictEqual(Math.abs(portfolio.totalCheckWeight - 1.0) < 0.0001, true);
});

test('Security rendering: HTML escaping and URL validation', () => {
  const malicious = '<script>alert("hack")</script>';
  const escaped = escapeHTML(malicious);
  assert.strictEqual(escaped.includes('<script>'), false);
  assert.strictEqual(escaped.includes('&lt;script&gt;'), true);

  const safeUrl = sanitizeUrl('https://example.com/report.pdf');
  assert.strictEqual(safeUrl, 'https://example.com/report.pdf');

  const unsafeUrl = sanitizeUrl('javascript:alert(1)');
  assert.strictEqual(unsafeUrl, '#');
});

test('Data integrity checker', () => {
  const validData = Array.from({ length: 50 }, (_, i) => ({
    date: `2026-06-${String((i % 30) + 1).padStart(2, '0')}`,
    open: 100,
    high: 105,
    low: 95,
    close: 102,
    volume: 500000
  }));

  const res = checkDataIntegrity(validData);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.observations, 50);
});
