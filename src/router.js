/**
 * Lightweight hash router for switching between #/analysis and #/portfolio.
 */
import { renderPortfolioView } from './views/portfolioView.js';
import { renderAnalysisView } from './views/analysisView.js';

export function initRouter() {
  const handleRoute = async () => {
    const hash = window.location.hash || '#/analysis';
    const mainEl = document.querySelector('main.app-main');

    // Check if portfolio container exists or create it
    let portfolioContainer = document.getElementById('portfolio-view-container');
    if (!portfolioContainer) {
      portfolioContainer = document.createElement('div');
      portfolioContainer.id = 'portfolio-view-container';
      portfolioContainer.style.display = 'none';
      mainEl.appendChild(portfolioContainer);
    }

    // Get original analysis panels
    const analysisPanels = Array.from(mainEl.querySelectorAll('.glass-panel'));

    if (hash === '#/portfolio') {
      analysisPanels.forEach(p => p.style.display = 'none');
      portfolioContainer.style.display = 'block';
      await renderPortfolioView(portfolioContainer);
      updateNavActiveState('#nav-portfolio-btn');
    } else {
      portfolioContainer.style.display = 'none';
      analysisPanels.forEach(p => p.style.display = 'block');
      updateNavActiveState('#nav-analysis-btn');
    }
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function updateNavActiveState(activeSelector) {
  const analysisBtn = document.getElementById('nav-analysis-btn');
  const portfolioBtn = document.getElementById('nav-portfolio-btn');
  if (analysisBtn && portfolioBtn) {
    analysisBtn.style.opacity = activeSelector === '#nav-analysis-btn' ? '1' : '0.7';
    portfolioBtn.style.opacity = activeSelector === '#nav-portfolio-btn' ? '1' : '0.7';
  }
}
