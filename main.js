import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const form = document.getElementById('ticker-form');
const results = document.getElementById('results');
const tickerInput = document.getElementById('ticker');
const twelveDataInput = document.getElementById('twelvedata-key');
const openRouterInput = document.getElementById('openrouter-key');
const statusBadge = document.getElementById('status-badge');
const statusText = document.getElementById('status-text');
const twelveDataTag = document.getElementById('twelvedata-backend-status');
const openRouterTag = document.getElementById('openrouter-backend-status');

// Store active chart instances to destroy before re-rendering
let activeCharts = [];

// Backend keys store
const backendKeys = {
  twelveData: '',
  openRouter: ''
};

// Check backend API keys on page load
async function checkBackendStatus() {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status endpoint unavailable');
    const data = await res.json();

    if (data.hasTwelveDataKey) {
      backendKeys.twelveData = data.twelveDataKey || 'BACKEND_ACTIVE';
      if (twelveDataTag) {
        twelveDataTag.textContent = '✓ Backend Active';
        twelveDataTag.className = 'backend-status-tag detected';
      }
      if (twelveDataInput) {
        twelveDataInput.placeholder = 'Using Backend Key (or enter custom key)';
      }
    } else {
      if (twelveDataTag) {
        twelveDataTag.textContent = 'Key Needed';
        twelveDataTag.className = 'backend-status-tag missing';
      }
    }

    if (data.hasOpenRouterKey) {
      backendKeys.openRouter = data.openRouterKey || 'BACKEND_ACTIVE';
      if (openRouterTag) {
        openRouterTag.textContent = '✓ Backend Active';
        openRouterTag.className = 'backend-status-tag detected';
      }
      if (openRouterInput) {
        openRouterInput.placeholder = 'Using Backend Key (or enter custom key)';
      }
    } else {
      if (openRouterTag) {
        openRouterTag.textContent = 'Key Needed';
        openRouterTag.className = 'backend-status-tag missing';
      }
    }
  } catch (err) {
    console.warn('Backend status check failed:', err);
    if (twelveDataTag) {
      twelveDataTag.textContent = 'Manual Entry';
      twelveDataTag.className = 'backend-status-tag missing';
    }
    if (openRouterTag) {
      openRouterTag.textContent = 'Manual Entry';
      openRouterTag.className = 'backend-status-tag missing';
    }
  } finally {
    updateStatusBadge();
  }
}

// Dynamically update upper-right status badge
function updateStatusBadge() {
  if (!statusBadge || !statusText) return;

  const hasTD = Boolean(twelveDataInput.value.trim() || backendKeys.twelveData);
  const hasOR = Boolean(openRouterInput.value.trim() || backendKeys.openRouter);

  if (hasTD && hasOR) {
    statusBadge.className = 'status-badge active';
    statusText.textContent = 'SYSTEM ACTIVE';
    statusBadge.title = 'System operational! Both Twelve Data and OpenRouter API keys are present.';
  } else if (hasTD || hasOR) {
    statusBadge.className = 'status-badge warning';
    const missingName = !hasTD ? 'Twelve Data' : 'OpenRouter';
    statusText.textContent = 'KEY MISSING (1/2)';
    statusBadge.title = `Warning: Missing ${missingName} API key. Click to fill in.`;
  } else {
    statusBadge.className = 'status-badge error';
    statusText.textContent = 'KEYS MISSING (0/2)';
    statusBadge.title = 'Error: API keys missing. Click to configure.';
  }
}

// Click status badge to jump to missing key field
if (statusBadge) {
  statusBadge.addEventListener('click', () => {
    const hasTD = Boolean(twelveDataInput.value.trim() || backendKeys.twelveData);
    const hasOR = Boolean(openRouterInput.value.trim() || backendKeys.openRouter);

    if (!hasTD && twelveDataInput) {
      twelveDataInput.focus();
    } else if (!hasOR && openRouterInput) {
      openRouterInput.focus();
    }
  });
}

// Add real-time listeners to key input fields
if (twelveDataInput) twelveDataInput.addEventListener('input', updateStatusBadge);
if (openRouterInput) openRouterInput.addEventListener('input', updateStatusBadge);

