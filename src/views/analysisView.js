/**
 * Single Asset Analysis View (router view component).
 */
export function renderAnalysisView(container, state) {
  // The analysis markup is already the default content of index.html
  // We can ensure the analysis view is shown and portfolio view is hidden.
  const analysisEl = document.getElementById('analysis-view-container');
  const portfolioEl = document.getElementById('portfolio-view-container');
  if (analysisEl) analysisEl.style.display = 'block';
  if (portfolioEl) portfolioEl.style.display = 'none';
}
