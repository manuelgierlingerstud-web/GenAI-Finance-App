import { STRATEGY_CAPITAL, MAX_STOCK_WEIGHT, MIN_ACTIVE_STOCK_WEIGHT } from '../config/portfolio.js';

export function calculatePortfolioWeights(scoredStocks) {
  const totalStocks = scoredStocks.length;
  const validStocks = scoredStocks.filter(s => s.hasValidData);
  const invalidStocks = scoredStocks.filter(s => !s.hasValidData);

  // If there are invalid stocks, calculate base cash allocation from invalid count proportion
  let baseCashFraction = invalidStocks.length / Math.max(totalStocks, 1);
  let targetActiveTotal = 1.0 - baseCashFraction;

  const rawWeightsMap = new Map();
  let rawSum = 0;

  scoredStocks.forEach(stock => {
    if (!stock.hasValidData) {
      rawWeightsMap.set(stock.ticker, 0);
      return;
    }
    const score = Math.max(10, stock.compositeScore || 50);
    const vol = Math.max(0.1, stock.annualizedVolatility || 0.3) * 100;
    const raw = Math.max(0.01, score / Math.max(vol, 10));
    rawWeightsMap.set(stock.ticker, raw);
    rawSum += raw;
  });

  // Initial normalized weights for valid stocks summing to targetActiveTotal
  const weightsArray = scoredStocks.map(stock => {
    if (!stock.hasValidData || rawSum === 0) {
      return { ticker: stock.ticker, weight: 0, hasValidData: false };
    }
    const rawW = rawWeightsMap.get(stock.ticker) / rawSum;
    return {
      ticker: stock.ticker,
      weight: rawW * targetActiveTotal,
      hasValidData: true
    };
  });

  // Iterative capped normalization for active weights (max 8% each)
  const maxIterations = 50;
  for (let iter = 0; iter < maxIterations; iter++) {
    let excess = 0;
    let validActive = weightsArray.filter(w => w.hasValidData);

    validActive.forEach(item => {
      if (item.weight > MAX_STOCK_WEIGHT) {
        excess += (item.weight - MAX_STOCK_WEIGHT);
        item.weight = MAX_STOCK_WEIGHT;
      }
    });

    if (excess <= 0.000001) break;

    let nonCapped = validActive.filter(w => w.weight < MAX_STOCK_WEIGHT);
    let nonCappedSum = nonCapped.reduce((sum, w) => sum + w.weight, 0);

    if (nonCappedSum <= 0) {
      baseCashFraction += excess;
      break;
    }

    nonCapped.forEach(item => {
      const proportion = item.weight / nonCappedSum;
      item.weight += excess * proportion;
    });
  }

  // Sum active weights
  let activeSum = weightsArray.filter(w => w.hasValidData).reduce((acc, w) => acc + w.weight, 0);
  let cashAllocation = 1.0 - activeSum;
  cashAllocation = Math.max(0, Math.min(1.0, cashAllocation));

  // Ensure total weight sums to exactly 1.0000
  let totalWeightCheck = activeSum + cashAllocation;
  if (Math.abs(totalWeightCheck - 1.0) > 0.00001 && validStocks.length > 0) {
    const diff = 1.0 - totalWeightCheck;
    const maxStock = weightsArray.reduce((prev, curr) => (curr.weight > prev.weight) ? curr : prev, weightsArray.filter(w => w.hasValidData)[0]);
    if (maxStock) maxStock.weight += diff;
  }

  // Calculate USD allocations summing to USD 1,000,000 within USD 1
  let allocatedUsdSum = 0;
  const resultAllocations = weightsArray.map(w => {
    const usd = Math.round(w.weight * STRATEGY_CAPITAL);
    allocatedUsdSum += usd;
    return {
      ticker: w.ticker,
      weight: w.weight,
      usdAllocation: usd
    };
  });

  const usdDiff = STRATEGY_CAPITAL - allocatedUsdSum;
  if (usdDiff !== 0 && resultAllocations.length > 0) {
    let largest = resultAllocations.reduce((prev, curr) => (curr.usdAllocation > prev.usdAllocation) ? curr : prev);
    largest.usdAllocation += usdDiff;
  }

  return {
    allocations: resultAllocations,
    cashAllocation,
    totalCheckUsd: resultAllocations.reduce((acc, r) => acc + r.usdAllocation, 0),
    totalCheckWeight: resultAllocations.reduce((acc, r) => acc + r.weight, 0) + cashAllocation
  };
}
