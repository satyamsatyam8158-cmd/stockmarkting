import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Plus, 
  Check, 
  BarChart2, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import PriceChart from '../components/PriceChart';
import { api } from '../services/api';

export default function Dashboard({ selectedStock, setSelectedStock, setActivePage }) {
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchlistStatus, setWatchlistStatus] = useState(false);
  const [addingWatchlist, setAddingWatchlist] = useState(false);

  useEffect(() => {
    loadStockData(selectedStock, period);
  }, [selectedStock, period]);

  const loadStockData = async (sym, p) => {
    setLoading(true);
    setError(null);
    try {
      const [quoteRes, histRes] = await Promise.all([
        api.getQuote(sym),
        api.getHistory(sym, p)
      ]);
      setQuote(quoteRes);
      setHistory(histRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve stock market data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!quote) return;
    setAddingWatchlist(true);
    try {
      await api.addToWatchlist(quote.symbol, quote.name);
      setWatchlistStatus(true);
      setTimeout(() => setWatchlistStatus(false), 3000);
    } catch (err) {
      alert(err.message || 'Error updating watchlist');
    } finally {
      setAddingWatchlist(false);
    }
  };

  const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'TSLA', 'RELIANCE.NS', 'TCS.NS'];

  return (
    <div className="space-y-6">
      {/* Quick Ticker Switcher Strip */}
      <div className="bg-white px-4 py-2.5 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          <span className="uppercase font-mono text-[11px] text-slate-400">Popular Tickers:</span>
          <div className="flex flex-wrap gap-1.5 font-mono">
            {popularTickers.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedStock(t)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  selectedStock === t
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadStockData(selectedStock, period)}
            className="flex items-center space-x-1 text-xs text-slate-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-slate-100"
            title="Refresh market data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded text-rose-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error loading ticker data:</span> {error}
            <div className="mt-2">
              <button 
                onClick={() => setSelectedStock('AAPL')}
                className="text-xs font-semibold text-rose-700 underline"
              >
                Reset to AAPL (Apple Inc.)
              </button>
            </div>
          </div>
        </div>
      ) : quote ? (
        <>
          {/* Active Ticker Hero Banner */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans m-0">{quote.name}</h1>
                <span className="text-sm font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                  {quote.symbol}
                </span>
                <span className="text-xs text-slate-400 font-mono uppercase">{quote.currency}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1 font-mono">
                <span>Last Updated: {quote.last_updated}</span>
                <span>•</span>
                <span>Real-time / Delayed Exchange Data</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddToWatchlist}
                disabled={addingWatchlist || watchlistStatus}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                  watchlistStatus
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {watchlistStatus ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{watchlistStatus ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={() => setActivePage('prediction')}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-2xs"
              >
                Forecast Price
              </button>

              <button
                onClick={() => setActivePage('analysis')}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-2xs"
              >
                Technical Indicators
              </button>
            </div>
          </div>

          {/* Core Snapshot Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              title="Latest Price"
              value={quote.price}
              change={quote.change}
              changePercent={quote.percent_change}
              isCurrency={true}
              currency="$"
            />
            <MetricCard
              title="Open Price"
              value={quote.open}
              isCurrency={true}
              currency="$"
              subtitle={`Prev Close: $${quote.previous_close}`}
            />
            <MetricCard
              title="Day High"
              value={quote.high}
              isCurrency={true}
              currency="$"
              badge="High"
            />
            <MetricCard
              title="Day Low"
              value={quote.low}
              isCurrency={true}
              currency="$"
              badge="Low"
            />
            <MetricCard
              title="Trading Volume"
              value={quote.volume.toLocaleString()}
              subtitle="Total shares traded"
            />
            <MetricCard
              title="52-Week Range"
              value={`$${quote.fifty_two_week_low || '—'} - $${quote.fifty_two_week_high || '—'}`}
              subtitle={quote.market_cap ? `Mkt Cap: $${(quote.market_cap / 1e9).toFixed(1)}B` : 'Equity'}
            />
          </div>

          {/* Interactive Price Chart with Historical Range Selector */}
          <PriceChart
            data={history}
            period={period}
            onPeriodChange={setPeriod}
            currency="$"
            symbol={quote.symbol}
          />

          {/* Supplementary Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
                Trading Summary & Key Fundamentals
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-sans">Previous Close:</span>
                  <span className="font-semibold text-slate-800">${quote.previous_close?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-sans">Open Price:</span>
                  <span className="font-semibold text-slate-800">${quote.open?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-sans">Day's Range:</span>
                  <span className="font-semibold text-slate-800">${quote.low} - ${quote.high}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-sans">52-Week Range:</span>
                  <span className="font-semibold text-slate-800">${quote.fifty_two_week_low} - ${quote.fifty_two_week_high}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-sans">P/E Ratio:</span>
                  <span className="font-semibold text-slate-800">{quote.pe_ratio ? quote.pe_ratio.toFixed(2) : 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500 font-sans">Market Cap:</span>
                  <span className="font-semibold text-slate-800">
                    {quote.market_cap ? `$${(quote.market_cap / 1e9).toFixed(2)} Billion` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
                Project Technical Overview
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                StockVision operates on a decoupled client-server architecture. Historical quotes and fundamental indicators are calculated in real time using Python (Pandas/NumPy) on historical OHLCV data.
              </p>
              <div className="mt-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono space-y-1 text-slate-700">
                <div>• Pipeline: Time-series feature extraction & regression</div>
                <div>• Data Feed: Daily adjusted OHLCV exchange quotes</div>
                <div>• Storage: SQLite database with schema for watchlist tracking</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-12 text-center text-slate-500 rounded border border-slate-200">
          Loading market snapshot...
        </div>
      )}
    </div>
  );
}
