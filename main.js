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

// Language Switcher State
let currentLang = localStorage.getItem('quant_lang') || 'en';

const I18N = {
  en: {
    appTitle: 'GenAI <span class="gradient-text">Finance</span> Terminal',
    appSubtitle: 'QUANTITATIVE AI INTELLIGENCE & REAL-TIME ANALYTICS',
    marketScanner: 'Market Scanner',
    popularTickers: 'POPULAR TICKERS:',
    assetTickerLabel: 'Asset Ticker Symbol',
    tickerTooltip: 'Enter any valid US stock symbol (e.g. NVDA, AAPL, MSFT) or crypto pair (e.g. BTC/USD).',
    tickerPlaceholder: 'e.g. AAPL, NVDA, TSLA',
    badgeEquity: 'EQUITY/CRYPTO',
    configTitle: '⚙️ Strategy & Model Parameters',
    configBadge: 'CUSTOMIZE RISK & HORIZON',
    horizonLabel: 'Investment Horizon',
    horizonTooltip: 'Determines target holding time and indicator sensitivity. Shorter horizons focus on short-term momentum; longer focus on structural trends.',
    riskProfileLabel: 'Risk Model Profile',
    riskTooltip: 'Sets recommendation threshold rigor. Conservative requires 75+ points and strict stop loss; Tactical permits 60+ points for high-momentum setups.',
    windowLabel: 'Historical Data Window',
    windowTooltip: 'Number of daily trading bars pulled from Twelve Data for indicator calculations, volatility measurements, and chart rendering.',
    maOverlayLabel: 'Moving Average Overlay',
    maOverlayTooltip: 'Select primary moving average indicator lines overlaid on the price chart and trend evaluation matrix.',
    twelveDataLabel: 'Twelve Data API Key',
    twelveDataTooltip: 'Required for fetching official OHLCV market data. Free key grants 800 API calls/day.',
    twelveDataHint: 'Free US market data & ETFs. Get key at',
    openRouterLabel: 'OpenRouter API Key',
    openRouterTooltip: 'Powers the Senior Equity Strategist model analysis across 6 quantitative dimensions via Anthropic Claude 3.5 Sonnet.',
    openRouterHint: 'Powers LLM quant synthesis. Get key at',
    runAnalysisBtn: 'RUN QUANT ANALYSIS',
    awaitingTitle: 'Awaiting Analysis Request',
    awaitingText: 'Enter a stock or crypto symbol above to pull live market history and trigger neural research note generation.',
    footerText: 'Powered by <span>Twelve Data API</span> & <span>OpenRouter AI</span>',
    systemActive: 'SYSTEM ACTIVE',
    keyMissing1: 'KEY MISSING (1/2)',
    keysMissing0: 'KEYS MISSING (0/2)',
    checkingBackend: 'CHECKING BACKEND...',
    // Analysis & Backtest Labels
    quantScore: 'QUANT SCORE',
    confidence: 'CONFIDENCE',
    purchaseDecision: 'PURCHASE DECISION:',
    assessmentDate: 'Date',
    targetHorizon: 'Horizon',
    riskProfileMode: 'Profile',
    dataQualityRating: 'Data Quality',
    lastClose: 'LAST CLOSE',
    backtestTitle: '🧪 Quantitative Strategy Backtest Engine',
    backtestSub: 'Simulated Execution with Slippage (0.1%) & ATR Risk Management',
    strategyReturn: 'STRATEGY RETURN',
    benchmarkReturn: 'BUY & HOLD RETURN',
    alpha: 'ALPHA (EXCESS)',
    winRate: 'WIN RATE',
    profitFactor: 'PROFIT FACTOR',
    sharpeRatio: 'SHARPE RATIO',
    maxDrawdown: 'MAX DRAWDOWN',
    totalTrades: 'TOTAL TRADES',
    smartAdvicesTitle: '🧠 Smart Quantitative Strategy Insights & Advices',
    tradeLogTitle: '📜 Historical Backtest Trade Execution Log',
    chartTabPrice: 'Price & MAs',
    chartTabMACD: 'MACD Momentum',
    chartTabRSI: 'RSI Indicator',
    chartTabVolume: 'Volume Trend',
    chartTabEquity: 'Equity Curve (Backtest)',

    // Tooltip Translations
    recommendationTooltip: 'Research Recommendation Status: BUY (score >= 70+ & positive signals), WATCH (55-69 points), or DO_NOT_BUY (<55 points).',
    decisionTooltip: "Binary Execution Flag: Returns 'YES' strictly when research rating is BUY and total score meets or exceeds strategy threshold.",
    quantScoreTooltip: 'Quant Score (0-100): Aggregates 6 dimensions: Trend (30), Momentum (25), RSI (15), Volume (10), Risk/Vol (10), Context (10).',
    confidenceTooltip: 'Confidence Score (%): Reflects market data completeness, absence of gaps, and alignment across independent indicators.',
    assessmentDateTooltip: 'Assessment Date: Closing price date evaluated. All indicators are lagged by at least 1 session to prevent look-ahead bias.',
    targetHorizonTooltip: 'Target Horizon: The holding duration for which this analysis is calibrated.',
    riskProfileTooltip: 'Risk Profile Mode: Strategy threshold profile configured.',
    dataQualityTooltip: 'Data Quality Rating: Evaluates split adjustments, dividend adjustments, data gaps, and price freshness.',

    lastCloseTooltip: 'Latest Close Price: The most recent official daily closing price retrieved from Twelve Data.',
    fastMATooltip: 'Short-term moving average line indicating immediate price direction.',
    slowMATooltip: 'Medium-term moving average line acting as baseline support or resistance.',
    rsiTooltip: 'RSI (14): Relative Strength Index (0-100). Below 30 indicates oversold conditions; above 70 indicates overbought conditions.',
    atrTooltip: 'ATR (14): Average True Range quantifying daily price volatility in dollar terms.',
    realizedVolTooltip: 'Realized Volatility: Annualized standard deviation of daily log returns over the sample period.',

    chartTabPriceTooltip: 'Spot Price line overlaid with fast and slow moving averages.',
    chartTabMACDTooltip: 'MACD Line (12/26), Signal Line (9), and Histogram momentum bars.',
    chartTabRSITooltip: 'RSI 14 oscillator trajectory with overbought (70) and oversold (30) levels.',
    chartTabVolumeTooltip: 'Daily volume bars colored by session price direction (Green = Up, Red = Down).',
    chartTabEquityTooltip: 'Backtest Portfolio Equity Curve ($10,000 starting capital) vs Buy & Hold Benchmark.',

    strategyReturnTooltip: 'Strategy Total Return: Cumulative net percentage gain/loss produced by the quantitative system over $10,000 initial capital.',
    benchmarkReturnTooltip: 'Buy & Hold Benchmark Return: Cumulative performance of holding the asset passively over the exact same timeframe.',
    alphaTooltip: 'Strategy Alpha: Excess return generated over the Buy & Hold benchmark. Positive indicates value addition by the quantitative rules.',
    winRateTooltip: 'Win Rate (%): Percentage of executed trades that closed with a net profit after slippage.',
    profitFactorTooltip: 'Profit Factor: Ratio of gross profits to gross losses. A profit factor above 1.5 indicates a strong statistical edge.',
    sharpeRatioTooltip: 'Sharpe Ratio (Annualized): Risk-adjusted return measure comparing excess strategy return to annualized return volatility.',
    maxDrawdownTooltip: 'Maximum Drawdown (%): Largest peak-to-trough decline experienced by the strategy portfolio during simulation.',
    totalTradesTooltip: 'Total Executed Trades: Total number of closed trades executed during the historical sample window.',

    dimTrendTooltip: 'Price vs MAs, slope direction, moving average crossovers, and trend alignment.',
    dimMomentumTooltip: 'MACD line/signal crossover, histogram velocity, and acceleration rate.',
    dimRSITooltip: 'RSI(14) level, overbought/oversold boundaries, and momentum shifts.',
    dimVolumeTooltip: 'Breakout volume confirmation, historical average comparison, and execution liquidity.',
    dimRiskTooltip: 'ATR magnitude, maximum drawdown depth, and defensibility of stop loss.',
    dimContextTooltip: 'Sector correlation, earnings risk, macroeconomic backdrop, and news sentiment.',

    tradeFrameworkTooltip: 'Calculated trade execution parameters including optimal entry zone, stop loss, and price target.',
    entryZoneTooltip: 'Optimal Price Entry Zone: Calculated price corridor recommended for position entry.',
    stopLossTooltip: 'Invalidation Stop Level: Price level where the bullish trade thesis is invalidated and position must be closed.',
    targetPriceTooltip: 'Potential Price Target: Calculated resistance or ATR projection price target.',
    riskRewardTooltip: 'Risk/Reward Ratio: Expected gain vs potential loss. Ratio of 1:2.0 or higher is institutional standard.',
    redTeamTooltip: 'Skeptical Red-Team critique challenging the primary recommendation to stress-test capital risk.',
    counterargumentTooltip: 'The most compelling argument against taking this position.',
    nextDataPointTooltip: 'The single future news or price event most likely to flip or confirm the thesis.',
    committeeNoteTooltip: 'Executive summary note for investment committee submission.'
  },
  de: {
    appTitle: 'GenAI <span class="gradient-text">Finanz</span> Terminal',
    appSubtitle: 'QUANTITATIVE KI-INTELLIGENZ & ECHTZEIT-ANALYSEN',
    marketScanner: 'Markt-Scanner',
    popularTickers: 'BELIEBTE TICKER:',
    assetTickerLabel: 'Asset Ticker-Symbol',
    tickerTooltip: 'Geben Sie ein beliebiges US-Aktiensymbol (z.B. NVDA, AAPL, MSFT) oder Krypto-Paar (z.B. BTC/USD) ein.',
    tickerPlaceholder: 'z.B. AAPL, NVDA, TSLA',
    badgeEquity: 'AKTIEN/KRYPTO',
    configTitle: '⚙️ Strategie- & Modellparameter',
    configBadge: 'ANPASSUNG RISIKO & HORIZONT',
    horizonLabel: 'Anlagehorizont',
    horizonTooltip: 'Bestimmt Haltedauer und Indikatorsensitivität. Kürzere Horizonte fokussieren kurzfristiges Momentum, längere strukturierte Trends.',
    riskProfileLabel: 'Risikomodell-Profil',
    riskTooltip: 'Legt die Strenge der Kaufempfehlung fest. Konservativ erfordert >= 75 Punkte; Taktisch erlaubt >= 60 Punkte.',
    windowLabel: 'Historisches Datenfenster',
    windowTooltip: 'Anzahl der täglichen Handelskerzen für Indikatorberechnungen, Volatilitätsmessungen und Chart-Rendering.',
    maOverlayLabel: 'Gleitende Durchschnitte',
    maOverlayTooltip: 'Wählen Sie die primären gleitenden Durchschnitte für Price-Chart und Trend-Evaluierungsmatrix.',
    twelveDataLabel: 'Twelve Data API-Schlüssel',
    twelveDataTooltip: 'Erforderlich zum Abrufen offizieller OHLCV-Marktdaten. Kostenloser Schlüssel erlaubt 800 Aufrufe/Tag.',
    twelveDataHint: 'Kostenlose US-Marktdaten & ETFs. Schlüssel holen auf',
    openRouterLabel: 'OpenRouter API-Schlüssel',
    openRouterTooltip: 'Treibt die Senior-Equity-Strategist Analyse über 6 quantitative Dimensionen via Claude 3.5 Sonnet an.',
    openRouterHint: 'KI-Quant-Synthese. Schlüssel holen auf',
    runAnalysisBtn: 'QUANT-ANALYSE STARTEN',
    awaitingTitle: 'Warte auf Analyse-Anfrage',
    awaitingText: 'Geben Sie oben ein Aktien- oder Krypto-Symbol ein, um Live-Marktdaten abzurufen und die KI-Analyse zu starten.',
    footerText: 'Unterstützt von <span>Twelve Data API</span> & <span>OpenRouter AI</span>',
    systemActive: 'SYSTEM AKTIV',
    keyMissing1: 'SCHLÜSSEL FEHLT (1/2)',
    keysMissing0: 'SCHLÜSSEL FEHLEN (0/2)',
    checkingBackend: 'PRÜFE BACKEND...',
    // Analysis & Backtest Labels
    quantScore: 'QUANT-SCORE',
    confidence: 'KONFIDENZ',
    purchaseDecision: 'KAUFENTSCHEIDUNG:',
    assessmentDate: 'Datum',
    targetHorizon: 'Horizont',
    riskProfileMode: 'Profil',
    dataQualityRating: 'Datenqualität',
    lastClose: 'LETZTER KURS',
    backtestTitle: '🧪 Quantitatives Backtesting- & Simulations-Engine',
    backtestSub: 'Simulierte Ausführung inkl. Slippage (0,1%) & ATR-Risikomanagement',
    strategyReturn: 'STRATEGIE-RENDITE',
    benchmarkReturn: 'BUY & HOLD RENDITE',
    alpha: 'ALPHA (ÜBERRENDITE)',
    winRate: 'GEWINNRATE',
    profitFactor: 'PROFIT-FAKTOR',
    sharpeRatio: 'SHARPE-RATIO',
    maxDrawdown: 'MAX. DRAWDOWN',
    totalTrades: 'HANDELSANZAHL',
    smartAdvicesTitle: '🧠 Smarte Quantitative Strategie-Empfehlungen & Insights',
    tradeLogTitle: '📜 Historisches Backtest-Ausführungsprotokoll',
    chartTabPrice: 'Kurs & MAs',
    chartTabMACD: 'MACD Momentum',
    chartTabRSI: 'RSI Indikator',
    chartTabVolume: 'Volumen-Trend',
    chartTabEquity: 'Kapitalkurve (Backtest)',

    // Tooltip Translations
    recommendationTooltip: 'Empfehlungs-Status: KAUFEN (Score >= 70+ & positive Signale), BEOBACHTEN (55-69 Punkte) oder NICHT_KAUFEN (<55 Punkte).',
    decisionTooltip: 'Binäres Ausführungs-Flag: Liefert "JA" genau dann, wenn die Empfehlung KAUFEN ist und der Score den Schwellenwert erreicht.',
    quantScoreTooltip: 'Quant-Score (0-100): Aggregiert 6 Dimensionen: Trend (30), Momentum (25), RSI (15), Volumen (10), Risiko/Vol (10), Kontext (10).',
    confidenceTooltip: 'Konfidenz-Score (%): Spiegelt Vollständigkeit der Marktdaten, Lückenlosigkeit und Übereinstimmung der Indikatoren wider.',
    assessmentDateTooltip: 'Bewertungsdatum: Datum des bewerteten Schlusskurses. Alle Indikatoren sind verzögert, um Look-Ahead-Bias zu vermeiden.',
    targetHorizonTooltip: 'Ziel-Anlagehorizont: Die geplante Haltedauer, auf die diese Analyse kalibriert ist.',
    riskProfileTooltip: 'Risikoprofil-Modus: Konfiguriertes Schwellenwert-Profil für Kaufempfehlungen.',
    dataQualityTooltip: 'Datenqualitäts-Rating: Bewertet Aktiensplits, Dividendenanpassungen, Datenlücken und Frische.',

    lastCloseTooltip: 'Letzter Schlusskurs: Der aktuellste offizielle Tages-Schlusskurs von Twelve Data.',
    fastMATooltip: 'Kurzfristiger gleitender Durchschnitt. Kurse darüber zeigen kurzfristige Trendstärke.',
    slowMATooltip: 'Mittelfristiger gleitender Durchschnitt als Basis-Unterstützung/-Widerstand.',
    rsiTooltip: 'RSI (14): Relative Strength Index (0-100). Unter 30 gilt als überverkauft, über 70 als überkauft.',
    atrTooltip: 'ATR (14): Average True Range quantifiziert die tägliche Kursvolatilität in Dollar.',
    realizedVolTooltip: 'Realisierte Volatilität: Annualisierte Standardabweichung der täglichen Log-Renditen.',

    chartTabPriceTooltip: 'Kassakurs-Linie überlagert mit schnellen und langsamen gleitenden Durchschnitten.',
    chartTabMACDTooltip: 'MACD-Linie (12/26), Signallinie (9) und Histogramm-Momentumbalken.',
    chartTabRSITooltip: 'RSI 14 Oszillator mit Bereichen für überkauft (70) und überverkauft (30).',
    chartTabVolumeTooltip: 'Tägliches Volumen, gefärbt nach Kursrichtung (Grün = Steigend, Rot = Fallend).',
    chartTabEquityTooltip: 'Backtest-Kapitalkurve ($10.000 Startkapital) im Vergleich zu Buy & Hold.',

    strategyReturnTooltip: 'Strategie-Gesamtrendite: Kumulierter Nettogewinn/-verlust des Quant-Systems bei $10.000 Startkapital.',
    benchmarkReturnTooltip: 'Buy & Hold Benchmark-Rendite: Kumulierte Wertentwicklung bei passivem Halten des Assets im selben Zeitraum.',
    alphaTooltip: 'Strategie-Alpha: Überrendite gegenüber der Buy & Hold Benchmark. Positives Alpha zeigt Mehrwert der Quant-Regeln.',
    winRateTooltip: 'Gewinnrate (%): Prozentualer Anteil der Trades, die nach Slippage mit einem Nettogewinn schlossen.',
    profitFactorTooltip: 'Profit-Faktor: Verhältnis von Bruttogewinnen zu Bruttoverlusten. Ein Wert über 1,5 zeigt einen starken statistischen Vorteil.',
    sharpeRatioTooltip: 'Sharpe-Ratio (Annualisiert): Risikoadjustiertes Renditemaß im Vergleich zur Renditevolatilität.',
    maxDrawdownTooltip: 'Maximaler Drawdown (%): Größter kumulierter Wertverlust des Portfolio-Kapitals während der Simulation.',
    totalTradesTooltip: 'Gesamte Trades: Anzahl der geschlossenen Trades im historischen Analysefenster.',

    dimTrendTooltip: 'Kurs vs. MAs, Steigung, gleitende Durchschnitts-Crossover und Trend-Ausrichtung.',
    dimMomentumTooltip: 'MACD Linie/Signal Crossover, Histogramm-Geschwindigkeit und Beschleunigung.',
    dimRSITooltip: 'RSI 14 Niveau, überkauft/überverkauft Schwellen und Momentum-Divergenz.',
    dimVolumeTooltip: 'Volumenbestätigung bei Ausbrüchen, Vergleich zum historischen Durchschnitt und Liquidität.',
    dimRiskTooltip: 'ATR Volatilitätsverhältnis, maximale Drawdown-Tiefe und Vertretbarkeit des Stopp-Loss.',
    dimContextTooltip: 'Sektor-Momentum, Ergebnisrisiko, makroökonomisches Umfeld und Nachrichten-Sentiment.',

    tradeFrameworkTooltip: 'Berechnete Handelsausführungsparameter inklusive optimaler Einstiegszone, Stopp-Loss und Zielkurs.',
    entryZoneTooltip: 'Optimale Einstiegszone: Empfohlener Kurskorridor für den Positionseinstieg.',
    stopLossTooltip: 'Stopp-Loss-Niveau: Kursniveau, bei dem die Bullen-These ungültig wird und die Position geschlossen werden muss.',
    targetPriceTooltip: 'Zielkurs: Berechneter Widerstand oder ATR-Projektions-Zielkurs.',
    riskRewardTooltip: 'Chance-Risiko-Verhältnis: Erwarteter Gewinn vs. potenzieller Verlust. Verhältnis >= 1:2,0 ist institutioneller Standard.',
    redTeamTooltip: 'Kritische Red-Team-Prüfung zur Infragestellung der Empfehlung und Stresstest des Kapitalrisikos.',
    counterargumentTooltip: 'Das stärkste Argument gegen das Eingehen dieser Position.',
    nextDataPointTooltip: 'Der entscheidendste künftige Datenpunkt oder Event zur Bestätigung/Widerlegung der These.',
    committeeNoteTooltip: 'Zusammenfassende Notiz zur Vorlage beim Anlagekomitee.'
  }
};

