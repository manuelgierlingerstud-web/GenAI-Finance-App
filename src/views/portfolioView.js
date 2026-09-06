import { PORTFOLIO_UNIVERSE, STRATEGY_CAPITAL } from '../config/portfolio.js';
import { getTwelveDataKey, setTwelveDataKey, fetchTimeSeries } from '../api/twelveData.js';
import { getOpenRouterKey, setOpenRouterKey, generateExecutiveCommentary } from '../api/openRouter.js';
import { calculateTechnicalScore, calculateCompositeScore } from '../quant/scoring.js';
import { calculatePortfolioWeights } from '../quant/weights.js';
import { escapeHTML, sanitizeUrl } from '../security/rendering.js';
import html2pdf from 'html2pdf.js';

export async function renderPortfolioView(container) {
  container.innerHTML = `
    <div class="quant-card" style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(59, 130, 246, 0.3); padding: 2rem; border-radius: 16px; margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;">
        <div>
          <span style="font-size: 0.75rem; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 600; text-transform: uppercase;">
            Academic Mandate • USD 1,000,000 Strategy
          </span>
          <h2 style="margin: 0.5rem 0 0.25rem 0; font-size: 1.75rem; color: #f8fafc; font-weight: 700;">
            AI & Semiconductor Portfolio Dashboard
          </h2>
          <p style="margin: 0; font-size: 0.9rem; color: #94a3b8;">
            Finance Track — Rules-Based Signal-Weighted Portfolio; not mean-variance optimized.
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button type="button" id="pdf-export-portfolio-btn" style="padding: 0.6rem 1.2rem; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
            📥 Export Portfolio PDF
          </button>
          <button type="button" id="refresh-portfolio-btn" style="padding: 0.6rem 1.2rem; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
            🔄 Refresh Market Data
          </button>
        </div>
      </div>

      <!-- API Keys & Configuration Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; background: rgba(30, 41, 59, 0.5); padding: 1.25rem; border-radius: 10px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.06);">
        <div>
          <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.3rem; font-weight: 600;">Twelve Data API Key (Session Storage)</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="password" id="portfolio-td-key" placeholder="Enter Twelve Data API Key" value="${escapeHTML(getTwelveDataKey())}" style="flex: 1; padding: 0.5rem; background: rgba(15, 23, 42, 0.8); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 0.85rem;" />
            <button type="button" id="save-td-key-btn" style="padding: 0.5rem 0.9rem; background: #3b82f6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Save</button>
          </div>
        </div>
        <div>
          <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.3rem; font-weight: 600;">OpenRouter API Key (Session Storage)</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="password" id="portfolio-or-key" placeholder="sk-or-v1-..." value="${escapeHTML(getOpenRouterKey())}" style="flex: 1; padding: 0.5rem; background: rgba(15, 23, 42, 0.8); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 0.85rem;" />
            <button type="button" id="save-or-key-btn" style="padding: 0.5rem 0.9rem; background: #3b82f6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Save</button>
          </div>
        </div>
      </div>

      <div id="text-pipeline-progress" style="margin-bottom: 1rem; font-size: 0.85rem; color: #38bdf8; display: none;"></div>

      <!-- Portfolio Summary Metrics -->
      <div id="portfolio-metrics-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">Strategy Capital</div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #f8fafc; margin-top: 0.2rem;">USD 1,000,000</div>
          <div style="font-size: 0.75rem; color: #34d399; margin-top: 0.2rem;">20 Equities + Cash Buffer</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">Data Status & Coverage</div>
          <div id="portfolio-coverage-text" style="font-size: 1.35rem; font-weight: 700; color: #f8fafc; margin-top: 0.2rem;">Awaiting Key Config</div>
          <div style="font-size: 0.75rem; color: #93c5fd; margin-top: 0.2rem;">Twelve Data session storage</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">Last Refresh</div>
          <div id="portfolio-refresh-time" style="font-size: 1.1rem; font-weight: 700; color: #f8fafc; margin-top: 0.2rem;">Not yet loaded</div>
          <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.2rem;">Cache TTL: 15 mins</div>
        </div>
      </div>

      <!-- Portfolio Table -->
      <div style="overflow-x: auto; margin-bottom: 2rem;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.15); color: #94a3b8; font-size: 0.78rem; text-transform: uppercase;">
              <th style="padding: 0.75rem;">Classification</th>
              <th style="padding: 0.75rem;">Ticker</th>
              <th style="padding: 0.75rem;">Company & AI Role</th>
              <th style="padding: 0.75rem; text-align: right;">Price</th>
              <th style="padding: 0.75rem; text-align: right;">Tech Score</th>
              <th style="padding: 0.75rem; text-align: center;">Text Signal</th>
              <th style="padding: 0.75rem; text-align: right;">Composite</th>
              <th style="padding: 0.75rem; text-align: center;">Signal</th>
              <th style="padding: 0.75rem; text-align: right;">Target Weight</th>
              <th style="padding: 0.75rem; text-align: right;">USD Allocation</th>
            </tr>
          </thead>
          <tbody id="portfolio-table-body">
            <tr><td colspan="10" style="text-align: center; padding: 2rem; color: #94a3b8;">Enter Twelve Data API key in configuration above or click Refresh Market Data to load.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Human Review Surface & Executive Commentary -->
      <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(59, 130, 246, 0.3); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
        <h3 style="margin-top: 0; color: #f8fafc; font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem;">
          🛡️ Human Review Surface & Executive Commentary
        </h3>
        <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 1rem;">
          Verify portfolio metrics, weights, and evidence coverage before generating LLM executive commentary.
        </p>

        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <input type="checkbox" id="review-confirm-checkbox" style="width: 18px; height: 18px; cursor: pointer;" />
          <label for="review-confirm-checkbox" style="font-size: 0.9rem; color: #f8fafc; cursor: pointer; font-weight: 500;">
            I have reviewed the portfolio evidence, technical scores, and data coverage.
          </label>
        </div>

        <button type="button" id="generate-commentary-btn" disabled style="padding: 0.65rem 1.25rem; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.88rem; cursor: pointer; opacity: 0.5; transition: all 0.2s;">
          ✨ Generate Executive Commentary via Claude Sonnet 5
        </button>

        <div id="executive-commentary-result" style="margin-top: 1.5rem; display: none;"></div>
      </div>
    </div>
  `;

  setupPortfolioLogic(container);
}

