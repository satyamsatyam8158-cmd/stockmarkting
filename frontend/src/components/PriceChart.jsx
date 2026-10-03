import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const PERIODS = [
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
];

export default function PriceChart({ 
  data = [], 
  period = '1y', 
  onPeriodChange, 
  currency = "$", 
  symbol = "" 
}) {
  const [chartType, setChartType] = useState('area'); // 'area' or 'line'

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400 text-sm">
        No price history data available for this timeframe.
      </div>
    );
  }

  // Calculate min and max for domain
  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.05;
  const yDomain = [
    Math.max(0, Math.floor(minPrice - padding)),
    Math.ceil(maxPrice + padding)
  ];

  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isNetPositive = lastPrice >= firstPrice;
  const strokeColor = isNetPositive ? '#16a34a' : '#dc2626'; // Green or Red
  const fillColor = isNetPositive ? '#dcfce7' : '#fee2e2';

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded text-xs font-mono shadow-md border border-slate-700">
          <div className="text-slate-400 border-b border-slate-700 pb-1 mb-1 font-sans font-semibold">
            {item.date}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span className="text-slate-400">Close:</span>
            <span className="font-bold text-white text-right">{currency}{item.close?.toFixed(2)}</span>
            {item.open && (
              <>
                <span className="text-slate-400">Open:</span>
                <span className="text-right">{currency}{item.open?.toFixed(2)}</span>
              </>
            )}
            {item.high && (
              <>
                <span className="text-slate-400">High:</span>
                <span className="text-emerald-400 text-right">{currency}{item.high?.toFixed(2)}</span>
              </>
            )}
            {item.low && (
              <>
                <span className="text-slate-400">Low:</span>
                <span className="text-rose-400 text-right">{currency}{item.low?.toFixed(2)}</span>
              </>
            )}
            {item.volume && (
              <>
                <span className="text-slate-400">Volume:</span>
                <span className="text-right text-slate-300">{item.volume.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 font-sans">{symbol} Historical Price Action</h3>
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
              isNetPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {isNetPositive ? '+' : ''}{(((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)}% in period
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Adjusted daily closing prices and exchange trading volume</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded border border-slate-200 text-xs font-mono font-medium">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange && onPeriodChange(p.value)}
              className={`px-2.5 py-1 rounded transition-colors ${
                period === p.value
                  ? 'bg-white text-blue-700 font-bold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Price Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              tickLine={false} 
              axisLine={{ stroke: '#cbd5e1' }}
              minTickGap={40}
            />
            <YAxis 
              domain={yDomain} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `${currency}${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke={strokeColor} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#priceGradient)" 
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Synchronized Volume Bar Sub-Chart */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono mb-1">
          <span>TRADING VOLUME</span>
          <span>Avg: {(data.reduce((a, c) => a + (c.volume || 0), 0) / (data.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })} shares</span>
        </div>
        <div className="h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#f8fafc" vertical={false} />
              <XAxis dataKey="date" hide={true} />
              <YAxis 
                tick={{ fontSize: 9, fill: '#94a3b8' }} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(val) => [val.toLocaleString(), 'Volume']}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
              />
              <Bar dataKey="volume" fill="#94a3b8" opacity={0.65} radius={[1, 1, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
