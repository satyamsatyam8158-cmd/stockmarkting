import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

export default function IndicatorCharts({ indicatorsData, currency = "$" }) {
  const [activeTab, setActiveTab] = useState('ma'); // 'ma', 'rsi', 'macd', 'returns'

  if (!indicatorsData || !indicatorsData.series || indicatorsData.series.length === 0) {
    return (
      <div className="bg-white p-6 rounded border border-slate-200 text-center text-slate-400 text-sm">
        No indicator calculations available.
      </div>
    );
  }

  const { summary, series } = indicatorsData;

  // Custom tooltips
  const MATooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded text-xs font-mono shadow border border-slate-700">
          <div className="text-slate-400 font-sans mb-1 font-semibold">{data.date}</div>
          <div>Close: {currency}{data.close?.toFixed(2)}</div>
          <div className="text-amber-400">SMA 20: {data.sma20 ? `${currency}${data.sma20}` : 'N/A'}</div>
          <div className="text-blue-400">SMA 50: {data.sma50 ? `${currency}${data.sma50}` : 'N/A'}</div>
          <div className="text-emerald-400">EMA 20: {data.ema20 ? `${currency}${data.ema20}` : 'N/A'}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Indicator Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-3.5 rounded border border-slate-200">
          <div className="text-[11px] uppercase font-mono text-slate-500">14-Day RSI</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {summary.current_rsi ? summary.current_rsi.toFixed(2) : '—'}
          </div>
          <div className={`text-[11px] font-semibold mt-1 ${
            (summary.current_rsi || 50) >= 70 ? 'text-rose-600' :
            (summary.current_rsi || 50) <= 30 ? 'text-emerald-600' : 'text-slate-600'
          }`}>
            {summary.rsi_status}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded border border-slate-200">
          <div className="text-[11px] uppercase font-mono text-slate-500">MACD (12, 26, 9)</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {summary.current_macd ? summary.current_macd.toFixed(2) : '—'}
          </div>
          <div className="text-[11px] font-semibold mt-1 text-slate-600">
            {summary.macd_status}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded border border-slate-200">
          <div className="text-[11px] uppercase font-mono text-slate-500">20-Day Annualized Volatility</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {summary.annualized_volatility ? `${summary.annualized_volatility.toFixed(2)}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {(summary.annualized_volatility || 0) > 30 ? 'High historical price variance' : 'Moderate historical variance'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded border border-slate-200">
          <div className="text-[11px] uppercase font-mono text-slate-500">Trend Averages (20 / 50 SMA)</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1.5 flex items-center space-x-2">
            <span className="text-amber-600 font-mono">SMA20: {currency}{summary.sma20 || '—'}</span>
            <span className="text-slate-400">|</span>
            <span className="text-blue-600 font-mono">SMA50: {currency}{summary.sma50 || '—'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {summary.sma20 && summary.sma50 && summary.sma20 > summary.sma50 
              ? 'Bullish alignment (SMA20 > SMA50)' 
              : 'Bearish alignment (SMA20 < SMA50)'}
          </div>
        </div>
      </div>

      {/* Indicator Chart Container */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
        {/* Sub-Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-2">
          <div>
            <h4 className="font-bold text-slate-900 text-sm font-sans">Technical Analysis Visualizations</h4>
            <p className="text-xs text-slate-500">Select an indicator chart to analyze mathematical trends</p>
          </div>

          <div className="flex space-x-1 bg-slate-100 p-1 rounded border border-slate-200 text-xs font-mono">
            <button
              onClick={() => setActiveTab('ma')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'ma' ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-200' : 'text-slate-600'
              }`}
            >
              Moving Averages (SMA / EMA)
            </button>
            <button
              onClick={() => setActiveTab('rsi')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'rsi' ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-200' : 'text-slate-600'
              }`}
            >
              RSI (14)
            </button>
            <button
              onClick={() => setActiveTab('macd')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'macd' ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-200' : 'text-slate-600'
              }`}
            >
              MACD & Signal
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'returns' ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-200' : 'text-slate-600'
              }`}
            >
              Daily Returns (%)
            </button>
          </div>
        </div>

        {/* 1. Moving Averages Tab */}
        {activeTab === 'ma' && (
          <div>
            <div className="flex items-center space-x-4 mb-2 text-xs font-mono">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-slate-800 rounded-full mr-1.5"></span> Close Price</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-1.5"></span> 20 SMA</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-1.5"></span> 50 SMA</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-1.5"></span> 20 EMA</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={40} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${currency}${v}`} />
                  <Tooltip content={<MATooltip />} />
                  <Line type="monotone" dataKey="close" stroke="#1e293b" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="sma50" stroke="#2563eb" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="ema20" stroke="#10b981" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. RSI Tab */}
        {activeTab === 'rsi' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
              <span>Standard 14-period Wilder RSI calculation</span>
              <span className="text-rose-600 font-semibold">Overbought ≥ 70 | Oversold ≤ 30</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={40} />
                  <YAxis domain={[0, 100]} ticks={[0, 30, 50, 70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="3 3" label={{ value: '70 Overbought', fill: '#dc2626', fontSize: 10 }} />
                  <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="2 2" />
                  <ReferenceLine y={30} stroke="#16a34a" strokeDasharray="3 3" label={{ value: '30 Oversold', fill: '#16a34a', fontSize: 10 }} />
                  <Tooltip 
                    formatter={(val) => [val?.toFixed(2), 'RSI (14)']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Line type="monotone" dataKey="rsi" stroke="#7c3aed" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. MACD Tab */}
        {activeTab === 'macd' && (
          <div>
            <div className="flex items-center space-x-4 mb-2 text-xs font-mono">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-1.5"></span> MACD Line (12,26)</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-1.5"></span> Signal Line (9)</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-slate-400 rounded-sm mr-1.5"></span> Histogram</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={40} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <ReferenceLine y={0} stroke="#64748b" />
                  <Tooltip 
                    formatter={(val, name) => [val?.toFixed(3), name]}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Bar dataKey="macd_hist" name="Histogram" fill="#94a3b8" />
                  <Line type="monotone" dataKey="macd" name="MACD" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="macd_signal" name="Signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. Daily Returns Tab */}
        {activeTab === 'returns' && (
          <div>
            <div className="text-xs text-slate-500 mb-2 font-mono">
              Daily percentage changes across the analysis horizon
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={40} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                  <ReferenceLine y={0} stroke="#64748b" />
                  <Tooltip 
                    formatter={(val) => [`${val?.toFixed(2)}%`, 'Daily Return']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Bar dataKey="daily_return" fill="#3b82f6" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