function setupPortfolioLogic(container) {
  const tdKeyInput = container.querySelector('#portfolio-td-key');
  const orKeyInput = container.querySelector('#portfolio-or-key');
  const saveTdBtn = container.querySelector('#save-td-key-btn');
  const saveOrBtn = container.querySelector('#save-or-key-btn');
  const refreshBtn = container.querySelector('#refresh-portfolio-btn');
  const exportPdfBtn = container.querySelector('#pdf-export-portfolio-btn');
  const reviewCheckbox = container.querySelector('#review-confirm-checkbox');
  const generateCommentaryBtn = container.querySelector('#generate-commentary-btn');

  saveTdBtn.addEventListener('click', () => {
    setTwelveDataKey(tdKeyInput.value);
    alert('Twelve Data API key saved to session storage.');
    loadPortfolioData(container);
  });

  saveOrBtn.addEventListener('click', () => {
    setOpenRouterKey(orKeyInput.value);
    alert('OpenRouter API key saved to session storage.');
  });

  refreshBtn.addEventListener('click', () => {
    loadPortfolioData(container);
  });

  reviewCheckbox.addEventListener('change', () => {
    if (reviewCheckbox.checked) {
      generateCommentaryBtn.disabled = false;
      generateCommentaryBtn.style.opacity = '1';
    } else {
      generateCommentaryBtn.disabled = true;
      generateCommentaryBtn.style.opacity = '0.5';
    }
  });

  generateCommentaryBtn.addEventListener('click', async () => {
    const orKey = getOpenRouterKey();
    if (!orKey) {
      alert('OpenRouter API key required to generate executive commentary.');
      return;
    }
    generateCommentaryBtn.textContent = 'Generating Commentary via Claude Sonnet 5...';
    generateCommentaryBtn.disabled = true;

    try {
      const reviewSurface = window.__lastPortfolioReviewSurface || { note: 'Portfolio review surface' };
      const commentary = await generateExecutiveCommentary(reviewSurface);
      const resContainer = container.querySelector('#executive-commentary-result');
      resContainer.style.display = 'block';
      resContainer.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(16, 185, 129, 0.4); padding: 1.25rem; border-radius: 10px;">
          <h4 style="margin-top: 0; color: #34d399;">Executive Overview</h4>
          <p style="color: #cbd5e1; font-size: 0.9rem;">${escapeHTML(commentary.executive_overview)}</p>
          <h5 style="color: #60a5fa; margin-bottom: 0.25rem;">Main Supporting Signals</h5>
          <ul style="color: #cbd5e1; font-size: 0.88rem; margin-top: 0;">
            ${(commentary.main_supporting_signals || []).map(s => `<li>${escapeHTML(s)}</li>`).join('')}
          </ul>
          <h5 style="color: #f87171; margin-bottom: 0.25rem;">Main Portfolio Risks</h5>
          <ul style="color: #cbd5e1; font-size: 0.88rem; margin-top: 0;">
            ${(commentary.main_portfolio_risks || []).map(r => `<li>${escapeHTML(r)}</li>`).join('')}
          </ul>
        </div>
      `;
    } catch (err) {
      console.error(err);
      alert(`Failed to generate commentary: ${err.message}`);
    } finally {
      generateCommentaryBtn.textContent = '✨ Generate Executive Commentary via Claude Sonnet 5';
      generateCommentaryBtn.disabled = false;
    }
  });

  exportPdfBtn.addEventListener('click', () => {
    exportPdfBtn.textContent = 'Generating Landscape PDF...';
    exportPdfBtn.disabled = true;
    const opt = {
      margin: 10,
      filename: 'AI_Semiconductor_Portfolio_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().from(container).set(opt).save().then(() => {
      exportPdfBtn.textContent = '📥 Export Portfolio PDF';
      exportPdfBtn.disabled = false;
    }).catch(err => {
      console.error(err);
      exportPdfBtn.textContent = '📥 Export Portfolio PDF';
      exportPdfBtn.disabled = false;
    });
  });

  if (getTwelveDataKey()) {
    loadPortfolioData(container);
  }
}

async function loadPortfolioData(container) {
  const tbody = container.querySelector('#portfolio-table-body');
  const coverageText = container.querySelector('#portfolio-coverage-text');
  const refreshTime = container.querySelector('#portfolio-refresh-time');
  const refreshBtn = container.querySelector('#refresh-portfolio-btn');

  const apiKey = getTwelveDataKey();
  if (!apiKey) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: #f87171;">Twelve Data API key required. Please enter your key in session storage above.</td></tr>`;
    coverageText.textContent = 'Key Missing';
    return;
  }

  if (refreshBtn) refreshBtn.disabled = true;
  tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: #94a3b8;">Loading portfolio universe (rate-aware queue)...</td></tr>`;

  const scoredStocks = [];
  let loadedCount = 0;
  let cachedCount = 0;
  let errorCount = 0;

  const uncachedStocks = [];
  const stockResultsMap = new Map();

  for (const stock of PORTFOLIO_UNIVERSE) {
    const cacheKey = `cache_ts_${stock.ticker}`;
    const cachedItem = sessionStorage.getItem(cacheKey);
    if (cachedItem) {
      try {
        const parsed = JSON.parse(cachedItem);
        if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < 15 * 60 * 1000)) {
          stockResultsMap.set(stock.ticker, { priceData: parsed.data, cached: true });
          cachedCount++;
          continue;
        }
      } catch {
        // invalid cache
      }
    }
    uncachedStocks.push(stock);
  }

  const batchSize = 8;
  for (let i = 0; i < uncachedStocks.length; i += batchSize) {
    const batch = uncachedStocks.slice(i, i + batchSize);
    coverageText.textContent = `Loading ${loadedCount + cachedCount + batch.length} of 20 (${cachedCount} cached)...`;

    for (const stock of batch) {
      let success = false;
      let retries = 2;
      while (retries > 0 && !success) {
        try {
          const priceData = await fetchTimeSeries(stock.ticker, 90);
          if (priceData && priceData.length >= 20) {
            stockResultsMap.set(stock.ticker, { priceData, cached: false });
            sessionStorage.setItem(`cache_ts_${stock.ticker}`, JSON.stringify({ data: priceData, timestamp: Date.now() }));
            loadedCount++;
            success = true;
          } else {
            throw new Error('Insufficient historical bars');
          }
        } catch (err) {
          const isRateLimit = err.message.includes('429') || err.message.includes('limit') || err.message.includes('credits');
          if (isRateLimit && retries > 1) {
            coverageText.textContent = `Rate limit (429) on ${stock.ticker} — waiting 15s for quota reset...`;
            await new Promise(r => setTimeout(r, 15000));
            retries--;
          } else {
            stockResultsMap.set(stock.ticker, { priceData: [], cached: false, error: err.message });
            errorCount++;
            success = true;
          }
        }
      }
    }

    if (i + batchSize < uncachedStocks.length) {
      coverageText.textContent = `Quota pause — waiting 12s before next batch...`;
      await new Promise(r => setTimeout(r, 12000));
    }
  }

  for (const stock of PORTFOLIO_UNIVERSE) {
    const res = stockResultsMap.get(stock.ticker) || { priceData: [], cached: false };
    const priceData = res.priceData;
    const hasValidData = priceData && priceData.length >= 20;
    const latestPrice = hasValidData ? priceData[priceData.length - 1].close : null;

    const techResult = calculateTechnicalScore(priceData);
    const annVol = techResult.metrics?.annualizedVolatility || 0.3;
    const textResult = { available: false, score: 50 };
    const compositeResult = calculateCompositeScore(techResult.score, textResult);

    scoredStocks.push({
      ticker: stock.ticker,
      name: stock.name,
      role: stock.role,
      core: stock.core,
      latestPrice,
      technicalScore: hasValidData ? techResult.score : null,
      textResult,
      compositeScore: compositeResult.compositeScore,
      annualizedVolatility: annVol,
      signalLabel: compositeResult.signalLabel,
      hasValidData
    });
  }

  const portfolioWeights = calculatePortfolioWeights(scoredStocks);
  renderPortfolioTable(container, scoredStocks, portfolioWeights);

  const activeCount = scoredStocks.filter(s => s.hasValidData).length;
  coverageText.textContent = `${activeCount} loaded (${cachedCount} cached, ${errorCount} errors)`;
  refreshTime.textContent = new Date().toLocaleTimeString();
  if (refreshBtn) refreshBtn.disabled = false;

  window.__lastPortfolioReviewSurface = {
    strategy_capital: STRATEGY_CAPITAL,
    active_positions: activeCount,
    cash_allocation_pct: (portfolioWeights.cashAllocation * 100).toFixed(2),
    cash_usd_allocation: portfolioWeights.cashUsdAllocation,
    allocations: portfolioWeights.allocations
  };
}

