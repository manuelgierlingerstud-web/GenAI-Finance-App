import { PORTFOLIO_UNIVERSE, STRATEGY_CAPITAL } from '../config/portfolio.js';
import { getTwelveDataKey, setTwelveDataKey, fetchBatchQuotes, fetchTimeSeries } from '../api/twelveData.js';
import { getOpenRouterKey, setOpenRouterKey, fetchTextResearch, extractStructuredSentiment, generateExecutiveCommentary } from '../api/openRouter.js';
import { calculateTechnicalScore, calculateTextScore, calculateCompositeScore } from '../quant/scoring.js';
import { calculatePortfolioWeights } from '../quant/weights.js';
import { escapeHTML, sanitizeUrl } from '../security/rendering.js';
import html2pdf from 'html2pdf.js';

export async function renderPortfolioView(container, currentLang = 'en') {
  const isDe = currentLang === 'de';

  container.innerHTML = `
    <div class="quant-card" style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(59, 130, 246, 0.3); padding: 2rem; border-radius: 16px; margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;">
        <div>
          <span style="font-size: 0.75rem; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.25rem 0.6rem; border-radius: 6px; font-weight: 600; text-transform: uppercase;">
            ${isDe ? 'Akademisches Mandat • USD 1.000.000' : 'Academic Mandate • USD 1,000,000 Strategy'}
          </span>
          <h2 style="margin: 0.5rem 0 0.25rem 0; font-size: 1.75rem; color: #f8fafc; font-weight: 700;">
            ${isDe ? 'KI & Halbleiter Portfolio Dashboard' : 'AI & Semiconductor Portfolio Dashboard'}
          </h2>
          <p style="margin: 0; font-size: 0.9rem; color: #94a3b8;">
            ${isDe ? 'Regelbasierte, signalgewichtete Portfolio-Konstruktion über 20 Kern- und Satellitenwerte.' : 'Finance Track — Rules-Based Signal-Weighted Portfolio across 20 core & satellite equities.'}
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button type="button" id="pdf-export-portfolio-btn" style="padding: 0.6rem 1.2rem; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
            ${isDe ? '📥 Portfolio PDF Export' : '📥 Export Portfolio PDF'}
          </button>
          <button type="button" id="refresh-portfolio-btn" style="padding: 0.6rem 1.2rem; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
            ${isDe ? '🔄 Marktdaten aktualisieren' : '🔄 Refresh Market Data'}
          </button>
        </div>
      </div>

      <!-- API Keys & Configuration Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; background: rgba(30, 41, 59, 0.5); padding: 1.25rem; border-radius: 10px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.06);">
        <div>
          <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.3rem; font-weight: 600;">Twelve Data API Key (Session)</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="password" id="portfolio-td-key" placeholder="Twelve Data API Key" value="${escapeHTML(getTwelveDataKey())}" style="flex: 1; padding: 0.5rem; background: rgba(15, 23, 42, 0.8); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 0.85rem;" />
            <button type="button" id="save-td-key-btn" style="padding: 0.5rem 0.9rem; background: #3b82f6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Save</button>
          </div>
        </div>
        <div>
          <label style="display: block; font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.3rem; font-weight: 600;">OpenRouter API Key (Session)</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="password" id="portfolio-or-key" placeholder="sk-or-v1-..." value="${escapeHTML(getOpenRouterKey())}" style="flex: 1; padding: 0.5rem; background: rgba(15, 23, 42, 0.8); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 0.85rem;" />
            <button type="button" id="save-or-key-btn" style="padding: 0.5rem 0.9rem; background: #3b82f6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">Save</button>
          </div>
        </div>
        <div style="display: flex; align-items: flex-end; gap: 0.5rem;">
          <button type="button" id="refresh-text-signals-btn" style="flex: 1; padding: 0.5rem; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
            ${isDe ? '🧠 Text-Signale aktualisieren' : '🧠 Refresh Text Signals'}
          </button>
        </div>
      </div>

      <!-- Portfolio Summary Metrics -->
      <div id="portfolio-metrics-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">${isDe ? 'Strategie Kapital' : 'Strategy Capital'}</div>
          <div style="font-size: 1.35rem; font-weight: 700; color: #f8fafc; margin-top: 0.2rem;">USD 1,000,000</div>
          <div style="font-size: 0.75rem; color: #34d399; margin-top: 0.2rem;">20 Equities (10 Core + 10 Satellites)</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">${isDe ? 'Datenstatus & Abdeckung' : 'Data Status & Coverage'}</div>
          <div id="portfolio-coverage-text" style="font-size: 1.35rem; font-weight: 700; color: #f8fafc; margin-top: 0.2rem;">Loading Market Data...</div>
          <div style="font-size: 0.75rem; color: #93c5fd; margin-top: 0.2rem;">Twelve Data & sessionStorage</div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.78rem; color: #94a3b8; text-transform: uppercase;">${isDe ? 'Letzte Aktualisierung' : 'Last Refresh'}</div>
          <div id="portfolio-refresh-time" style="font-size: 1.1rem; font-weight: 700; color: #f8fafc; margin-top: 0.2rem;">Not yet refreshed</div>
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
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>

      <!-- Human Review Surface & Executive Commentary -->
      <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(59, 130, 246, 0.3); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
        <h3 style="margin-top: 0; color: #f8fafc; font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem;">
          🛡️ ${isDe ? 'Menschliche Überprüfung & Executive Commentary' : 'Human Review Surface & Executive Commentary'}
        </h3>
        <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 1rem;">
          ${isDe ? 'Bitte prüfen Sie die Portfoliokennzahlen und bestätigen Sie die Überprüfung, um die KI-gestützte Executive Summary für das Investmentkomitee freizuschalten.' : 'Verify portfolio metrics and evidence coverage before generating LLM executive commentary.'}
        </p>

        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <input type="checkbox" id="review-confirm-checkbox" style="width: 18px; height: 18px; cursor: pointer;" />
          <label for="review-confirm-checkbox" style="font-size: 0.9rem; color: #f8fafc; cursor: pointer; font-weight: 500;">
            ${isDe ? 'Ich habe die Portfoliowerte, technischen Scores und Datenabdeckungen geprüft.' : 'I have reviewed the portfolio evidence, technical scores, and data coverage.'}
          </label>
        </div>

        <button type="button" id="generate-commentary-btn" disabled style="padding: 0.65rem 1.25rem; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.88rem; cursor: pointer; opacity: 0.5; transition: all 0.2s;">
          ${isDe ? '✨ Executive Commentary generieren' : '✨ Generate Executive Commentary'}
        </button>

        <div id="executive-commentary-result" style="margin-top: 1.5rem; display: none;"></div>
      </div>
    </div>
  `;

  // Wire up event listeners and load initial portfolio data
  setupPortfolioLogic(container, currentLang);
}

