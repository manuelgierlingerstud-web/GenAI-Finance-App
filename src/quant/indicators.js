/**
 * Quantitative indicators calculations (deterministic).
 */

export function calculateSMA(data, period) {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j].close;
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

export function calculateEMA(data, period) {
  const ema = [];
  const multiplier = 2 / (period + 1);
  let prevEMA = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ema.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j <= i; j++) {
        sum += data[j].close;
      }
      prevEMA = sum / period;
      ema.push(prevEMA);
    } else {
      prevEMA = (data[i].close - prevEMA) * multiplier + prevEMA;
      ema.push(prevEMA);
    }
  }
  return ema;
}

export function calculateRSI(data, period = 14) {
  const rsi = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      rsi.push(null);
      continue;
    }
    const change = data[i].close - data[i - 1].close;
    if (i <= period) {
      if (change >= 0) gains += change;
      else losses -= change;
      if (i === period) {
        const avgGain = gains / period;
        const avgLoss = losses / period;
        if (avgLoss === 0) {
          rsi.push(100);
        } else {
          const rs = avgGain / avgLoss;
          rsi.push(100 - (100 / (1 + rs)));
        }
      } else {
        rsi.push(null);
      }
    } else {
      const change = data[i].close - data[i - 1].close;
      const prevGain = (rsi[i - 1] !== null) ? (gains / period) : 0; // simplified smoothed
      const currentGain = change >= 0 ? change : 0;
      const currentLoss = change < 0 ? -change : 0;
      // standard Wilder's smoothing
      const avgGain = ((gains * (period - 1)) + currentGain) / period;
      const avgLoss = ((losses * (period - 1)) + currentLoss) / period;
      gains = avgGain * period;
      losses = avgLoss * period;

      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }
  return rsi;
}

export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  const macdLine = [];
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    } else {
      macdLine.push(null);
    }
  }

  // Calculate Signal Line (EMA of MACD line)
  const validMacdSubset = [];
  const indices = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null) {
      validMacdSubset.push({ close: macdLine[i] });
      indices.push(i);
    }
  }

  const signalEMA = calculateEMA(validMacdSubset, signalPeriod);
  const signalLine = new Array(data.length).fill(null);
  const histogram = new Array(data.length).fill(null);

  for (let k = 0; k < validMacdSubset.length; k++) {
    const origIdx = indices[k];
    const sigVal = signalEMA[k];
    signalLine[origIdx] = sigVal;
    if (sigVal !== null && macdLine[origIdx] !== null) {
      histogram[origIdx] = macdLine[origIdx] - sigVal;
    }
  }

  return { macdLine, signalLine, histogram };
}

export function calculateRealizedVolatility(data, period = 252) {
  if (!data || data.length < 2) return 0.25; // default 25%
  const returns = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].close;
    const curr = data[i].close;
    if (prev > 0) {
      returns.push(Math.log(curr / prev));
    }
  }
  if (returns.length === 0) return 0.25;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1 || 1);
  const dailyVol = Math.sqrt(variance);
  const annualizedVol = dailyVol * Math.sqrt(252);
  return isNaN(annualizedVol) ? 0.25 : annualizedVol;
}

export function checkDataIntegrity(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, issues: ['No price data observations available'] };
  }
  let negativePrices = 0;
  let ohlcViolations = 0;
  let zeroVolume = 0;
  let duplicates = 0;
  const dateSet = new Set();

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    if (d.close <= 0 || d.open <= 0 || d.high <= 0 || d.low <= 0) negativePrices++;
    if (d.low > d.high || d.open > d.high || d.open < d.low || d.close > d.high || d.close < d.low) {
      ohlcViolations++;
    }
    if (d.date) {
      if (dateSet.has(d.date)) duplicates++;
      dateSet.add(d.date);
    }
  }

  const issues = [];
  if (negativePrices > 0) issues.push(`${negativePrices} non-positive prices detected`);
  if (ohlcViolations > 0) issues.push(`${ohlcViolations} OHLC high/low boundary violations`);
  if (duplicates > 0) issues.push(`${duplicates} duplicate dates detected`);
  if (data.length < 30) issues.push(`Limited history (${data.length} sessions; 252 recommended)`);

  return {
    valid: issues.length === 0 || data.length >= 20,
    observations: data.length,
    latestDate: data[data.length - 1]?.date || 'Unknown',
    issues
  };
}
