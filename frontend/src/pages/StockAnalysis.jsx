import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  HelpCircle, 
  RefreshCw, 
  AlertCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import IndicatorCharts from '../components/IndicatorCharts';
import { api } from '../services/api';

export default function StockAnalysis({ selectedStock, setSelectedStock }) {
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('1y');

  useEffect(() => {
    loadIndicators(selectedStock, period);
  }, [selectedStock, period]);

  const loadIndicators = async (sym, p) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIndicators(sym, p);
      setIndicators(data);
    } catch (err) {
      setError(err.message || 'Failed to compute technical indicators.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans m-0">
              Quantitative Technical Analysis: {selectedStock}
            </h1>
            <span className="text-xs bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded border border-blue-200 font-semibold">
              Mathematical Indicators
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic calculations of moving averages, momentum oscillators, volatility, and volume indicators.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded border border-slate-200 text-xs font-mono">
            {['6mo', '1y', '2y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded transition-colors ${
                  period === p ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadIndicators(selectedStock, period)}
            className="flex items-center space-x-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded font-medium border border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded text-rose-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded border border-slate-200">
          Calculating statistical indicators from historical OHLCV data...
        </div>
      ) : (
        <>
          <IndicatorCharts indicatorsData={indicators} currency="$" />

          {/* Educational / Mathematical Reference Cards for Viva Presentation */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-700" />
              <span>Indicator Formulae & Mathematical Formulations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Relative Strength Index (RSI 14)</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Measures velocity and magnitude of price directional movements using Wilder's smoothed average:
                </p>
                <code className="text-[11px] bg-white p-1 rounded border border-slate-200 block text-slate-800 font-mono">
                  RSI = 100 - [100 / (1 + AvgGain / AvgLoss)]
                </code>
                <span className="text-[10px] text-slate-500 block">Thresholds: &gt;70 Overbought, &lt;30 Oversold</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Moving Average Convergence Divergence (MACD)</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Trend-following momentum indicator displaying relationship between two exponential averages:
                </p>
                <code className="text-[11px] bg-white p-1 rounded border border-slate-200 block text-slate-800 font-mono">
                  MACD = EMA(12) - EMA(26); Signal = EMA(MACD, 9)
                </code>
                <span className="text-[10px] text-slate-500 block">Histogram = MACD - Signal</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Rolling Annualized Volatility</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Standard deviation of log/daily percentage returns annualized across standard 252 market days:
                </p>
                <code className="text-[11px] bg-white p-1 rounded border border-slate-200 block text-slate-800 font-mono">
                  σ_ann = std(Daily_Returns_20d) × √252
                </code>
                <span className="text-[10px] text-slate-500 block">Quantifies systematic dispersion and risk.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