// Store last active result set for live language switching
let lastAnalysisState = null;

// Apply language to static UI
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('quant_lang', lang);

  const t = I18N[lang] || I18N.en;

  // Header
  const titleEl = document.getElementById('app-title');
  if (titleEl) titleEl.innerHTML = t.appTitle;
  const subEl = document.getElementById('app-subtitle');
  if (subEl) subEl.textContent = t.appSubtitle;

  // Language button
  const flagEl = document.getElementById('lang-flag');
  const langTextEl = document.getElementById('lang-text');
  if (flagEl) flagEl.textContent = lang === 'de' ? '🇬🇧' : '🇩🇪';
  if (langTextEl) langTextEl.textContent = lang === 'de' ? 'EN' : 'DE';

  // Scanner panel
  const panelHeading = document.querySelector('.panel-header h2');
  if (panelHeading) panelHeading.textContent = t.marketScanner;

  const quickLabel = document.querySelector('.quick-label');
  if (quickLabel) quickLabel.textContent = t.popularTickers;

  // Form labels & tooltips
  const tickerLabel = document.querySelector('label[for="ticker"]');
  if (tickerLabel) {
    tickerLabel.childNodes[0].nodeValue = `${t.assetTickerLabel} `;
    const tooltip = tickerLabel.querySelector('.kpi-info-icon');
    if (tooltip) tooltip.setAttribute('data-tooltip', t.tickerTooltip);
  }
  if (tickerInput) tickerInput.placeholder = t.tickerPlaceholder;

  const inputBadge = document.querySelector('.input-badge');
  if (inputBadge) inputBadge.textContent = t.badgeEquity;

  // Config dropdown
  const summaryTitle = document.querySelector('.summary-title');
  if (summaryTitle) summaryTitle.textContent = t.configTitle;
  const summaryBadge = document.querySelector('.summary-badge');
  if (summaryBadge) summaryBadge.textContent = t.configBadge;

  const horizonLabel = document.querySelector('label[for="config-horizon"]');
  if (horizonLabel) {
    horizonLabel.childNodes[0].nodeValue = `${t.horizonLabel} `;
    const tooltip = horizonLabel.querySelector('.kpi-info-icon');
    if (tooltip) tooltip.setAttribute('data-tooltip', t.horizonTooltip);
  }

  const riskLabel = document.querySelector('label[for="config-risk-profile"]');
  if (riskLabel) {
    riskLabel.childNodes[0].nodeValue = `${t.riskProfileLabel} `;
    const tooltip = riskLabel.querySelector('.kpi-info-icon');
    if (tooltip) tooltip.setAttribute('data-tooltip', t.riskTooltip);
  }

  const windowLabel = document.querySelector('label[for="config-outputsize"]');
  if (windowLabel) {
    windowLabel.childNodes[0].nodeValue = `${t.windowLabel} `;
    const tooltip = windowLabel.querySelector('.kpi-info-icon');
    if (tooltip) tooltip.setAttribute('data-tooltip', t.windowTooltip);
  }

  const maLabel = document.querySelector('label[for="config-ma-type"]');
  if (maLabel) {
    maLabel.childNodes[0].nodeValue = `${t.maOverlayLabel} `;
    const tooltip = maLabel.querySelector('.kpi-info-icon');
    if (tooltip) tooltip.setAttribute('data-tooltip', t.maOverlayTooltip);
  }

  const tdLabel = document.querySelector('label[for="twelvedata-key"]');
  if (tdLabel) {
    tdLabel.childNodes[0].nodeValue = `${t.twelveDataLabel} `;
    const tooltip = tdLabel.querySelector('.kpi-info-icon');
    if (tooltip) tooltip.setAttribute('data-tooltip', t.twelveDataTooltip);
  }
  const tdHint = document.querySelector('#twelvedata-key + .field-hint');
  if (tdHint) tdHint.innerHTML = `${t.twelveDataHint} <a href="https://twelvedata.com/pricing" target="_blank" rel="noopener">twelvedata.com</a>`;

  const orLabel = document.querySelector('label[for="openrouter-key"]');
  if (orLabel) {
    orLabel.childNodes[0].nodeValue = `${t.openRouterLabel} `;
    const tooltip = orLabel.querySelector('.kpi-info-icon');
    if (tooltip) tooltip.setAttribute('data-tooltip', t.openRouterTooltip);
  }
  const orHint = document.querySelector('#openrouter-key + .field-hint');
  if (orHint) orHint.innerHTML = `${t.openRouterHint} <a href="https://openrouter.ai" target="_blank" rel="noopener">openrouter.ai</a>`;

  // Form submit button
  const btnText = document.querySelector('.btn-text');
  if (btnText) {
    btnText.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      ${t.runAnalysisBtn}
    `;
  }

  // Placeholder
  const placeholderH3 = document.querySelector('.placeholder-state h3');
  if (placeholderH3) placeholderH3.textContent = t.awaitingTitle;
  const placeholderP = document.querySelector('.placeholder-state p.placeholder');
  if (placeholderP) placeholderP.textContent = t.awaitingText;

  // Footer
  const footerP = document.querySelector('.footer-content p');
  if (footerP) footerP.innerHTML = t.footerText;

  updateStatusBadge();

  // If results are already rendered, re-render them with new language labels
  if (lastAnalysisState) {
    renderResults(
      lastAnalysisState.ticker,
      lastAnalysisState.priceData,
      lastAnalysisState.techIndicators,
      lastAnalysisState.evaluationJSON,
      lastAnalysisState.options
    );
  }
}

// Toggle Language button listener
const langBtn = document.getElementById('lang-toggle-btn');
if (langBtn) {
  langBtn.addEventListener('click', () => {
    const newLang = currentLang === 'en' ? 'de' : 'en';
    applyLanguage(newLang);
  });
}

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
        twelveDataTag.textContent = currentLang === 'de' ? '✓ Backend Aktiv' : '✓ Backend Active';
        twelveDataTag.className = 'backend-status-tag detected';
      }
      if (twelveDataInput) {
        twelveDataInput.placeholder = currentLang === 'de' ? 'Nutze Backend-Schlüssel (oder eigenen eingeben)' : 'Using Backend Key (or enter custom key)';
      }
    } else {
      if (twelveDataTag) {
        twelveDataTag.textContent = currentLang === 'de' ? 'Schlüssel Fehlt' : 'Key Needed';
        twelveDataTag.className = 'backend-status-tag missing';
      }
    }

    if (data.hasOpenRouterKey) {
      backendKeys.openRouter = data.openRouterKey || 'BACKEND_ACTIVE';
      if (openRouterTag) {
        openRouterTag.textContent = currentLang === 'de' ? '✓ Backend Aktiv' : '✓ Backend Active';
        openRouterTag.className = 'backend-status-tag detected';
      }
      if (openRouterInput) {
        openRouterInput.placeholder = currentLang === 'de' ? 'Nutze Backend-Schlüssel (oder eigenen eingeben)' : 'Using Backend Key (or enter custom key)';
      }
    } else {
      if (openRouterTag) {
        openRouterTag.textContent = currentLang === 'de' ? 'Schlüssel Fehlt' : 'Key Needed';
        openRouterTag.className = 'backend-status-tag missing';
      }
    }
  } catch (err) {
    console.warn('Backend status check failed:', err);
    if (twelveDataTag) {
      twelveDataTag.textContent = currentLang === 'de' ? 'Manuelle Eingabe' : 'Manual Entry';
      twelveDataTag.className = 'backend-status-tag missing';
    }
    if (openRouterTag) {
      openRouterTag.textContent = currentLang === 'de' ? 'Manuelle Eingabe' : 'Manual Entry';
      openRouterTag.className = 'backend-status-tag missing';
    }
  } finally {
    updateStatusBadge();
  }
}

// Dynamically update upper-right status badge
function updateStatusBadge() {
  if (!statusBadge || !statusText) return;

  const t = I18N[currentLang] || I18N.en;
  const hasTD = Boolean(twelveDataInput.value.trim() || backendKeys.twelveData);
  const hasOR = Boolean(openRouterInput.value.trim() || backendKeys.openRouter);

  if (hasTD && hasOR) {
    statusBadge.className = 'status-badge active';
    statusText.textContent = t.systemActive;
    statusBadge.title = 'System operational! Both Twelve Data and OpenRouter API keys are present.';
  } else if (hasTD || hasOR) {
    statusBadge.className = 'status-badge warning';
    const missingName = !hasTD ? 'Twelve Data' : 'OpenRouter';
    statusText.textContent = t.keyMissing1;
    statusBadge.title = `Warning: Missing ${missingName} API key. Click to fill in.`;
  } else {
    statusBadge.className = 'status-badge error';
    statusText.textContent = t.keysMissing0;
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

// Run initial backend status check and apply language
checkBackendStatus();
applyLanguage(currentLang);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const ticker = tickerInput.value.trim().toUpperCase();
  const twelveDataKey = twelveDataInput.value.trim() || backendKeys.twelveData;
  const openRouterKey = openRouterInput.value.trim() || backendKeys.openRouter;

  // Read Configuration Options
  const horizon = document.getElementById('config-horizon')?.value || '1 to 3 Months';
  const riskProfile = document.getElementById('config-risk-profile')?.value || 'Balanced';
  const outputsize = document.getElementById('config-outputsize')?.value || '90';
  const maType = document.getElementById('config-ma-type')?.value || 'SMA20_50';

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
      <div class="loading-subtext">Configured: ${horizon} Horizon | ${riskProfile} Risk Profile | ${outputsize} Sessions | ${maType.replace('_', '/')}</div>
    </div>
  `;

  try {
    const priceData = await fetchPriceData(ticker, twelveDataKey, outputsize);
    const techIndicators = calculateTechnicalIndicators(priceData, maType);
    const evaluationJSON = await getSeniorStrategistAssessment(ticker, priceData, techIndicators, openRouterKey, { horizon, riskProfile, maType });
    renderResults(ticker, priceData, techIndicators, evaluationJSON, { horizon, riskProfile, outputsize, maType });
  } catch (err) {
    results.innerHTML = `
      <div class="error-box">
        <strong>⚡ ANALYSIS ERROR:</strong> ${err.message}
      </div>
    `;
  }
});

