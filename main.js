// GenAI Finance course, starter scaffold.
// No API keys are stored in this file. Both the Twelve Data key and the
// OpenRouter key are entered in the form fields at run time.

const form = document.getElementById('ticker-form');
const results = document.getElementById('results');
const tickerInput = document.getElementById('ticker');

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

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const ticker = tickerInput.value.trim().toUpperCase();
  const twelveDataKey = document.getElementById('twelvedata-key').value.trim();
  const openRouterKey = document.getElementById('openrouter-key').value.trim();

  results.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <div class="loading-text">PROCESSING QUANT DATA FOR ${ticker}...</div>
    </div>
  `;

  try {
    const priceData = await fetchPriceData(ticker, twelveDataKey);
    const note = await getResearchNote(ticker, priceData, openRouterKey);
    renderResults(ticker, priceData, note);
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

// OpenRouter call
async function getResearchNote(ticker, priceData, apiKey) {
  const first = priceData[0];
  const latest = priceData[priceData.length - 1];
  const pctChange = ((latest.close - first.close) / first.close) * 100;

  const summary =
    `${ticker} daily closes from ${first.date} to ${latest.date}: ` +
    `start $${first.close.toFixed(2)}, latest $${latest.close.toFixed(2)}, ` +
    `change ${pctChange.toFixed(1)}% over ${priceData.length} trading days.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-5',
      max_tokens: 2000,
      reasoning: { enabled: false },
      messages: [
        { role: 'system', content: 'You are a financial research assistant. Be concise and factual.' },
        { role: 'user', content: `${summary}\n\nWrite a one paragraph research note for ${ticker} based on this recent price action.` }
      ]
    })
  });

  if (!response.ok) throw new Error(`OpenRouter call failed. ${await readOpenRouterError(response)}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'No response.';
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

function renderResults(ticker, priceData, note) {
  const first = priceData[0];
  const latest = priceData[priceData.length - 1];
  const pctChange = ((latest.close - first.close) / first.close) * 100;
  const isPositive = pctChange >= 0;

  let periodHigh = -Infinity;
  let periodLow = Infinity;
  let totalVol = 0;

  priceData.forEach((bar) => {
    if (bar.high > periodHigh) periodHigh = bar.high;
    if (bar.low < periodLow) periodLow = bar.low;
    totalVol += bar.volume;
  });

  const avgVol = totalVol / priceData.length;

  results.innerHTML = `
    <div class="results-header">
      <div class="results-ticker-title">
        <h2>${ticker}</h2>
        <span class="change-badge ${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '▲' : '▼'} ${Math.abs(pctChange).toFixed(2)}% (90D)
        </span>
      </div>
      <div class="status-badge" style="background: rgba(0, 242, 254, 0.1); border-color: rgba(0, 242, 254, 0.3); color: var(--cyan-glow)">
        LAST CLOSE: $${latest.close.toFixed(2)}
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">LATEST CLOSE</span>
        <span class="metric-value">$${latest.close.toFixed(2)}</span>
        <span class="metric-sub">${latest.date}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">90D HIGH</span>
        <span class="metric-value" style="color: var(--emerald-glow)">$${periodHigh.toFixed(2)}</span>
        <span class="metric-sub">Peak valuation</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">90D LOW</span>
        <span class="metric-value" style="color: var(--rose-glow)">$${periodLow.toFixed(2)}</span>
        <span class="metric-sub">Trough valuation</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">AVG DAILY VOL</span>
        <span class="metric-value">${(avgVol / 1000000).toFixed(2)}M</span>
        <span class="metric-sub">${priceData.length} sessions</span>
      </div>
    </div>

    <div class="note-container">
      <div class="note-header">
        <span class="ai-badge">NEURAL SYNTHESIS</span>
        <span class="note-title">AI Research Synthesis</span>
      </div>
      <p class="note-text">${note}</p>
    </div>
  `;
}