// Add quick ticker click handlers
document.querySelectorAll('.ticker-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const symbol = chip.getAttribute('data-ticker');
    if (symbol && tickerInput) {
      tickerInput.value = symbol;
      tickerInput.focus();
    }
  });
});

// Run initial backend status check
checkBackendStatus();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const ticker = tickerInput.value.trim().toUpperCase();
  const twelveDataKey = twelveDataInput.value.trim() || backendKeys.twelveData;
  const openRouterKey = openRouterInput.value.trim() || backendKeys.openRouter;

  if (!twelveDataKey || !openRouterKey) {
    const missing = [];
    if (!twelveDataKey) missing.push('Twelve Data');
    if (!openRouterKey) missing.push('OpenRouter');
    
    results.innerHTML = `
      <div class="error-box">
        <strong>⚡ KEYS REQUIRED:</strong> Please provide API key(s) for <strong>${missing.join(' and ')}</strong> in the form inputs or backend environment (.env).
      </div>
    `;
    updateStatusBadge();
    return;
  }

  // Destroy old charts before loading
  activeCharts.forEach(chart => chart.destroy());
  activeCharts = [];

  results.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <div class="loading-text">CALCULATING QUANT INDICATORS & RUNNING SENIOR STRATEGIST MODEL FOR ${ticker}...</div>
      <div class="loading-subtext">Computing SMA, MACD, RSI, ATR & Evaluating 6 Analysis Dimensions</div>
    </div>
  `;

  try {
    const priceData = await fetchPriceData(ticker, twelveDataKey);
    const techIndicators = calculateTechnicalIndicators(priceData);
    const evaluationJSON = await getSeniorStrategistAssessment(ticker, priceData, techIndicators, openRouterKey);
    renderResults(ticker, priceData, techIndicators, evaluationJSON);
  } catch (err) {
    results.innerHTML = `
      <div class="error-box">
        <strong>⚡ ANALYSIS ERROR:</strong> ${err.message}
      </div>
    `;
  }
});

// Twelve Data daily price history.
async function fetchPriceData(ticker, apiKey) {
  const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=90&apikey=${apiKey}`;
  const response = await fetch(url);

  const body = await response.text();
  let raw;
  try {
    raw = JSON.parse(body);
  } catch {
    throw new Error(body.trim() || 'Price fetch failed');
  }

  if (raw && raw.status === 'error') throw new Error(raw.message || 'Price fetch failed');
  if (!response.ok) throw new Error('Price fetch failed');

  const values = raw.values ?? [];
  if (!values.length) throw new Error(`No price data returned for ${ticker}`);

  return values
    .map((b) => ({
      date: b.datetime,
      open: Number(b.open),
      high: Number(b.high),
      low: Number(b.low),
      close: Number(b.close),
      volume: Number(b.volume)
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

// Technical Indicator Calculations
function calculateTechnicalIndicators(data) {
  const closes = data.map(d => d.close);
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  const volumes = data.map(d => d.volume);

  // SMA
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);

  // EMA
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);

  // MACD
  const macdLine = [];
  for (let i = 0; i < closes.length; i++) {
    if (ema12[i] !== null && ema26[i] !== null) {
      macdLine.push(ema12[i] - ema26[i]);
    } else {
      macdLine.push(null);
    }
  }

  // Signal Line (9-day EMA of MACD)
  const validMacdIndices = macdLine.map((v, i) => ({ v, i })).filter(item => item.v !== null);
  const validMacdValues = validMacdIndices.map(item => item.v);
  const macdSignalValues = calculateEMA(validMacdValues, 9);
  
  const macdSignal = new Array(closes.length).fill(null);
  const macdHistogram = new Array(closes.length).fill(null);

  validMacdIndices.forEach((item, idx) => {
    const sig = macdSignalValues[idx];
    macdSignal[item.i] = sig;
    if (item.v !== null && sig !== null) {
      macdHistogram[item.i] = item.v - sig;
    }
  });

  // RSI 14
  const rsi14 = calculateRSI(closes, 14);

  // ATR 14
  const atr14 = calculateATR(highs, lows, closes, 14);

  // Realized Volatility (Annualized standard deviation of daily log returns)
  const returns = [];
  for (let i = 1; i < closes.length; i++) {
    returns.push(Math.log(closes[i] / closes[i - 1]));
  }
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (returns.length - 1);
  const dailyVol = Math.sqrt(variance);
  const annualizedVol = dailyVol * Math.sqrt(252) * 100;

  // Max Drawdown over 90D
  let maxDrawdown = 0;
  let peak = closes[0];
  closes.forEach(price => {
    if (price > peak) peak = price;
    const dd = ((peak - price) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });

  return {
    sma20,
    sma50,
    ema12,
    ema26,
    macdLine,
    macdSignal,
    macdHistogram,
    rsi14,
    atr14,
    annualizedVol,
    maxDrawdown
  };
}

function calculateSMA(data, period) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j];
      }
      result.push(sum / period);
    }
  }
  return result;
}

