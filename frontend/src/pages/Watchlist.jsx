import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Plus, 
  TrendingUp, 
  LineChart, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

export default function Watchlist({ setSelectedStock, setActivePage }) {
  const [watchlist, setWatchlist] = useState([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await api.getWatchlist();
      setWatchlist(items);
    } catch (err) {
      setError(err.message || 'Failed to load watchlist.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const sym = newSymbol.trim().toUpperCase();
    if (!sym) return;

    setSubmitting(true);
    try {
      await api.addToWatchlist(sym);
      setNewSymbol('');
      await loadWatchlist();
    } catch (err) {
      alert(err.message || 'Error adding stock to watchlist.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (symbol) => {
    if (!window.confirm(`Remove ${symbol} from watchlist?`)) return;
    try {
      await api.removeFromWatchlist(symbol);
      setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
    } catch (err) {
      alert(err.message || 'Failed to remove stock.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Add form */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans m-0">
                Portfolio Watchlist
              </h1>
              <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                SQLite Persistence
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Curated list of monitored equity instruments with live quotes and direct analytical shortcuts.
            </p>
          </div>

          <button
            onClick={loadWatchlist}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium border border-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feeds</span>
          </button>
        </div>

        {/* Add Symbol Input */}
        <form onSubmit={handleAdd} className="pt-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            placeholder="Enter symbol (e.g. INFY.NS, TSLA, NVDA)..."
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono uppercase focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 w-64"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center space-x-1 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-2xs disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{submitting ? 'Adding...' : 'Add to Watchlist'}</span>
          </button>
        </form>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded text-rose-800 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-1 text-rose-600" />
          {error}
        </div>
      ) : loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded border border-slate-200">
          Loading watchlist records and refreshing market quotes...
        </div>
      ) : watchlist.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 rounded border border-slate-200 text-sm">
          Your watchlist is currently empty. Add stocks above to monitor their performance.
        </div>
      ) : (
        <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Symbol</th>
                  <th className="py-2.5 px-4 font-semibold font-sans">Company Name</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Latest Price</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Day Change</th>
                  <th className="py-2.5 px-4 font-semibold text-right">% Change</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Volume</th>
                  <th className="py-2.5 px-4 font-semibold text-center font-sans">Quick Navigation</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {watchlist.map((item) => {
                  const q = item.quote;
                  const isUp = q ? q.change >= 0 : false;
                  return (
                    <tr key={item.symbol} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-blue-700 font-mono text-sm">
                        {item.symbol}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700 font-medium">
                        {item.name || q?.name || item.symbol}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {q ? `$${q.price.toFixed(2)}` : '—'}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {q ? `${isUp ? '+' : ''}$${q.change.toFixed(2)}` : '—'}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {q ? `${isUp ? '+' : ''}${q.percent_change.toFixed(2)}%` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {q ? q.volume.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStock(item.symbol);
                              setActivePage('analysis');
                            }}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
                            title="View Technical Indicators"
                          >
                            <TrendingUp className="w-3 h-3 text-blue-600" />
                            <span>Analysis</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStock(item.symbol);
                              setActivePage('prediction');
                            }}
                            className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-medium transition-colors"
                            title="Run ML Price Model"
                          >
                            <LineChart className="w-3 h-3 text-blue-700" />
                            <span>Predict</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleRemove(item.symbol)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Remove from Watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
