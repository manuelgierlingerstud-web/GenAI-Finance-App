/**
 * Twelve Data authenticated API integration with multi-symbol support and sessionStorage cache.
 */

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function getTwelveDataKey() {
  return sessionStorage.getItem('twelvedata_api_key') || '';
}

export function setTwelveDataKey(key) {
  if (key) sessionStorage.setItem('twelvedata_api_key', key.trim());
  else sessionStorage.removeItem('twelvedata_api_key');
}

export function clearSessionKeys() {
  sessionStorage.removeItem('twelvedata_api_key');
  sessionStorage.removeItem('openrouter_api_key');
}

export async function fetchTimeSeries(symbol, outputsize = 90) {
  const apiKey = getTwelveDataKey();
  if (!apiKey) {
    throw new Error('Twelve Data API key required. Please enter your key in the configuration panel.');
  }

  const cacheKey = `td_ts_${symbol}_${outputsize}`;
  const cached = sessionStorage.getItem(cacheKey);
  const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
  if (cached && cacheTime && (Date.now() - Number(cacheTime) < CACHE_TTL_MS)) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore parse error
    }
  }

  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=${outputsize}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Twelve Data HTTP error: ${res.status}`);
  }
  const data = await res.json();
  if (data.code && data.code !== 200) {
    throw new Error(data.message || `Twelve Data error for ${symbol}`);
  }

  if (!data.values || !Array.isArray(data.values)) {
    throw new Error(`Invalid price data response format for ${symbol}`);
  }

  // Twelve Data returns newest first, reverse to chronological ascending
  const formatted = data.values.map(v => ({
    date: v.datetime,
    open: parseFloat(v.open),
    high: parseFloat(v.high),
    low: parseFloat(v.low),
    close: parseFloat(v.close),
    volume: parseInt(v.volume || '0', 10)
  })).reverse();

  sessionStorage.setItem(cacheKey, JSON.stringify(formatted));
  sessionStorage.setItem(`${cacheKey}_time`, String(Date.now()));

  return formatted;
}

export async function fetchBatchQuotes(symbolsArray) {
  const apiKey = getTwelveDataKey();
  if (!apiKey) {
    throw new Error('Twelve Data API key required for batch quotes.');
  }

  const joinedSymbols = symbolsArray.join(',');
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(joinedSymbols)}&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Batch quote HTTP error: ${res.status}`);
  const data = await res.json();
  return data;
}