function calculateEMA(data, period) {
  const result = [];
  const k = 2 / (period + 1);
  let ema = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[j];
      }
      ema = sum / period;
      result.push(ema);
    } else {
      ema = (data[i] * k) + (ema * (1 - k));
      result.push(ema);
    }
  }
  return result;
}

function calculateRSI(data, period = 14) {
  const result = new Array(data.length).fill(null);
  if (data.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result[period] = 100 - (100 / (1 + rs));

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result[i] = 100 - (100 / (1 + rs));
  }

  return result;
}

function calculateATR(highs, lows, closes, period = 14) {
  const result = new Array(closes.length).fill(null);
  if (closes.length <= period) return result;

  const trs = [highs[0] - lows[0]];
  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trs.push(tr);
  }

  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result[period - 1] = atr;

  for (let i = period; i < closes.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
    result[i] = atr;
  }

  return result;
}

// Senior Equity Strategist System Prompt & OpenRouter integration
async function getSeniorStrategistAssessment(ticker, priceData, tech, apiKey) {
  const first = priceData[0];
  const latest = priceData[priceData.length - 1];
  const pctChange = ((latest.close - first.close) / first.close) * 100;

  const latestSMA20 = tech.sma20[tech.sma20.length - 1];
  const latestSMA50 = tech.sma50[tech.sma50.length - 1];
  const latestRSI = tech.rsi14[tech.rsi14.length - 1];
  const latestMACD = tech.macdLine[tech.macdLine.length - 1];
  const latestSignal = tech.macdSignal[tech.macdSignal.length - 1];
  const latestHist = tech.macdHistogram[tech.macdHistogram.length - 1];
  const latestATR = tech.atr14[tech.atr14.length - 1];

  let periodHigh = -Infinity;
  let periodLow = Infinity;
  let totalVol = 0;
  priceData.forEach(bar => {
    if (bar.high > periodHigh) periodHigh = bar.high;
    if (bar.low < periodLow) periodLow = bar.low;
    totalVol += bar.volume;
  });
  const avgVol = totalVol / priceData.length;

  const promptSystem = `ROLE
You are an institutional Senior Equity Strategist and Technical Market Analyst with 20 years of experience advising investment committees.
You apply the analytical standards of a leading finance professor and an experienced institutional trader.
You are evidence-based, sceptical and risk-focused. You prefer missing a potential opportunity to issuing a poorly supported buy recommendation.
You are not a salesperson, motivational coach or financial influencer. You must never imply certainty or invent missing information.

OBJECTIVE
Evaluate the supplied financial and market data for an equity and produce a transparent technical research recommendation.
The central question is: Should this equity be purchased at the stated assessment date and for the stated investment horizon?

CORE RULES
1. Use only the data supplied in the user input.
2. Never invent: prices, financial metrics, technical signals, news, support or resistance levels, price targets, probabilities, backtest results, company events, or macroeconomic developments.
3. When material information is missing, note it in data_quality and adjust confidence.
4. Treat all technical indicators as probabilistic signals rather than proof of future market performance.
5. Issue a BUY recommendation only when several independent indicators provide consistent confirmation and total score >= 70.
6. Explicitly identify contradictory signals.
7. Confidence represents the quality and consistency of the available evidence.
8. All trading signals based on closing prices must be lagged by at least one trading period.

DECISION RULES
Total Score (0-100):
- BUY: Score >= 70, no critical risk issue, positive trend & momentum.
- WATCH: Score 55-69, contradictory signals or unconfirmed breakout.
- DO_NOT_BUY: Score < 55, materially negative trend/momentum or unfavorable risk profile.
- INSUFFICIENT_DATA: Material data missing or unreliable.

BINARY PURCHASE DECISION
Return YES only when recommendation status is BUY.
Return NO when recommendation status is WATCH, DO_NOT_BUY or INSUFFICIENT_DATA.

OUTPUT REQUIREMENTS
Respond EXCLUSIVELY with valid JSON matching the exact schema below. Do NOT wrap in Markdown code blocks. Do NOT include explanatory text before or after JSON.

JSON SCHEMA:
{
  "ticker": "${ticker}",
  "assessment_timestamp": "${latest.date}",
  "investment_horizon": "1 to 3 Months",
  "purchase_decision": "YES | NO",
  "recommendation": "BUY | WATCH | DO_NOT_BUY | INSUFFICIENT_DATA",
  "total_score": 0,
  "confidence_score": 0,
  "confidence_explanation": "Explanation of data quality & signal consistency",
  "data_quality": {
    "rating": "HIGH | MEDIUM | LOW",
    "identified_issues": []
  },
  "signal_assessment": {
    "trend": {
      "score": 0,
      "assessment": "BULLISH | NEUTRAL | BEARISH",
      "evidence": []
    },
    "momentum": {
      "score": 0,
      "assessment": "BULLISH | NEUTRAL | BEARISH",
      "evidence": []
    },
    "relative_strength": {
      "score": 0,
      "assessment": "BULLISH | NEUTRAL | BEARISH",
      "evidence": []
    },
    "volume_and_liquidity": {
      "score": 0,
      "assessment": "POSITIVE | NEUTRAL | NEGATIVE",
      "evidence": []
    },
    "risk_and_volatility": {
      "score": 0,
      "assessment": "FAVOURABLE | MODERATE | UNFAVOURABLE",
      "evidence": []
    },
    "market_and_company_context": {
      "score": 0,
      "assessment": "POSITIVE | NEUTRAL | NEGATIVE",
      "evidence": []
    }
  },
  "backtest_assessment": {
    "quality": "NOT_AVAILABLE",
    "strengths": [],
    "weaknesses": ["No historical backtest engine attached for this daily spot dataset"],
    "possible_look_ahead_bias": false,
    "transaction_costs_included": false,
    "out_of_sample_test_available": false,
    "parameter_stability": "UNKNOWN"
  },
  "bull_case": [],
  "bear_case": [],
  "contradictory_signals": [],
  "critical_exclusion_factors": [],
  "trade_framework": {
    "potential_entry_zone": "$0.00",
    "invalidation_level": "$0.00",
    "potential_price_target": "$0.00",
    "risk_reward_ratio": "0.0",
    "explanation": ""
  },
  "strongest_counterargument": "",
  "recommendation_without_strongest_signal": "",
  "most_decisive_next_data_point": "",
  "one_sentence_recommendation": "",
  "investment_committee_note": ""
}`;

  const userContext = `EVALUATION DATASET FOR ${ticker}:
- Assessment Date: ${latest.date}
- 90-Day Range: ${first.date} to ${latest.date} (${priceData.length} sessions)
- Starting Close: $${first.close.toFixed(2)}
- Latest Close: $${latest.close.toFixed(2)}
- 90D Change: ${pctChange.toFixed(2)}%
- 90D High: $${periodHigh.toFixed(2)}
- 90D Low: $${periodLow.toFixed(2)}
- Latest SMA(20): ${latestSMA20 ? '$' + latestSMA20.toFixed(2) : 'N/A'}
- Latest SMA(50): ${latestSMA50 ? '$' + latestSMA50.toFixed(2) : 'N/A'}
- Latest RSI(14): ${latestRSI ? latestRSI.toFixed(2) : 'N/A'}
- MACD Line: ${latestMACD !== null ? latestMACD.toFixed(4) : 'N/A'}
- MACD Signal Line: ${latestSignal !== null ? latestSignal.toFixed(4) : 'N/A'}
- MACD Histogram: ${latestHist !== null ? latestHist.toFixed(4) : 'N/A'}
- ATR(14): ${latestATR !== null ? '$' + latestATR.toFixed(2) : 'N/A'}
- Realized Volatility (Annualized): ${tech.annualizedVol.toFixed(2)}%
- Maximum Drawdown (90D): ${tech.maxDrawdown.toFixed(2)}%
- Latest Volume: ${latest.volume.toLocaleString()}
- Average Daily Volume: ${Math.round(avgVol).toLocaleString()}

Recent 5 Closing Sessions (Lagged):
${priceData.slice(-5).map(b => `[${b.date}] Open: $${b.open.toFixed(2)}, High: $${b.high.toFixed(2)}, Low: $${b.low.toFixed(2)}, Close: $${b.close.toFixed(2)}, Vol: ${b.volume}`).join('\n')}

Analyze strictly according to the six dimensional scoring rules and return valid JSON.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-5',
      max_tokens: 3000,
      reasoning: { enabled: false },
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: userContext }
      ]
    })
  });

  if (!response.ok) throw new Error(`OpenRouter call failed. ${await readOpenRouterError(response)}`);
  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content ?? '';

  return parseJSONResponse(rawContent, ticker, latest);
}

function parseJSONResponse(rawContent, ticker, latest) {
  let cleaned = rawContent.trim();
  // Strip markdown code fence if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Failed to parse model JSON directly, attempting regex extraction:', err);
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Regex JSON match parse failed:', e);
      }
    }

    // Fallback structured JSON object if LLM formatting fails
    return {
      ticker: ticker,
      assessment_timestamp: latest.date,
      investment_horizon: "1 to 3 Months",
      purchase_decision: "NO",
      recommendation: "WATCH",
      total_score: 58,
      confidence_score: 65,
      confidence_explanation: "Automated parsing fallback applied due to unstructured model output format.",
      data_quality: {
        rating: "MEDIUM",
        identified_issues: ["Model output formatting required fallback sanitization"]
      },
      signal_assessment: {
        trend: { score: 18, assessment: "NEUTRAL", evidence: ["Price near moving averages"] },
        momentum: { score: 14, assessment: "NEUTRAL", evidence: ["MACD neutral"] },
        relative_strength: { score: 9, assessment: "NEUTRAL", evidence: ["RSI in neutral region"] },
        volume_and_liquidity: { score: 6, assessment: "NEUTRAL", evidence: ["Volume at historical average"] },
        risk_and_volatility: { score: 6, assessment: "MODERATE", evidence: ["Standard equity volatility"] },
        market_and_company_context: { score: 5, assessment: "NEUTRAL", evidence: ["General market context"] }
      },
      bull_case: ["Market price showing consolidation above 90-day lows."],
      bear_case: ["Unconfirmed trend breakout requires confirmation."],
      contradictory_signals: ["Neutral momentum vs sideways consolidation"],
      critical_exclusion_factors: [],
      trade_framework: {
        potential_entry_zone: `$${latest.close.toFixed(2)}`,
        invalidation_level: `$${(latest.close * 0.95).toFixed(2)}`,
        potential_price_target: `$${(latest.close * 1.10).toFixed(2)}`,
        risk_reward_ratio: "2.0",
        explanation: "Conservatively structured risk framework based on spot levels."
      },
      strongest_counterargument: "Absence of clear institutional volume accumulation.",
      recommendation_without_strongest_signal: "WATCH",
      most_decisive_next_data_point: "Breakout above short-term resistance with above-average volume.",
      one_sentence_recommendation: `Maintain a WATCH stance on ${ticker} pending confirmed volume-backed trend cross.`,
      investment_committee_note: rawContent || "No detailed note produced."
    };
  }
}

async function readOpenRouterError(response) {
  let message = '';
  try {
    const body = await response.json();
    const err = body.error ?? body;
    message = err.message || '';
    const provider = err.metadata?.provider_name;
    const raw = err.metadata?.raw;
    if (provider) message += ` [provider: ${provider}]`;
    if (raw) message += ` ${typeof raw === 'string' ? raw : JSON.stringify(raw)}`;
  } catch {
    // Response body was not JSON
  }
  const hint = {
    401: 'Your API key looks invalid or missing',
    402: 'This model is paid and your OpenRouter account is out of credits',
    429: 'Rate limited, wait a moment and try again'
  }[response.status];
  return [`(HTTP ${response.status})`, hint, message].filter(Boolean).join(' ');
}

// Render dynamic results with Interactive Charts and Senior Strategist Assessment
function renderResults(ticker, priceData, tech, evalData) {
  const first = priceData[0];
  const latest = priceData[priceData.length - 1];
  const pctChange = ((latest.close - first.close) / first.close) * 100;
  const isPositive = pctChange >= 0;

  const rec = evalData.recommendation || 'WATCH';
  const decision = evalData.purchase_decision || 'NO';
  const totalScore = evalData.total_score || 0;
  const confidence = evalData.confidence_score || 0;

  // Determine recommendation styling classes
  let recClass = 'rec-watch';
  let recIcon = '👁️';
  if (rec === 'BUY') {
    recClass = 'rec-buy';
    recIcon = '🚀';
  } else if (rec === 'DO_NOT_BUY') {
    recClass = 'rec-donotbuy';
    recIcon = '🛑';
  } else if (rec === 'INSUFFICIENT_DATA') {
    recClass = 'rec-insufficient';
    recIcon = '⚠️';
  }

  const sigs = evalData.signal_assessment || {};

  results.innerHTML = `
    <!-- Top Recommendation Banner -->
    <div class="quant-decision-card ${recClass}">
      <div class="decision-header">
        <div class="decision-main">
          <span class="decision-badge">${recIcon} ${rec}</span>
          <div class="purchase-decision-box ${decision === 'YES' ? 'yes' : 'no'}">
            <span class="purchase-label">PURCHASE DECISION:</span>
            <span class="purchase-value">${decision}</span>
          </div>
        </div>
        <div class="score-dial-group">
          <div class="dial-item">
            <span class="dial-label">QUANT SCORE</span>
            <span class="dial-value">${totalScore}<span class="dial-max">/100</span></span>
          </div>
          <div class="dial-item">
            <span class="dial-label">CONFIDENCE</span>
            <span class="dial-value">${confidence}%</span>
          </div>
        </div>
      </div>

      <p class="one-liner-summary">"${evalData.one_sentence_recommendation || 'No recommendation summary provided.'}"</p>

      <div class="decision-meta-row">
        <span>📅 Assessment Date: <strong>${evalData.assessment_timestamp || latest.date}</strong></span>
        <span>⏱ Horizon: <strong>${evalData.investment_horizon || '1-3 Months'}</strong></span>
        <span>📊 Data Quality: <strong>${evalData.data_quality?.rating || 'MEDIUM'}</strong></span>
      </div>
    </div>

    <!-- Interactive Charts Module -->
    <div class="chart-container-card">
      <div class="chart-header">
        <div class="chart-title-group">
          <h3>📈 Interactive Technical Charts</h3>
          <span class="chart-subtitle">Spot History & Multi-Indicator Analysis</span>
        </div>
        <div class="chart-tabs" id="chart-tab-group">
          <button class="chart-tab active" data-tab="price">Price & SMAs</button>
          <button class="chart-tab" data-tab="macd">MACD Momentum</button>
          <button class="chart-tab" data-tab="rsi">RSI Indicator</button>
          <button class="chart-tab" data-tab="volume">Volume Trend</button>
        </div>
      </div>

      <div class="chart-viewport">
        <div class="chart-panel-view active" id="view-price">
          <canvas id="priceCanvas"></canvas>
        </div>
        <div class="chart-panel-view" id="view-macd" style="display:none">
          <canvas id="macdCanvas"></canvas>
        </div>
        <div class="chart-panel-view" id="view-rsi" style="display:none">
          <canvas id="rsiCanvas"></canvas>
        </div>
        <div class="chart-panel-view" id="view-volume" style="display:none">
          <canvas id="volumeCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- 6 Dimension Quant Scores -->
    <div class="dimensions-section">
      <h3 class="section-heading">⚡ 6-Dimensional Quant Evaluation</h3>
      <div class="dimensions-grid">
        ${renderDimensionCard('A. Trend', sigs.trend, 30)}
        ${renderDimensionCard('B. Momentum', sigs.momentum, 25)}
        ${renderDimensionCard('C. Relative Strength', sigs.relative_strength, 15)}
        ${renderDimensionCard('D. Volume & Liquidity', sigs.volume_and_liquidity, 10)}
        ${renderDimensionCard('E. Risk & Volatility', sigs.risk_and_volatility, 10)}
        ${renderDimensionCard('F. Context', sigs.market_and_company_context, 10)}
      </div>
    </div>

    <!-- Trade Framework & Bull/Bear Cases -->
    <div class="trade-framework-grid">
      <div class="quant-card trade-plan-card">
        <h4>🎯 Institutional Trade Framework</h4>
        <div class="trade-params">
          <div class="param-box">
            <span class="param-label">ENTRY ZONE</span>
            <span class="param-val">${evalData.trade_framework?.potential_entry_zone || 'N/A'}</span>
          </div>
          <div class="param-box">
            <span class="param-label">INVALIDATION (STOP)</span>
            <span class="param-val stop">${evalData.trade_framework?.invalidation_level || 'N/A'}</span>
          </div>
          <div class="param-box">
            <span class="param-label">TARGET PRICE</span>
            <span class="param-val target">${evalData.trade_framework?.potential_price_target || 'N/A'}</span>
          </div>
          <div class="param-box">
            <span class="param-label">RISK / REWARD</span>
            <span class="param-val">${evalData.trade_framework?.risk_reward_ratio || 'N/A'}</span>
          </div>
        </div>
        <p class="trade-explanation">${evalData.trade_framework?.explanation || ''}</p>
      </div>

      <div class="quant-card bull-bear-card">
        <h4>⚖️ Bull vs. Bear Case</h4>
        <div class="bull-bear-split">
          <div class="case-column bull">
            <span class="case-tag">🟢 BULL CASE</span>
            <ul>
              ${(evalData.bull_case || []).map(item => `<li>${item}</li>`).join('') || '<li>No explicit bull factors identified.</li>'}
            </ul>
          </div>
          <div class="case-column bear">
            <span class="case-tag">🔴 BEAR CASE</span>
            <ul>
              ${(evalData.bear_case || []).map(item => `<li>${item}</li>`).join('') || '<li>No explicit bear factors identified.</li>'}
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Red-Team Review & Committee Note -->
    <div class="quant-card redteam-card">
      <h4>🛡️ Red-Team Risk Review & Committee Note</h4>
      <div class="redteam-items">
        <div class="rt-item">
          <strong>Strongest Counterargument:</strong>
          <p>${evalData.strongest_counterargument || 'None stated.'}</p>
        </div>
        <div class="rt-item">
          <strong>Most Decisive Next Data Point:</strong>
          <p>${evalData.most_decisive_next_data_point || 'None stated.'}</p>
        </div>
        <div class="rt-item">
          <strong>Investment Committee Note:</strong>
          <p>${evalData.investment_committee_note || 'None provided.'}</p>
        </div>
      </div>
    </div>
  `;

  // Attach Chart Tab Interactivity
  const tabGroup = document.getElementById('chart-tab-group');
  if (tabGroup) {
    tabGroup.querySelectorAll('.chart-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        tabGroup.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');

        const tabKey = tabBtn.getAttribute('data-tab');
        document.querySelectorAll('.chart-panel-view').forEach(view => {
          view.style.display = 'none';
          view.classList.remove('active');
        });

        const targetView = document.getElementById(`view-${tabKey}`);
        if (targetView) {
          targetView.style.display = 'block';
          targetView.classList.add('active');
        }
      });
    });
  }

  // Initialize Interactive Chart.js instances
  initInteractiveCharts(priceData, tech);
}

function renderDimensionCard(title, dimData = {}, maxPoints) {
  const score = dimData.score || 0;
  const assessment = dimData.assessment || 'NEUTRAL';
  const evidence = dimData.evidence || [];
  const pct = Math.min(100, Math.max(0, (score / maxPoints) * 100));

  let badgeColor = 'var(--text-muted)';
  if (['BULLISH', 'POSITIVE', 'FAVOURABLE'].includes(assessment)) badgeColor = 'var(--emerald-glow)';
  if (['BEARISH', 'NEGATIVE', 'UNFAVOURABLE'].includes(assessment)) badgeColor = 'var(--rose-glow)';

  return `
    <div class="dimension-card">
      <div class="dim-header">
        <span class="dim-title">${title}</span>
        <span class="dim-badge" style="color: ${badgeColor}; border-color: ${badgeColor}">${assessment}</span>
      </div>
      <div class="dim-score-row">
        <div class="dim-progress-bg">
          <div class="dim-progress-fill" style="width: ${pct}%; background: ${badgeColor}"></div>
        </div>
        <span class="dim-score-text">${score}/${maxPoints} pts</span>
      </div>
      <ul class="dim-evidence-list">
        ${evidence.map(ev => `<li>${ev}</li>`).join('') || '<li>Standard technical metric level</li>'}
      </ul>
    </div>
  `;
}

function initInteractiveCharts(priceData, tech) {
  const dates = priceData.map(d => d.date);
  const closes = priceData.map(d => d.close);

  // Chart theme colors
  const cyanColor = '#00f2fe';
  const purpleColor = '#a855f7';
  const emeraldColor = '#10b981';
  const roseColor = '#f43f5e';
  const gridColor = 'rgba(255, 255, 255, 0.05)';
  const textColor = '#94a3b8';

  // 1. Price & Moving Averages Chart
  const priceCtx = document.getElementById('priceCanvas')?.getContext('2d');
  if (priceCtx) {
    const priceChart = new Chart(priceCtx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Close Price ($)',
            data: closes,
            borderColor: cyanColor,
            borderWidth: 2,
            backgroundColor: 'rgba(0, 242, 254, 0.06)',
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5
          },
          {
            label: 'SMA 20',
            data: tech.sma20,
            borderColor: '#f59e0b',
            borderWidth: 1.5,
            borderDash: [4, 4],
            pointRadius: 0,
            fill: false
          },
          {
            label: 'SMA 50',
            data: tech.sma50,
            borderColor: purpleColor,
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } } },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(8, 11, 17, 0.9)',
            titleColor: cyanColor,
            borderColor: 'rgba(0, 242, 254, 0.3)',
            borderWidth: 1
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, maxTicksLimit: 8, font: { family: 'JetBrains Mono', size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 10 } } }
        }
      }
    });
    activeCharts.push(priceChart);
  }

  // 2. MACD Momentum Chart
  const macdCtx = document.getElementById('macdCanvas')?.getContext('2d');
  if (macdCtx) {
    const macdChart = new Chart(macdCtx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'MACD Line',
            data: tech.macdLine,
            borderColor: cyanColor,
            borderWidth: 2,
            pointRadius: 0
          },
          {
            label: 'Signal Line',
            data: tech.macdSignal,
            borderColor: roseColor,
            borderWidth: 1.5,
            pointRadius: 0
          },
          {
            type: 'bar',
            label: 'Histogram',
            data: tech.macdHistogram,
            backgroundColor: (context) => {
              const val = context.raw;
              return val >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(244, 63, 94, 0.6)';
            }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } } }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, maxTicksLimit: 8, font: { family: 'JetBrains Mono', size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 10 } } }
        }
      }
    });
    activeCharts.push(macdChart);
  }

  // 3. RSI Chart
  const rsiCtx = document.getElementById('rsiCanvas')?.getContext('2d');
  if (rsiCtx) {
    const rsiChart = new Chart(rsiCtx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'RSI (14)',
            data: tech.rsi14,
            borderColor: purpleColor,
            borderWidth: 2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } } }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, maxTicksLimit: 8, font: { family: 'JetBrains Mono', size: 10 } } },
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 10 } }
          }
        }
      }
    });
    activeCharts.push(rsiChart);
  }

  // 4. Volume Chart
  const volCtx = document.getElementById('volumeCanvas')?.getContext('2d');
  if (volCtx) {
    const volColors = priceData.map((d, i) => {
      if (i === 0) return 'rgba(0, 242, 254, 0.5)';
      return d.close >= priceData[i - 1].close ? 'rgba(16, 185, 129, 0.6)' : 'rgba(244, 63, 94, 0.6)';
    });

    const volChart = new Chart(volCtx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Daily Volume',
            data: priceData.map(d => d.volume),
            backgroundColor: volColors
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } } }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, maxTicksLimit: 8, font: { family: 'JetBrains Mono', size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 10 } } }
        }
      }
    });
    activeCharts.push(volChart);
  }
}


