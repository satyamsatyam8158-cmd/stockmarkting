import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changePercent, 
  subtitle, 
  isCurrency = false,
  currency = "$",
  badge,
  trend = "neutral" // 'up', 'down', 'neutral'
}) {
  const isUp = trend === 'up' || (changePercent && changePercent > 0);
  const isDown = trend === 'down' || (changePercent && changePercent < 0);

  return (
    <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>{title}</span>
        {badge && (
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="text-xl font-bold font-mono tracking-tight text-slate-900">
          {isCurrency && currency}
          {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (value || '—')}
        </span>

        {(change !== undefined || changePercent !== undefined) && (
          <div className={`text-xs font-mono font-semibold flex items-center space-x-1 ${
            isUp ? 'text-emerald-600' : isDown ? 'text-rose-600' : 'text-slate-500'
          }`}>
            <span>
              {isUp ? '▲ +' : isDown ? '▼ ' : ''}
              {change !== undefined && typeof change === 'number' ? change.toFixed(2) : ''}
              {changePercent !== undefined && ` (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`}
            </span>
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-1 text-[11px] text-slate-400 font-normal">
          {subtitle}
        </div>
      )}
    </div>
  );
}