function setupPortfolioLogic(container, currentLang) {
  const tdKeyInput = container.querySelector('#portfolio-td-key');
  const orKeyInput = container.querySelector('#portfolio-or-key');
  const saveTdBtn = container.querySelector('#save-td-key-btn');
  const saveOrBtn = container.querySelector('#save-or-key-btn');
  const refreshBtn = container.querySelector('#refresh-portfolio-btn');
  const refreshTextBtn = container.querySelector('#refresh-text-signals-btn');
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
    generateCommentaryBtn.textContent = 'Generating Commentary via Claude 3.5 Sonnet...';
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
      generateCommentaryBtn.textContent = '✨ Generate Executive Commentary';
      generateCommentaryBtn.disabled = false;
    }
  });

  exportPdfBtn.addEventListener('click', () => {
    exportPdfBtn.textContent = 'Generating PDF...';
    exportPdfBtn.disabled = true;
    const opt = {
      margin: 10,
      filename: 'AI_Semiconductor_Portfolio_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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

  // Initial load
  loadPortfolioData(container);
}

async function loadPortfolioData(container) {
  const tbody = container.querySelector('#portfolio-table-body');
  const coverageText = container.querySelector('#portfolio-coverage-text');
  const refreshTime = container.querySelector('#portfolio-refresh-time');

  tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: #94a3b8;">Loading 20 stocks data from Twelve Data...</td></tr>`;

  const symbols = PORTFOLIO_UNIVERSE.map(s => s.ticker);
  let quotes = {};
  let priceHistories = {};

  try {
    quotes = await fetchBatchQuotes(symbols);
  } catch (err) {
    console.warn('Batch quote fetch warning:', err);
  }

  const scoredStocks = [];
  let validCount = 0;

  for (const stock of PORTFOLIO_UNIVERSE) {
    let priceData = [];
    let hasValidData = false;
    let latestPrice = 100.0;
    let dailyChangePct = 1.2;

    try {
      priceData = await fetchTimeSeries(stock.ticker, 90);
      if (priceData && priceData.length >= 20) {
        hasValidData = true;
        validCount++;
        latestPrice = priceData[priceData.length - 1].close;
        const prevClose = priceData[priceData.length - 2]?.close || latestPrice;
        dailyChangePct = ((latestPrice - prevClose) / prevClose) * 100;
      }
    } catch (e) {
      console.warn(`Failed to fetch history for ${stock.ticker}:`, e);
    }

    priceHistories[stock.ticker] = priceData;

    // Technical score calculation
    const techResult = calculateTechnicalScore(priceData);
    const annVol = techResult.metrics?.annualizedVolatility || 0.3;
    const textResult = { available: false, score: null }; // default without live text fetch
    const compositeResult = calculateCompositeScore(techResult.score, textResult);

    scoredStocks.push({
      ticker: stock.ticker,
      name: stock.name,
      role: stock.role,
      core: stock.core,
      latestPrice,
      dailyChangePct,
      technicalScore: techResult.score,
      textLabel: 'N/A',
      compositeScore: compositeResult.compositeScore,
      signalLabel: compositeResult.signalLabel,
      annualizedVolatility: annVol,
      hasValidData
    });
  }

  // Calculate portfolio weights across 20 stocks
  const portfolioWeights = calculatePortfolioWeights(scoredStocks);

  // Render Table Rows
  tbody.innerHTML = '';
  scoredStocks.forEach((stock, idx) => {
    const alloc = portfolioWeights.allocations.find(a => a.ticker === stock.ticker);
    const weightPct = ((alloc?.weight || 0) * 100).toFixed(2) + '%';
    const usdAlloc = '$' + (alloc?.usdAllocation || 0).toLocaleString();
    const isCore = stock.core;

    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.2s;';
    tr.innerHTML = `
      <td style="padding: 0.75rem;">
        <span style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; background: ${isCore ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)'}; color: ${isCore ? '#60a5fa' : '#94a3b8'};">
          ${isCore ? 'CORE THESIS' : 'SATELLITE'}
        </span>
      </td>
      <td style="padding: 0.75rem; font-weight: 700; color: #f8fafc;">${stock.ticker}</td>
      <td style="padding: 0.75rem;">
        <div style="font-weight: 600; color: #e2e8f0;">${escapeHTML(stock.name)}</div>
        <div style="font-size: 0.75rem; color: #94a3b8;">${escapeHTML(stock.role)}</div>
      </td>
      <td style="padding: 0.75rem; text-align: right; font-family: monospace; color: #f8fafc;">$${stock.latestPrice.toFixed(2)}</td>
      <td style="padding: 0.75rem; text-align: right; font-weight: 600; color: #38bdf8;">${stock.technicalScore}</td>
      <td style="padding: 0.75rem; text-align: center;">
        <span style="font-size: 0.75rem; color: #94a3b8;">Pending text refresh</span>
      </td>
      <td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #f8fafc;">${stock.compositeScore}</td>
      <td style="padding: 0.75rem; text-align: center;">
        <span style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; background: ${stock.signalLabel === 'OVERWEIGHT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)'}; color: ${stock.signalLabel === 'OVERWEIGHT' ? '#34d399' : '#facc15'};">
          ${stock.signalLabel}
        </span>
      </td>
      <td style="padding: 0.75rem; text-align: right; font-weight: 600; color: #f8fafc;">${weightPct}</td>
      <td style="padding: 0.75rem; text-align: right; font-family: monospace; font-weight: 700; color: #34d399;">${usdAlloc}</td>
    `;
    tbody.appendChild(tr);
  });

  coverageText.textContent = `${validCount} / 20 Equities Active`;
  refreshTime.textContent = new Date().toLocaleTimeString();

  // Store review surface for LLM commentary
  window.__lastPortfolioReviewSurface = {
    strategyCapital: STRATEGY_CAPITAL,
    validEquitiesCount: validCount,
    timestamp: new Date().toISOString(),
    allocations: portfolioWeights.allocations,
    scoredStocks
  };
}
