export const PORTFOLIO_UNIVERSE = [
  // Core Thesis Universe (10)
  { ticker: 'NVDA', name: 'NVIDIA', role: 'AI accelerators', core: true },
  { ticker: 'AMD', name: 'Advanced Micro Devices', role: 'AI accelerators and CPUs', core: true },
  { ticker: 'AVGO', name: 'Broadcom', role: 'networking and custom silicon', core: true },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', role: 'semiconductor foundry', core: true },
  { ticker: 'ASML', name: 'ASML Holding', role: 'lithography', core: true },
  { ticker: 'ARM', name: 'Arm Holdings', role: 'processor architecture and IP', core: true },
  { ticker: 'MU', name: 'Micron Technology', role: 'memory', core: true },
  { ticker: 'AMAT', name: 'Applied Materials', role: 'wafer fabrication equipment', core: true },
  { ticker: 'LRCX', name: 'Lam Research', role: 'wafer fabrication equipment', core: true },
  { ticker: 'KLAC', name: 'KLA Corp', role: 'process control and inspection', core: true },

  // Portfolio Satellites (10)
  { ticker: 'QCOM', name: 'Qualcomm', role: 'connectivity and edge AI', core: false },
  { ticker: 'MRVL', name: 'Marvell Technology', role: 'networking and custom silicon', core: false },
  { ticker: 'ANET', name: 'Arista Networks', role: 'AI data-center networking', core: false },
  { ticker: 'SMCI', name: 'Super Micro Computer', role: 'AI servers', core: false },
  { ticker: 'DELL', name: 'Dell Technologies', role: 'enterprise AI infrastructure', core: false },
  { ticker: 'MSFT', name: 'Microsoft', role: 'cloud and AI software', core: false },
  { ticker: 'GOOGL', name: 'Alphabet', role: 'cloud, models and AI platforms', core: false },
  { ticker: 'AMZN', name: 'Amazon.com', role: 'AWS AI infrastructure', core: false },
  { ticker: 'META', name: 'Meta Platforms', role: 'AI platforms and infrastructure', core: false },
  { ticker: 'ORCL', name: 'Oracle', role: 'cloud infrastructure', core: false }
];

export const STRATEGY_CAPITAL = 1000000; // USD 1,000,000
export const NEUTRAL_SENTIMENT_BAND = 0.005;
export const MAX_STOCK_WEIGHT = 0.08; // 8%
export const MIN_ACTIVE_STOCK_WEIGHT = 0.02; // 2%
