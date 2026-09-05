import { calculateSMA, calculateMACD, calculateRSI, calculateRealizedVolatility, checkDataIntegrity } from './indicators.js';
import { NEUTRAL_SENTIMENT_BAND } from '../config/portfolio.js';

export function calculateTechnicalScore(priceData) {
  if (!priceData || priceData.length < 20) {
    return { score: 50, breakdown: { trend: 15, momentum: 12, rsi: 7, volume: 5, risk: 5, quality: 6 } };
  }

  const closes = priceData.map(d => d.close);
  const sma20 = calculateSMA(priceData, 20);
  const sma50 = calculateSMA(priceData, Math.min(50, priceData.length));
  const rsiArr = calculateRSI(priceData, 14);
  const { macdLine, signalLine, histogram } = calculateMACD(priceData);
  const annVol = calculateRealizedVolatility(priceData);
  const integrity = checkDataIntegrity(priceData);

  const lastIdx = priceData.length - 1;
  const latestClose = closes[lastIdx];
  const lastSma20 = sma20[lastIdx] || latestClose;
  const lastSma50 = sma50[lastIdx] || lastSma20;

  // 1. Trend (max 30 pts)
  let trendScore = 0;
  // close > fast MA
  if (latestClose > lastSma20) trendScore += 10;
  // fast MA > slow MA
  if (lastSma20 > lastSma50) trendScore += 10;
  // 5-session slope of slow MA > 0
  const sma50Len = sma50.filter(v => v !== null).length;
  if (sma50Len >= 5) {
    const prevSma50 = sma50[lastIdx - 5] !== null ? sma50[lastIdx - 5] : lastSma50;
    if (lastSma50 > prevSma50) trendScore += 10;
  } else {
    trendScore += 5; // default fallback
  }

  // 2. Momentum (max 25 pts)
  let momentumScore = 0;
  const lastMacd = macdLine[lastIdx] || 0;
  const lastSignal = signalLine[lastIdx] || 0;
  const lastHist = histogram[lastIdx] || 0;
  const prevHist = lastIdx > 0 ? (histogram[lastIdx - 1] || 0) : 0;

  if (lastMacd > lastSignal) momentumScore += 10;
  if (lastHist > 0) momentumScore += 10;
  if (lastHist > prevHist) momentumScore += 5;

  // 3. RSI (max 15 pts) [inclusive/exclusive boundaries]
  let rsiScore = 0;
  const lastRsi = rsiArr[lastIdx] !== null ? rsiArr[lastIdx] : 50;
  if (lastRsi >= 45 && lastRsi <= 65) {
    rsiScore = 15;
  } else if ((lastRsi >= 35 && lastRsi < 45) || (lastRsi > 65 && lastRsi <= 70)) {
    rsiScore = 10;
  } else if (lastRsi >= 30 && lastRsi < 35) {
    rsiScore = 5;
  } else {
    rsiScore = 0;
  }

  // 4. Volume (max 10 pts)
  let volumeScore = 0;
  const lastVol = priceData[lastIdx].volume || 0;
  let avgVol20 = 0;
  const volSlice = priceData.slice(Math.max(0, lastIdx - 19), lastIdx + 1);
  avgVol20 = volSlice.reduce((acc, v) => acc + (v.volume || 0), 0) / volSlice.length;
  const dailyReturn = lastIdx > 0 ? (closes[lastIdx] - closes[lastIdx - 1]) / closes[lastIdx - 1] : 0;

  if (avgVol20 > 0 && lastVol >= avgVol20 * 1.2 && dailyReturn > 0) {
    volumeScore = 10;
  } else if (avgVol20 > 0 && lastVol >= avgVol20) {
    volumeScore = 5;
  } else {
    volumeScore = 0;
  }

  // 5. Risk / Volatility (max 10 pts)
  let riskScore = 0;
  const volPct = annVol * 100;
  if (volPct <= 35) riskScore = 10;
  else if (volPct <= 50) riskScore = 7;
  else if (volPct <= 70) riskScore = 3;
  else riskScore = 0;

  // 6. Data quality (max 10 pts)
  let qualityScore = 10;
  if (!integrity.valid) qualityScore -= 4;
  if (priceData.length < 100) qualityScore -= 2;
  qualityScore = Math.max(2, qualityScore);

  const totalScore = Math.min(100, Math.max(0, trendScore + momentumScore + rsiScore + volumeScore + riskScore + qualityScore));

  return {
    score: Math.round(totalScore),
    breakdown: {
      trend: trendScore,
      momentum: momentumScore,
      rsi: rsiScore,
      volume: volumeScore,
      risk: riskScore,
      quality: qualityScore
    },
    metrics: {
      rsi: lastRsi,
      annualizedVolatility: annVol,
      latestClose
    }
  };
}

export function calculateTextScore(textAnalysisResult) {
  if (!textAnalysisResult || !textAnalysisResult.sourcesUsed) {
    return { score: null, density: 0, label: 'INSUFFICIENT DATA', available: false };
  }

  const posCount = textAnalysisResult.positive_count || 0;
  const negCount = textAnalysisResult.negative_count || 0;
  const wordCount = textAnalysisResult.source_word_count || 1000;

  const density = (posCount - negCount) / Math.max(wordCount, 1);
  let label = 'NEUTRAL';
  if (density > NEUTRAL_SENTIMENT_BAND) label = 'POSITIVE';
  else if (density < -NEUTRAL_SENTIMENT_BAND) label = 'NEGATIVE';

  // Normalize density [-0.05, 0.05] to score [0, 100]
  const normalized = Math.min(100, Math.max(0, 50 + (density * 1000)));

  return {
    score: Math.round(normalized),
    density,
    label,
    available: true,
    positive_count: posCount,
    negative_count: negCount
  };
}

export function calculateCompositeScore(techScore, textResult) {
  if (!textResult || !textResult.available || textResult.score === null) {
    return {
      compositeScore: techScore,
      hasText: false,
      signalLabel: getSignalLabel(techScore)
    };
  }

  const composite = (0.70 * techScore) + (0.30 * textResult.score);
  const rounded = Math.round(composite);
  return {
    compositeScore: rounded,
    hasText: true,
    signalLabel: getSignalLabel(rounded)
  };
}

function getSignalLabel(score) {
  if (score >= 70) return 'OVERWEIGHT';
  if (score >= 55) return 'NEUTRAL';
  return 'UNDERWEIGHT';
}