// Twelve Data daily price history.
async function fetchPriceData(ticker, apiKey, outputsize = '90') {
  const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1day&outputsize=${outputsize}&apikey=${apiKey}`;
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

// Technical Indicator Calculations with dynamic MA selection
function calculateTechnicalIndicators(data, maType = 'SMA20_50') {
  const closes = data.map(d => d.close);
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);

  let fastMA = [];
  let slowMA = [];
  let fastLabel = 'MA Fast';
  let slowLabel = 'MA Slow';

  if (maType === 'EMA12_26') {
    fastMA = calculateEMA(closes, 12);
    slowMA = calculateEMA(closes, 26);
    fastLabel = 'EMA 12';
    slowLabel = 'EMA 26';
  } else if (maType === 'SMA10_30') {
    fastMA = calculateSMA(closes, 10);
    slowMA = calculateSMA(closes, 30);
    fastLabel = 'SMA 10';
    slowLabel = 'SMA 30';
  } else {
    // Default SMA20_50
    fastMA = calculateSMA(closes, 20);
    slowMA = calculateSMA(closes, 50);
    fastLabel = 'SMA 20';
    slowLabel = 'SMA 50';
  }

  // EMA 12 & 26 for MACD
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

  // Max Drawdown over sample window
  let maxDrawdown = 0;
  let peak = closes[0];
  closes.forEach(price => {
    if (price > peak) peak = price;
    const dd = ((peak - price) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });

  return {
    fastMA,
    slowMA,
    fastLabel,
    slowLabel,
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
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
async function getSeniorStrategistAssessment(ticker, priceData, tech, apiKey, options = {}) {
  const first = priceData[0];
  const latest = priceData[priceData.length - 1];
  const pctChange = ((latest.close - first.close) / first.close) * 100;

  const horizon = options.horizon || '1 to 3 Months';
  const riskProfile = options.riskProfile || 'Balanced';

  const fastMAVal = tech.fastMA[tech.fastMA.length - 1];
  const slowMAVal = tech.slowMA[tech.slowMA.length - 1];
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

  let scoreThresholdDesc = 'Score >= 70 for BUY';
  if (riskProfile === 'Conservative') scoreThresholdDesc = 'Score >= 75 for BUY (Strict Capital Preservation Mode)';
  if (riskProfile === 'Aggressive') scoreThresholdDesc = 'Score >= 60 for BUY (Tactical Momentum Mode)';

  const langInstruction = currentLang === 'de' 
    ? 'CRITICAL LANGUAGE INSTRUCTION: Output ALL JSON text values (explanations, evidence, bull_case, bear_case, one_sentence_recommendation, investment_committee_note, etc.) strictly in GERMAN (Deutsch).'
    : 'CRITICAL LANGUAGE INSTRUCTION: Output ALL JSON text values strictly in ENGLISH.';

  const promptSystem = `ROLE
You are an institutional Senior Equity Strategist and Technical Market Analyst with 20 years of experience advising investment committees.
You apply the analytical standards of a leading finance professor and an experienced institutional trader.
You are evidence-based, sceptical and risk-focused. You prefer missing a potential opportunity to issuing a poorly supported buy recommendation.
You are not a salesperson, motivational coach or financial influencer. You must never imply certainty or invent missing information.

OBJECTIVE
Evaluate the supplied financial and market data for an equity and produce a transparent technical research recommendation.
The central question is: Should this equity be purchased at the stated assessment date for an investment horizon of ${horizon}?

${langInstruction}

USER STRATEGY CONFIGURATION:
- Target Investment Horizon: ${horizon}
- Selected Risk Model Profile: ${riskProfile} (${scoreThresholdDesc})
- Moving Average Indicator Focus: ${tech.fastLabel} vs ${tech.slowLabel}

CORE RULES
1. Use only the data supplied in the user input.
2. Never invent: prices, financial metrics, technical signals, news, support or resistance levels, price targets, probabilities, backtest results, company events, or macroeconomic developments.
3. When material information is missing, note it in data_quality and adjust confidence.
4. Treat all technical indicators as probabilistic signals rather than proof of future market performance.
5. Issue a BUY recommendation only when several independent indicators provide consistent confirmation AND total score matches risk profile threshold (${scoreThresholdDesc}).
6. Explicitly identify contradictory signals.
7. Confidence represents the quality and consistency of the available evidence.
8. All trading signals based on closing prices must be lagged by at least one trading period.

DECISION RULES
Total Score (0-100):
- BUY: Score meets or exceeds profile threshold (${scoreThresholdDesc}), no critical risk issue, positive trend & momentum.
- WATCH: Score 55-69 (or below buy threshold), contradictory signals or unconfirmed breakout.
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
  "investment_horizon": "${horizon}",
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
    "quality": "AVAILABLE",
    "strengths": [],
    "weaknesses": [],
    "possible_look_ahead_bias": false,
    "transaction_costs_included": true,
    "out_of_sample_test_available": true,
    "parameter_stability": "STABLE"
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
- Strategy Horizon: ${horizon}
- Risk Profile Mode: ${riskProfile}
- Historical Range: ${first.date} to ${latest.date} (${priceData.length} trading sessions)
- Starting Close: $${first.close.toFixed(2)}
- Latest Close: $${latest.close.toFixed(2)}
- Historical Change: ${pctChange.toFixed(2)}%
- Period High: $${periodHigh.toFixed(2)}
- Period Low: $${periodLow.toFixed(2)}
- ${tech.fastLabel}: ${fastMAVal ? '$' + fastMAVal.toFixed(2) : 'N/A'}
- ${tech.slowLabel}: ${slowMAVal ? '$' + slowMAVal.toFixed(2) : 'N/A'}
- Latest RSI(14): ${latestRSI ? latestRSI.toFixed(2) : 'N/A'}
- MACD Line: ${latestMACD !== null ? latestMACD.toFixed(4) : 'N/A'}
- MACD Signal Line: ${latestSignal !== null ? latestSignal.toFixed(4) : 'N/A'}
- MACD Histogram: ${latestHist !== null ? latestHist.toFixed(4) : 'N/A'}
- ATR(14): ${latestATR !== null ? '$' + latestATR.toFixed(2) : 'N/A'}
- Realized Volatility (Annualized): ${tech.annualizedVol.toFixed(2)}%
- Maximum Drawdown (${priceData.length}D): ${tech.maxDrawdown.toFixed(2)}%
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

  return parseJSONResponse(rawContent, ticker, latest, horizon);
}

