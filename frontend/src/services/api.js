/**
 * StockVision API Service
 * Handles all HTTP communication with the Python FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server returned error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Market Summary
  getMarketSummary: () => fetchJson('/api/stocks/market-summary'),

  // Search
  searchStocks: (query) => fetchJson(`/api/stocks?q=${encodeURIComponent(query || '')}`),

  // Quote
  getQuote: (symbol) => fetchJson(`/api/stocks/${encodeURIComponent(symbol)}`),

  // Historical OHLCV
  getHistory: (symbol, period = '1y') =>
    fetchJson(`/api/stocks/${encodeURIComponent(symbol)}/history?period=${period}`),

  // Technical Indicators
  getIndicators: (symbol, period = '1y') =>
    fetchJson(`/api/stocks/${encodeURIComponent(symbol)}/indicators?period=${period}`),

  // Machine Learning Prediction
  predict: (symbol, modelName = 'linear_regression', periodDays = 7) =>
    fetchJson('/api/predict', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        model_name: modelName,
        period_days: periodDays
      })
    }),

  // Multi-asset Comparison
  compare: (symbols, period = '6mo') => {
    const symParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return fetchJson(`/api/compare?symbols=${encodeURIComponent(symParam)}&period=${period}`);
  },

  // Watchlist Management
  getWatchlist: () => fetchJson('/api/watchlist'),
  addToWatchlist: (symbol, name) =>
    fetchJson('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify({ symbol, name })
    }),
  removeFromWatchlist: (symbol) =>
    fetchJson(`/api/watchlist/${encodeURIComponent(symbol)}`, {
      method: 'DELETE'
    })
};