function renderPortfolioTable(container, scoredStocks, portfolioWeights) {
  const tbody = container.querySelector('#portfolio-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  const allocMap = new Map();
  portfolioWeights.allocations.forEach(a => allocMap.set(a.ticker, a));

  scoredStocks.forEach(stock => {
    const alloc = allocMap.get(stock.ticker) || { weight: 0, usdAllocation: 0 };
    const isCore = stock.core;
    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.2s;';

    const signalColor = stock.signalLabel === 'OVERWEIGHT' ? '#34d399' : (stock.signalLabel === 'UNDERWEIGHT' ? '#f87171' : '#facc15');
    const signalBg = stock.signalLabel === 'OVERWEIGHT' ? 'rgba(16, 185, 129, 0.2)' : (stock.signalLabel === 'UNDERWEIGHT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)');

    tr.innerHTML = `
      <td style="padding: 0.75rem;">
        <span style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; background: ${isCore ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)'}; color: ${isCore ? '#60a5fa' : '#94a3b8'};">
          ${isCore ? 'CORE' : 'SATELLITE'}
        </span>
      </td>
      <td style="padding: 0.75rem; font-weight: 700; color: #f8fafc;">${escapeHTML(stock.ticker)}</td>
      <td style="padding: 0.75rem; color: #cbd5e1;">
        <div style="font-weight: 600;">${escapeHTML(stock.name)}</div>
        <div style="font-size: 0.75rem; color: #94a3b8;">${escapeHTML(stock.role)}</div>
      </td>
      <td style="padding: 0.75rem; text-align: right; color: #f8fafc; font-family: monospace;">${stock.latestPrice ? '$' + stock.latestPrice.toFixed(2) : 'N/A'}</td>
      <td style="padding: 0.75rem; text-align: right; color: #f8fafc; font-family: monospace;">${stock.technicalScore !== null ? stock.technicalScore.toFixed(1) : 'N/A'}</td>
      <td style="padding: 0.75rem; text-align: center; color: #93c5fd; font-family: monospace;">${stock.textResult.available ? stock.textResult.score.toFixed(1) : 'N/A'}</td>
      <td style="padding: 0.75rem; text-align: right; color: #f8fafc; font-weight: 600; font-family: monospace;">${stock.hasValidData ? stock.compositeScore.toFixed(1) : 'N/A'}</td>
      <td style="padding: 0.75rem; text-align: center;">
        <span style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; background: ${signalBg}; color: ${signalColor};">
          ${stock.hasValidData ? stock.signalLabel : 'UNAVAILABLE'}
        </span>
      </td>
      <td style="padding: 0.75rem; text-align: right; color: #f8fafc; font-family: monospace;">${(alloc.weight * 100).toFixed(2)}%</td>
      <th style="padding: 0.75rem; text-align: right; color: #34d399; font-family: monospace; font-weight: 600;">USD ${alloc.usdAllocation.toLocaleString()}</th>
    `;
    tbody.appendChild(tr);
  });

  // Cash Row
  const cashTr = document.createElement('tr');
  cashTr.style.cssText = 'background: rgba(16, 185, 129, 0.08); border-top: 2px solid rgba(16, 185, 129, 0.3); font-weight: 700;';
  cashTr.innerHTML = `
    <td style="padding: 0.85rem;">
      <span style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(16, 185, 129, 0.2); color: #34d399;">CASH BUFFER</span>
    </td>
    <td style="padding: 0.85rem; color: #f8fafc;">CASH</td>
    <td style="padding: 0.85rem; color: #cbd5e1;">Risk-free liquidity reserve & unallocated weight</td>
    <td style="padding: 0.85rem; text-align: right; color: #f8fafc;">$1.00</td>
    <td style="padding: 0.85rem; text-align: right; color: #94a3b8;">N/A</td>
    <td style="padding: 0.85rem; text-align: center; color: #94a3b8;">N/A</td>
    <td style="padding: 0.85rem; text-align: right; color: #94a3b8;">N/A</td>
    <td style="padding: 0.85rem; text-align: center; color: #34d399;">LIQUID</td>
    <td style="padding: 0.85rem; text-align: right; color: #f8fafc; font-family: monospace;">${(portfolioWeights.cashAllocation * 100).toFixed(2)}%</td>
    <th style="padding: 0.85rem; text-align: right; color: #34d399; font-family: monospace; font-weight: 700;">USD ${portfolioWeights.cashUsdAllocation.toLocaleString()}</th>
  `;
  tbody.appendChild(cashTr);
}