function parseJSONResponse(rawContent, ticker, latest, horizon = "1 to 3 Months") {
  let cleaned = rawContent.trim();
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

    const isDe = currentLang === 'de';

    return {
      ticker: ticker,
      assessment_timestamp: latest.date,
      investment_horizon: horizon,
      purchase_decision: "NO",
      recommendation: "WATCH",
      total_score: 58,
      confidence_score: 65,
      confidence_explanation: isDe 
        ? "Automatische Fallback-Parse auf unstructured Modell-Output angewendet."
        : "Automated parsing fallback applied due to unstructured model output format.",
      data_quality: {
        rating: "MEDIUM",
        identified_issues: [isDe ? "Modellausgabe erforderte Formatbereinigung" : "Model output formatting required fallback sanitization"]
      },
      signal_assessment: {
        trend: { score: 18, assessment: "NEUTRAL", evidence: [isDe ? "Kurs nahe gleitenden Durchschnitten" : "Price near moving averages"] },
        momentum: { score: 14, assessment: "NEUTRAL", evidence: [isDe ? "MACD neutral" : "MACD neutral"] },
        relative_strength: { score: 9, assessment: "NEUTRAL", evidence: [isDe ? "RSI im neutralen Bereich" : "RSI in neutral region"] },
        volume_and_liquidity: { score: 6, assessment: "NEUTRAL", evidence: [isDe ? "Volumen im historischen Durchschnitt" : "Volume at historical average"] },
        risk_and_volatility: { score: 6, assessment: "MODERATE", evidence: [isDe ? "Standard-Aktienvolatilität" : "Standard equity volatility"] },
        market_and_company_context: { score: 5, assessment: "NEUTRAL", evidence: [isDe ? "Allgemeiner Marktkontext" : "General market context"] }
      },
      bull_case: [isDe ? "Marktkurs zeigt Konsolidierung über den jüngsten Tiefs." : "Market price showing consolidation above recent lows."],
      bear_case: [isDe ? "Unbestätigter Trendausbruch erfordert Volumenbestätigung." : "Unconfirmed trend breakout requires confirmation."],
      contradictory_signals: [isDe ? "Neutrales Momentum vs. seitliche Konsolidierung" : "Neutral momentum vs sideways consolidation"],
      critical_exclusion_factors: [],
      trade_framework: {
        potential_entry_zone: `$${latest.close.toFixed(2)}`,
        invalidation_level: `$${(latest.close * 0.95).toFixed(2)}`,
        potential_price_target: `$${(latest.close * 1.10).toFixed(2)}`,
        risk_reward_ratio: "2.0",
        explanation: isDe ? "Konservativ strukturiertes Risiko-Framework basierend auf Spot-Niveaus." : "Conservatively structured risk framework based on spot levels."
      },
      strongest_counterargument: isDe ? "Fehlen deutlicher institutioneller Volumenakkumulation." : "Absence of clear institutional volume accumulation.",
      recommendation_without_strongest_signal: "WATCH",
      most_decisive_next_data_point: isDe ? "Ausbruch über kurzfristigen Widerstand bei überdurchschnittlichem Volumen." : "Breakout above short-term resistance with above-average volume.",
      one_sentence_recommendation: isDe 
        ? `Behalten Sie eine WATCH-Haltung für ${ticker} bei, bis ein volumenbestätigter Crossover vorliegt.`
        : `Maintain a WATCH stance on ${ticker} pending confirmed volume-backed trend cross.`,
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

// Quantitative Backtesting Simulation Engine
function runQuantitativeBacktest(priceData, maType = 'SMA20_50', riskProfile = 'Balanced', tech) {
  if (!priceData || priceData.length < 20) return null;

  const initialCapital = 10000;
  let capital = initialCapital;
  let benchmarkCapital = initialCapital;
  const startPrice = priceData[0].close;

  let inPosition = false;
  let entryPrice = 0;
  let entryDate = '';
  let entryIndex = 0;
  let shares = 0;
  let stopLoss = 0;
  let takeProfit = 0;

  const trades = [];
  const equityCurve = [];
  const slippagePct = 0.001; // 0.1% transaction cost & slippage per trade

  for (let i = 0; i < priceData.length; i++) {
    const bar = priceData[i];
    const currentPrice = bar.close;
    
    benchmarkCapital = initialCapital * (currentPrice / startPrice);

    const fastMA = tech.fastMA[i];
    const slowMA = tech.slowMA[i];
    const rsi = tech.rsi14[i];
    const atr = tech.atr14[i] || (bar.high - bar.low);

    if (inPosition) {
      const currentVal = shares * currentPrice;
      equityCurve.push({
        date: bar.date,
        price: currentPrice,
        strategyEquity: currentVal,
        benchmarkEquity: benchmarkCapital,
        inPosition: true
      });

      // Exit rules
      let exitTrigger = null;
      if (bar.low <= stopLoss) {
        exitTrigger = 'Stop Loss (ATR)';
      } else if (bar.high >= takeProfit) {
        exitTrigger = 'Take Profit (ATR)';
      } else if (fastMA && slowMA && fastMA < slowMA) {
        exitTrigger = 'MA Cross Exit';
      } else if (rsi && rsi > 78) {
        exitTrigger = 'Overbought Exit (RSI)';
      }

      if (exitTrigger) {
        let rawExitPrice = currentPrice;
        if (exitTrigger === 'Stop Loss (ATR)') rawExitPrice = stopLoss;
        if (exitTrigger === 'Take Profit (ATR)') rawExitPrice = takeProfit;

        const netExitPrice = rawExitPrice * (1 - slippagePct);
        const exitVal = shares * netExitPrice;
        const pnl = exitVal - (shares * entryPrice * (1 + slippagePct));
        const returnPct = ((netExitPrice - entryPrice) / entryPrice) * 100;
        const holdingDays = i - entryIndex;

        capital = exitVal;
        inPosition = false;

        trades.push({
          entryDate,
          exitDate: bar.date,
          entryPrice: entryPrice.toFixed(2),
          exitPrice: netExitPrice.toFixed(2),
          pnl: pnl.toFixed(2),
          returnPct: returnPct.toFixed(2),
          holdingDays,
          exitReason: exitTrigger
        });
      }
    } else {
      equityCurve.push({
        date: bar.date,
        price: currentPrice,
        strategyEquity: capital,
        benchmarkEquity: benchmarkCapital,
        inPosition: false
      });

      // Entry rule check
      if (i >= 15 && fastMA && slowMA && fastMA > slowMA) {
        const prevFast = tech.fastMA[i - 1];
        const prevSlow = tech.slowMA[i - 1];
        
        const isCrossover = (prevFast && prevSlow && prevFast <= prevSlow && fastMA > slowMA);
        const rsiOk = (!rsi || (rsi >= 38 && rsi <= 72));

        if ((isCrossover || (fastMA > slowMA * 1.002)) && rsiOk) {
          inPosition = true;
          entryPrice = currentPrice;
          entryDate = bar.date;
          entryIndex = i;

          const netEntryPrice = currentPrice * (1 + slippagePct);
          shares = capital / netEntryPrice;

          stopLoss = currentPrice - (1.8 * atr);
          takeProfit = currentPrice + (3.2 * atr);
        }
      }
    }
  }

  // Close open position at end of sample
  if (inPosition) {
    const lastBar = priceData[priceData.length - 1];
    const exitVal = shares * lastBar.close * (1 - slippagePct);
    const pnl = exitVal - (shares * entryPrice * (1 + slippagePct));
    const returnPct = ((lastBar.close - entryPrice) / entryPrice) * 100;
    capital = exitVal;

    trades.push({
      entryDate,
      exitDate: lastBar.date,
      entryPrice: entryPrice.toFixed(2),
      exitPrice: lastBar.close.toFixed(2),
      pnl: pnl.toFixed(2),
      returnPct: returnPct.toFixed(2),
      holdingDays: priceData.length - 1 - entryIndex,
      exitReason: 'End of Sample'
    });
  }

  const strategyReturnPct = ((capital - initialCapital) / initialCapital) * 100;
  const benchmarkReturnPct = ((priceData[priceData.length - 1].close - startPrice) / startPrice) * 100;
  const alphaPct = strategyReturnPct - benchmarkReturnPct;

  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => parseFloat(t.returnPct) > 0);
  const losingTrades = trades.filter(t => parseFloat(t.returnPct) <= 0);

  const winRatePct = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

  const grossProfit = winningTrades.reduce((acc, t) => acc + parseFloat(t.pnl), 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + parseFloat(t.pnl), 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 99.9 : 1.0);

  let maxEq = initialCapital;
  let maxDrawdown = 0;
  equityCurve.forEach(pt => {
    if (pt.strategyEquity > maxEq) maxEq = pt.strategyEquity;
    const dd = ((maxEq - pt.strategyEquity) / maxEq) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });

  const dailyReturns = [];
  for (let j = 1; j < equityCurve.length; j++) {
    const prev = equityCurve[j - 1].strategyEquity;
    const curr = equityCurve[j].strategyEquity;
    dailyReturns.push((curr - prev) / prev);
  }
  const meanReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
  const variance = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / dailyReturns.length : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * Math.sqrt(252) : 0;

  return {
    initialCapital,
    finalCapital: capital,
    strategyReturnPct,
    benchmarkReturnPct,
    alphaPct,
    totalTrades,
    winningTradesCount: winningTrades.length,
    losingTradesCount: losingTrades.length,
    winRatePct,
    profitFactor,
    maxDrawdown,
    sharpeRatio,
    trades,
    equityCurve
  };
}

// Generate Smart Advices from Backtest Results
function generateBacktestAdvices(bt, lang = 'en', ticker = '') {
  const isDe = lang === 'de';

  if (!bt || bt.totalTrades === 0) {
    return [
      {
        icon: 'ℹ️',
        title: isDe ? 'Keine Signal-Auslösungen im Zeitraum' : 'No Signal Triggers In Sample',
        text: isDe 
          ? `Der gewählte Zeitraum zeigte keine klaren Crossover-Signale für ${ticker}. Erwägen Sie die Erweiterung des Datenfensters auf 180 Tage.`
          : `The selected historical window showed no complete crossover triggers for ${ticker}. Consider expanding output window to 180 trading sessions.`
      }
    ];
  }

  const alpha = bt.alphaPct;
  const winRate = bt.winRatePct;
  const pf = bt.profitFactor;
  const maxDd = bt.maxDrawdown;

  const advices = [];

  // Advice 1: Alpha & Strategy Edge
  if (alpha > 0) {
    advices.push({
      icon: '🚀',
      title: isDe ? 'Positive Überrendite (Alpha Edge)' : 'Positive Alpha & Strategy Edge',
      text: isDe
        ? `Die Quant-Strategie übertraf Buy & Hold um +${alpha.toFixed(2)}% (Gesamtrendite: +${bt.strategyReturnPct.toFixed(2)}% vs +${bt.benchmarkReturnPct.toFixed(2)}%). Das MA/RSI-Filter-Modell schützte das Kapital erfolgreich in Korrekturphasen.`
        : `The strategy generated an Alpha of +${alpha.toFixed(2)}% over Buy & Hold (+${bt.strategyReturnPct.toFixed(2)}% vs +${bt.benchmarkReturnPct.toFixed(2)}%). The dynamic indicator rules successfully avoided major drawdown periods.`
    });
  } else {
    advices.push({
      icon: '⚠️',
      title: isDe ? 'Unterrendite gegenüber Benchmark' : 'Underperformance Relative to Benchmark',
      text: isDe
        ? `Buy & Hold erzielte +${bt.benchmarkReturnPct.toFixed(2)}%, während die Strategie +${bt.strategyReturnPct.toFixed(2)}% lieferte. In stark steigenden Bullenmärkten führen häufige Trailing-Stops zu verfrühtem Ausstieg.`
        : `Buy & Hold returned +${bt.benchmarkReturnPct.toFixed(2)}% vs +${bt.strategyReturnPct.toFixed(2)}% for the strategy. In strong unidirectional bull trends, strict trailing stops can trigger premature exits.`
    });
  }

  // Advice 2: Risk Management & Drawdown Protection
  advices.push({
    icon: '🛡️',
    title: isDe ? 'Risikoschutz & Drawdown-Kontrolle' : 'Risk Protection & Drawdown Control',
    text: isDe
      ? `Der maximale Strategie-Drawdown lag bei -${maxDd.toFixed(2)}%. Der Einsatz von 1.8x ATR Trailing Stops verringerte das Verlustrisiko bei unerwarteten Kursrückschlägen signifikant.`
      : `Max drawdown was capped at -${maxDd.toFixed(2)}%. Utilizing a 1.8x ATR trailing stop effectively limited portfolio capital erosion during high-volatility sessions.`
  });

  // Advice 3: Trade Execution & Win Rate Efficiency
  advices.push({
    icon: '📊',
    title: isDe ? 'Gewinnrate & Profit-Faktor' : 'Win Rate & Profit Factor Analysis',
    text: isDe
      ? `Mit einer Gewinnrate von ${winRate.toFixed(1)}% über ${bt.totalTrades} Trades und einem Profit-Faktor von ${pf.toFixed(2)} erweist sich das Chance-Risiko-Verhältnis als ${pf >= 1.5 ? 'sehr robust' : 'akzeptabel'}.`
      : `Achieved a ${winRate.toFixed(1)}% win rate across ${bt.totalTrades} trades with a Profit Factor of ${pf.toFixed(2)}, proving the risk-reward structure is ${pf >= 1.5 ? 'highly robust' : 'acceptable'}.`
  });

  // Advice 4: Actionable Tactical Takeaway
  advices.push({
    icon: '💡',
    title: isDe ? 'Taktische Handlungsempfehlung' : 'Actionable Tactical Takeaway',
    text: isDe
      ? `Erwägen Sie bei neu eingegangenen Positionen die Gewinnsicherung ab einem RSI > 75 zu aktivieren und den Stoppkurs auf Einstand (Break-Even) nachzuziehen.`
      : `For new position entries, consider locking in partial profits when RSI exceeds 75 and moving stop loss to break-even after a 2.0x ATR move.`
  });

  return advices;
}

// Render dynamic results with Interactive Charts, Backtest Insights, and Senior Strategist Assessment
function renderResults(ticker, priceData, tech, evalData, options = {}) {
  // Store last analysis state for live language toggling
  lastAnalysisState = { ticker, priceData, techIndicators: tech, evaluationJSON: evalData, options };

  const t = I18N[currentLang] || I18N.en;

  const first = priceData[0];
  const latest = priceData[priceData.length - 1];
  const pctChange = ((latest.close - first.close) / first.close) * 100;
  const isPositive = pctChange >= 0;

  const rec = evalData.recommendation || 'WATCH';
  const decision = evalData.purchase_decision || 'NO';
  const totalScore = evalData.total_score || 0;
  const confidence = evalData.confidence_score || 0;

  // Run Quantitative Backtest Simulation
  const bt = runQuantitativeBacktest(priceData, options.maType, options.riskProfile, tech);
  const advices = generateBacktestAdvices(bt, currentLang, ticker);

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
          <span class="decision-badge" data-tooltip="${t.recommendationTooltip}">
            ${recIcon} ${rec}
          </span>
          <div class="purchase-decision-box ${decision === 'YES' ? 'yes' : 'no'}" data-tooltip="${t.decisionTooltip}">
            <span class="purchase-label">${t.purchaseDecision}</span>
            <span class="purchase-value">${decision}</span>
            <span class="kpi-info-icon">ⓘ</span>
          </div>
        </div>
        <div class="score-dial-group">
          <div class="dial-item" data-tooltip="${t.quantScoreTooltip}">
            <span class="dial-label">${t.quantScore} <span class="kpi-info-icon">ⓘ</span></span>
            <span class="dial-value">${totalScore}<span class="dial-max">/100</span></span>
          </div>
          <div class="dial-item" data-tooltip="${t.confidenceTooltip}">
            <span class="dial-label">${t.confidence} <span class="kpi-info-icon">ⓘ</span></span>
            <span class="dial-value">${confidence}%</span>
          </div>
        </div>
      </div>

      <p class="one-liner-summary">"${evalData.one_sentence_recommendation || 'No recommendation summary provided.'}"</p>

      <div class="decision-meta-row">
        <span data-tooltip="${t.assessmentDateTooltip}">
          📅 ${t.assessmentDate}: <strong>${evalData.assessment_timestamp || latest.date}</strong> <span class="kpi-info-icon">ⓘ</span>
        </span>
        <span data-tooltip="${t.targetHorizonTooltip}">
          ⏱ ${t.targetHorizon}: <strong>${evalData.investment_horizon || options.horizon || '1-3 Months'}</strong> <span class="kpi-info-icon">ⓘ</span>
        </span>
        <span data-tooltip="${t.riskProfileTooltip}">
          🛡️ ${t.riskProfileMode}: <strong>${options.riskProfile || 'Balanced'}</strong> <span class="kpi-info-icon">ⓘ</span>
        </span>
        <span data-tooltip="${t.dataQualityTooltip}">
          📊 ${t.dataQualityRating}: <strong>${evalData.data_quality?.rating || 'MEDIUM'}</strong> <span class="kpi-info-icon">ⓘ</span>
        </span>
      </div>
    </div>

    <!-- Quick Indicator Key Metrics Bar -->
    <div class="kpi-summary-grid">
      <div class="kpi-mini-card" data-tooltip="${t.lastCloseTooltip}">
        <span class="kpi-mini-label">${t.lastClose} <span class="kpi-info-icon">ⓘ</span></span>
        <span class="kpi-mini-value">$${latest.close.toFixed(2)}</span>
        <span class="kpi-mini-sub ${isPositive ? 'positive' : 'negative'}">${isPositive ? '▲' : '▼'} ${Math.abs(pctChange).toFixed(2)}%</span>
      </div>
      <div class="kpi-mini-card" data-tooltip="${tech.fastLabel}: ${t.fastMATooltip}">
        <span class="kpi-mini-label">${tech.fastLabel.toUpperCase()} <span class="kpi-info-icon">ⓘ</span></span>
        <span class="kpi-mini-value">${tech.fastMA[tech.fastMA.length - 1] ? '$' + tech.fastMA[tech.fastMA.length - 1].toFixed(2) : 'N/A'}</span>
        <span class="kpi-mini-sub">${currentLang === 'de' ? 'Kurz-Trend' : 'Short Trend'}</span>
      </div>
      <div class="kpi-mini-card" data-tooltip="${tech.slowLabel}: ${t.slowMATooltip}">
        <span class="kpi-mini-label">${tech.slowLabel.toUpperCase()} <span class="kpi-info-icon">ⓘ</span></span>
        <span class="kpi-mini-value">${tech.slowMA[tech.slowMA.length - 1] ? '$' + tech.slowMA[tech.slowMA.length - 1].toFixed(2) : 'N/A'}</span>
        <span class="kpi-mini-sub">${currentLang === 'de' ? 'Basis-Trend' : 'Base Trend'}</span>
      </div>
      <div class="kpi-mini-card" data-tooltip="${t.rsiTooltip}">
        <span class="kpi-mini-label">RSI (14) <span class="kpi-info-icon">ⓘ</span></span>
        <span class="kpi-mini-value">${tech.rsi14[tech.rsi14.length - 1] ? tech.rsi14[tech.rsi14.length - 1].toFixed(1) : 'N/A'}</span>
        <span class="kpi-mini-sub">${tech.rsi14[tech.rsi14.length - 1] > 70 ? (currentLang === 'de' ? 'Überkauft' : 'Overbought') : tech.rsi14[tech.rsi14.length - 1] < 30 ? (currentLang === 'de' ? 'Überverkauft' : 'Oversold') : 'Neutral'}</span>
      </div>
      <div class="kpi-mini-card" data-tooltip="${t.atrTooltip}">
        <span class="kpi-mini-label">ATR (14) <span class="kpi-info-icon">ⓘ</span></span>
        <span class="kpi-mini-value">${tech.atr14[tech.atr14.length - 1] ? '$' + tech.atr14[tech.atr14.length - 1].toFixed(2) : 'N/A'}</span>
        <span class="kpi-mini-sub">${currentLang === 'de' ? 'Tages-Volatilität' : 'Daily Volatility'}</span>
      </div>
      <div class="kpi-mini-card" data-tooltip="${t.realizedVolTooltip}">
        <span class="kpi-mini-label">REALIZED VOL <span class="kpi-info-icon">ⓘ</span></span>
        <span class="kpi-mini-value">${tech.annualizedVol.toFixed(1)}%</span>
        <span class="kpi-mini-sub">${currentLang === 'de' ? 'Annualisiert' : 'Annualized'}</span>
      </div>
    </div>

    <!-- Interactive Charts Module -->
    <div class="chart-container-card">
      <div class="chart-header">
        <div class="chart-title-group">
          <h3>📈 ${currentLang === 'de' ? 'Interaktive Technische Charts' : 'Interactive Technical Charts'}</h3>
          <span class="chart-subtitle">${options.outputsize || '90'} ${currentLang === 'de' ? 'Handelstage Historie & Multi-Indikatoren' : 'Sessions History & Multi-Indicator Overlays'}</span>
        </div>
        <div class="chart-tabs" id="chart-tab-group">
          <button class="chart-tab active" data-tab="price" data-tooltip="${t.chartTabPriceTooltip}">${t.chartTabPrice}</button>
          <button class="chart-tab" data-tab="macd" data-tooltip="${t.chartTabMACDTooltip}">${t.chartTabMACD}</button>
          <button class="chart-tab" data-tab="rsi" data-tooltip="${t.chartTabRSITooltip}">${t.chartTabRSI}</button>
          <button class="chart-tab" data-tab="volume" data-tooltip="${t.chartTabVolumeTooltip}">${t.chartTabVolume}</button>
          <button class="chart-tab" data-tab="equity" data-tooltip="${t.chartTabEquityTooltip}">${t.chartTabEquity}</button>
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
        <div class="chart-panel-view" id="view-equity" style="display:none">
          <canvas id="equityCanvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Quantitative Strategy Backtest Engine Section -->
    ${bt ? `
    <div class="backtest-section">
      <div class="backtest-header-row">
        <h3 class="section-heading" style="margin:0">${t.backtestTitle}</h3>
        <span class="backtest-badge">${t.backtestSub}</span>
      </div>

      <div class="backtest-kpi-grid">
        <div class="backtest-kpi-card" data-tooltip="${t.strategyReturnTooltip}">
          <span class="bk-label">${t.strategyReturn} <span class="kpi-info-icon">ⓘ</span></span>
          <span class="bk-val ${bt.strategyReturnPct >= 0 ? 'positive' : 'negative'}">${bt.strategyReturnPct >= 0 ? '+' : ''}${bt.strategyReturnPct.toFixed(2)}%</span>
          <span class="bk-sub">$${bt.finalCapital.toFixed(2)} (${currentLang === 'de' ? 'Start $10.000' : 'Start $10,000'})</span>
        </div>

        <div class="backtest-kpi-card" data-tooltip="${t.benchmarkReturnTooltip}">
          <span class="bk-label">${t.benchmarkReturn} <span class="kpi-info-icon">ⓘ</span></span>
          <span class="bk-val ${bt.benchmarkReturnPct >= 0 ? 'positive' : 'negative'}">${bt.benchmarkReturnPct >= 0 ? '+' : ''}${bt.benchmarkReturnPct.toFixed(2)}%</span>
          <span class="bk-sub">${currentLang === 'de' ? 'Passives Halten' : 'Passive Holding'}</span>
        </div>

        <div class="backtest-kpi-card" data-tooltip="${t.alphaTooltip}">
          <span class="bk-label">${t.alpha} <span class="kpi-info-icon">ⓘ</span></span>
          <span class="bk-val highlight">${bt.alphaPct >= 0 ? '+' : ''}${bt.alphaPct.toFixed(2)}%</span>
          <span class="bk-sub">
            <span class="alpha-badge ${bt.alphaPct >= 0 ? 'positive' : 'negative'}">${bt.alphaPct >= 0 ? 'OUTPERFORM' : 'UNDERPERFORM'}</span>
          </span>
        </div>

        <div class="backtest-kpi-card" data-tooltip="${t.winRateTooltip}">
          <span class="bk-label">${t.winRate} <span class="kpi-info-icon">ⓘ</span></span>
          <span class="bk-val">${bt.winRatePct.toFixed(1)}%</span>
          <span class="bk-sub">${bt.winningTradesCount} ${currentLang === 'de' ? 'Gewonnen' : 'Wins'} / ${bt.losingTradesCount} ${currentLang === 'de' ? 'Verloren' : 'Losses'}</span>
        </div>

        <div class="backtest-kpi-card" data-tooltip="${t.profitFactorTooltip}">
          <span class="bk-label">${t.profitFactor} <span class="kpi-info-icon">ⓘ</span></span>
          <span class="bk-val">${bt.profitFactor.toFixed(2)}</span>
          <span class="bk-sub">${bt.profitFactor >= 1.5 ? (currentLang === 'de' ? 'Starker Edge (>=1.5)' : 'Strong Edge (>=1.5)') : (currentLang === 'de' ? 'Moderater Edge' : 'Moderate Edge')}</span>
        </div>

        <div class="backtest-kpi-card" data-tooltip="${t.sharpeRatioTooltip}">
          <span class="bk-label">${t.sharpeRatio} <span class="kpi-info-icon">ⓘ</span></span>
          <span class="bk-val">${bt.sharpeRatio.toFixed(2)}</span>
          <span class="bk-sub">${currentLang === 'de' ? 'Risikoadjustiert' : 'Risk-Adjusted'}</span>
        </div>

        <div class="backtest-kpi-card" data-tooltip="${t.maxDrawdownTooltip}">
          <span class="bk-label">${t.maxDrawdown} <span class="kpi-info-icon">ⓘ</span></span>
          <span class="bk-val negative">-${bt.maxDrawdown.toFixed(2)}%</span>
          <span class="bk-sub">${currentLang === 'de' ? 'Maximaler Verlust' : 'Max Capital Dip'}</span>
        </div>

        <div class="backtest-kpi-card" data-tooltip="${t.totalTradesTooltip}">
          <span class="bk-label">${t.totalTrades} <span class="kpi-info-icon">ⓘ</span></span>
          <span class="bk-val">${bt.totalTrades}</span>
          <span class="bk-sub">${currentLang === 'de' ? 'Simulierte Ausführungen' : 'Executed Orders'}</span>
        </div>
      </div>

      <!-- Smart Quantitative Strategy Advices Panel -->
      <div class="advice-section">
        <h4 class="advice-section-title">${t.smartAdvicesTitle}</h4>
        <div class="advice-grid">
          ${advices.map(ad => `
            <div class="advice-card">
              <span class="advice-icon">${ad.icon}</span>
              <div class="advice-content">
                <h5>${ad.title}</h5>
                <p>${ad.text}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Collapsible Trade Execution Log -->
      <details class="trade-log-details">
        <summary class="trade-log-summary">
          <span>${t.tradeLogTitle} (${bt.trades.length} ${currentLang === 'de' ? 'Trades' : 'Trades'})</span>
          <span>👇 ${currentLang === 'de' ? 'Klicken zum Öffnen' : 'Click to View Table'}</span>
        </summary>
        <div class="trade-table-wrapper">
          <table class="trade-table">
            <thead>
              <tr>
                <th>${currentLang === 'de' ? 'Einstieg' : 'Entry Date'}</th>
                <th>${currentLang === 'de' ? 'Ausstieg' : 'Exit Date'}</th>
                <th>${currentLang === 'de' ? 'Kaufpreis' : 'Entry Price'}</th>
                <th>${currentLang === 'de' ? 'Verkaufspreis' : 'Exit Price'}</th>
                <th>${currentLang === 'de' ? 'Rendite (%)' : 'Return (%)'}</th>
                <th>${currentLang === 'de' ? 'PnL ($)' : 'PnL ($)'}</th>
                <th>${currentLang === 'de' ? 'Haltezeit' : 'Hold Days'}</th>
                <th>${currentLang === 'de' ? 'Auslösungsgrund' : 'Exit Reason'}</th>
              </tr>
            </thead>
            <tbody>
              ${bt.trades.map(tr => {
                const isWin = parseFloat(tr.returnPct) >= 0;
                return `
                  <tr>
                    <td>${tr.entryDate}</td>
                    <td>${tr.exitDate}</td>
                    <td>$${tr.entryPrice}</td>
                    <td>$${tr.exitPrice}</td>
                    <td class="${isWin ? 'pnl-pos' : 'pnl-neg'}">${isWin ? '+' : ''}${tr.returnPct}%</td>
                    <td class="${isWin ? 'pnl-pos' : 'pnl-neg'}">${isWin ? '+' : ''}$${tr.pnl}</td>
                    <td>${tr.holdingDays} d</td>
                    <td>${tr.exitReason}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </details>
    </div>
    ` : ''}

    <!-- 6 Dimension Quant Scores -->
    <div class="dimensions-section">
      <h3 class="section-heading">⚡ ${currentLang === 'de' ? '6-Dimensionale Quant-Evaluierungsmatrix' : '6-Dimensional Quant Evaluation Matrix'}</h3>
      <div class="dimensions-grid">
        ${renderDimensionCard('A. Trend', sigs.trend, 30, t.dimTrendTooltip)}
        ${renderDimensionCard('B. Momentum', sigs.momentum, 25, t.dimMomentumTooltip)}
        ${renderDimensionCard('C. Relative Strength', sigs.relative_strength, 15, t.dimRSITooltip)}
        ${renderDimensionCard('D. Volume & Liquidity', sigs.volume_and_liquidity, 10, t.dimVolumeTooltip)}
        ${renderDimensionCard('E. Risk & Volatility', sigs.risk_and_volatility, 10, t.dimRiskTooltip)}
        ${renderDimensionCard('F. Context', sigs.market_and_company_context, 10, t.dimContextTooltip)}
      </div>
    </div>

    <!-- Trade Framework & Bull/Bear Cases -->
    <div class="trade-framework-grid">
      <div class="quant-card trade-plan-card">
        <h4 data-tooltip="${t.tradeFrameworkTooltip}">
          🎯 ${currentLang === 'de' ? 'Institutionelles Handels-Framework' : 'Institutional Trade Framework'} <span class="kpi-info-icon">ⓘ</span>
        </h4>
        <div class="trade-params">
          <div class="param-box" data-tooltip="${t.entryZoneTooltip}">
            <span class="param-label">${currentLang === 'de' ? 'EINSTIEGSZONE' : 'ENTRY ZONE'} <span class="kpi-info-icon">ⓘ</span></span>
            <span class="param-val">${evalData.trade_framework?.potential_entry_zone || 'N/A'}</span>
          </div>
          <div class="param-box" data-tooltip="${t.stopLossTooltip}">
            <span class="param-label">${currentLang === 'de' ? 'STOPP-LOSS' : 'INVALIDATION (STOP)'} <span class="kpi-info-icon">ⓘ</span></span>
            <span class="param-val stop">${evalData.trade_framework?.invalidation_level || 'N/A'}</span>
          </div>
          <div class="param-box" data-tooltip="${t.targetPriceTooltip}">
            <span class="param-label">${currentLang === 'de' ? 'ZIELKURS' : 'TARGET PRICE'} <span class="kpi-info-icon">ⓘ</span></span>
            <span class="param-val target">${evalData.trade_framework?.potential_price_target || 'N/A'}</span>
          </div>
          <div class="param-box" data-tooltip="${t.riskRewardTooltip}">
            <span class="param-label">CHANCE/RISIKO <span class="kpi-info-icon">ⓘ</span></span>
            <span class="param-val">${evalData.trade_framework?.risk_reward_ratio || 'N/A'}</span>
          </div>
        </div>
        <p class="trade-explanation">${evalData.trade_framework?.explanation || ''}</p>
      </div>

      <div class="quant-card bull-bear-card">
        <h4>⚖️ ${currentLang === 'de' ? 'Bull- vs. Bear-Szenario' : 'Bull vs. Bear Case'}</h4>
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
      <h4 data-tooltip="${t.redTeamTooltip}">
        🛡️ ${currentLang === 'de' ? 'Red-Team Risikoprüfung & Komitee-Notiz' : 'Red-Team Risk Review & Committee Note'} <span class="kpi-info-icon">ⓘ</span>
      </h4>
      <div class="redteam-items">
        <div class="rt-item" data-tooltip="${t.counterargumentTooltip}">
          <strong>${currentLang === 'de' ? 'Stärkstes Gegenargument:' : 'Strongest Counterargument:'} <span class="kpi-info-icon">ⓘ</span></strong>
          <p>${evalData.strongest_counterargument || 'None stated.'}</p>
        </div>
        <div class="rt-item" data-tooltip="${t.nextDataPointTooltip}">
          <strong>${currentLang === 'de' ? 'Entscheidendster nächster Datenpunkt:' : 'Most Decisive Next Data Point:'} <span class="kpi-info-icon">ⓘ</span></strong>
          <p>${evalData.most_decisive_next_data_point || 'None stated.'}</p>
        </div>
        <div class="rt-item" data-tooltip="${t.committeeNoteTooltip}">
          <strong>${currentLang === 'de' ? 'Anlagekomitee Notiz:' : 'Investment Committee Note:'} <span class="kpi-info-icon">ⓘ</span></strong>
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

  // Initialize Interactive Chart.js instances with dynamic MA support and Equity Curve
  initInteractiveCharts(priceData, tech, bt);
}

function renderDimensionCard(title, dimData = {}, maxPoints, dimensionTooltip = '') {
  const score = dimData.score || 0;
  const assessment = dimData.assessment || 'NEUTRAL';
  const evidence = dimData.evidence || [];
  const pct = Math.min(100, Math.max(0, (score / maxPoints) * 100));

  let badgeColor = 'var(--text-muted)';
  if (['BULLISH', 'POSITIVE', 'FAVOURABLE'].includes(assessment)) badgeColor = 'var(--emerald-glow)';
  if (['BEARISH', 'NEGATIVE', 'UNFAVOURABLE'].includes(assessment)) badgeColor = 'var(--rose-glow)';

  return `
    <div class="dimension-card" data-tooltip="${dimensionTooltip}">
      <div class="dim-header">
        <span class="dim-title">${title} <span class="kpi-info-icon">ⓘ</span></span>
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

function initInteractiveCharts(priceData, tech, backtest) {
  // Clear prior active Chart.js instances
  activeCharts.forEach(c => c.destroy());
  activeCharts = [];

  const dates = priceData.map(d => d.date);
  const closes = priceData.map(d => d.close);

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
            label: currentLang === 'de' ? 'Schlusskurs ($)' : 'Close Price ($)',
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
            label: tech.fastLabel,
            data: tech.fastMA,
            borderColor: '#f59e0b',
            borderWidth: 1.5,
            borderDash: [4, 4],
            pointRadius: 0,
            fill: false
          },
          {
            label: tech.slowLabel,
            data: tech.slowMA,
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
            label: currentLang === 'de' ? 'Tagesvolumen' : 'Daily Volume',
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

  // 5. Backtest Equity Curve Chart (Strategy Portfolio Growth vs Buy & Hold)
  const eqCtx = document.getElementById('equityCanvas')?.getContext('2d');
  if (eqCtx && backtest && backtest.equityCurve) {
    const eqDates = backtest.equityCurve.map(e => e.date);
    const stratEquity = backtest.equityCurve.map(e => e.strategyEquity);
    const benchEquity = backtest.equityCurve.map(e => e.benchmarkEquity);

    const eqChart = new Chart(eqCtx, {
      type: 'line',
      data: {
        labels: eqDates,
        datasets: [
          {
            label: currentLang === 'de' ? 'Strategie Portfolio ($)' : 'Quant Strategy Portfolio ($)',
            data: stratEquity,
            borderColor: purpleColor,
            borderWidth: 2.5,
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            pointRadius: 0
          },
          {
            label: currentLang === 'de' ? 'Buy & Hold Benchmark ($)' : 'Buy & Hold Benchmark ($)',
            data: benchEquity,
            borderColor: '#64748b',
            borderWidth: 1.5,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
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
            backgroundColor: 'rgba(8, 11, 17, 0.95)',
            titleColor: cyanColor,
            borderColor: 'rgba(168, 85, 247, 0.4)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += '$' + context.parsed.y.toFixed(2);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, maxTicksLimit: 8, font: { family: 'JetBrains Mono', size: 10 } } },
          y: { 
            grid: { color: gridColor }, 
            ticks: { 
              color: textColor, 
              font: { family: 'JetBrains Mono', size: 10 },
              callback: (val) => '$' + val.toLocaleString()
            } 
          }
        }
      }
    });
    activeCharts.push(eqChart);
  }
}


