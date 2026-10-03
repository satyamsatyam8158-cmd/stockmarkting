import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  X, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../services/api';

const COLOR_PALETTE = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626'];

export default function Compare({ setSelectedStock, setActivePage }) {
  const [selectedSymbols, setSelectedSymbols] = useState(['AAPL', 'MSFT', 'GOOGL']);
  const [inputSymbol, setInputSymbol] = useState('');
  const [period, setPeriod] = useState('6mo');
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedSymbols.length > 0) {
      loadComparison();
    }
  }, [selectedSymbols, period]);

  const loadComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.compare(selectedSymbols, period);
      setComparisonData(data);
    } catch (err) {
      setError(err.message || 'Failed to compare stocks.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymbol = (e) => {
    e.preventDefault();
    const sym = inputSymbol.trim().toUpperCase();
    if (!sym) return;
    if (selectedSymbols.includes(sym)) {
      alert(`${sym} is already in the comparison set.`);
      return;
    }
    if (selectedSymbols.length >= 5) {
      alert("Maximum 5 stocks can be compared simultaneously for optimal clarity.");
      return;
    }
    setSelectedSymbols([...selectedSymbols, sym]);
    setInputSymbol('');
  };

  const handleRemoveSymbol = (sym) => {
    if (selectedSymbols.length <= 1) {
      alert("Please keep at least one stock to compare.");
      return;
    }
    setSelectedSymbols(selectedSymbols.filter(s => s !== sym));
  };

  // Merge series for Recharts line chart by Date
  const buildMergedChartData = () => {
    if (!comparisonData || comparisonData.length === 0) return [];
    const dateMap = {};

    comparisonData.forEach(item => {
      item.data.forEach(pt => {
        if (!dateMap[pt.date]) {
          dateMap[pt.date] = { date: pt.date };
        }
        dateMap[pt.date][item.symbol] = pt.return_pct;
      });
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  };

  const chartSeries = buildMergedChartData();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans m-0">
                Multi-Asset Performance Comparison
              </h1>
              <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                Normalized Return Analysis
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evaluates relative capital growth, annualized price volatility, and liquidity across chosen equities.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            {['1mo', '3mo', '6mo', '1y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded transition-colors ${
                  period === p ? 'bg-blue-700 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Symbol Badges and Add Form */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">COMPARING:</span>
            {selectedSymbols.map((sym, index) => (
              <span
                key={sym}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLOR_PALETTE[index % COLOR_PALETTE.length] }}
                ></span>
                <span>{sym}</span>
                <button
                  onClick={() => handleRemoveSymbol(sym)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddSymbol} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="Add symbol (e.g. NVDA)"
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono uppercase focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 w-40"
            />
            <button
              type="submit"
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded text-rose-800 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-1 text-rose-600" />
          {error}
        </div>
      ) : loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded border border-slate-200">
          Fetching and normalizing comparative historical time-series...
        </div>
      ) : (
        <>
          {/* Comparative Line Chart (Normalized % Return) */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Normalized Performance Curve (% Return from Start Date)
              </h3>
              <p className="text-xs text-slate-500">
                Baseline set to 0.00% at the start of the selected {period.toUpperCase()} period for direct apples-to-apples comparison.
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={35} />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
                  />
                  <Tooltip 
                    formatter={(val, name) => [`${val > 0 ? '+' : ''}${val?.toFixed(2)}%`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {comparisonData.map((item, idx) => (
                    <Line
                      key={item.symbol}
                      type="monotone"
                      dataKey={item.symbol}
                      name={`${item.symbol} (${item.percent_change_period > 0 ? '+' : ''}${item.percent_change_period}%)`}
                      stroke={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparative Financial Metrics Table */}
          <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-sans">Comparative Risk & Liquidity Metrics</h3>
              <p className="text-xs text-slate-500">Summary table comparing current quote, net period growth, and historical volatility</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Symbol</th>
                    <th className="py-2.5 px-4 font-semibold font-sans">Company Name</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Latest Close</th>
                    <th className="py-2.5 px-4 font-semibold text-right">{period.toUpperCase()} Return</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Annualized Volatility</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Avg Daily Volume</th>
                    <th className="py-2.5 px-4 font-semibold text-center font-sans">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonData.map((item, idx) => {
                    const isPos = item.percent_change_period >= 0;
                    return (
                      <tr key={item.symbol} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }}
                          ></span>
                          <span>{item.symbol}</span>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-700">{item.name}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">${item.current_price.toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPos ? '+' : ''}{item.percent_change_period.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700">{item.volatility.toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right text-slate-700">{item.avg_volume.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center font-sans">
                          <button
                            onClick={() => {
                              setSelectedStock(item.symbol);
                              setActivePage('analysis');
                            }}
                            className="text-blue-700 hover:text-blue-900 font-semibold underline text-xs"
                          >
                            Analyze
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
