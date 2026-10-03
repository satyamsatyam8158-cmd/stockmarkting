import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Settings2, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle,
  Database,
  BarChart,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';

export default function Prediction({ selectedStock, setSelectedStock }) {
  const [modelType, setModelType] = useState('random_forest'); // 'linear_regression' or 'random_forest'
  const [periodDays, setPeriodDays] = useState(7);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Run prediction when symbol, model, or period changes
  useEffect(() => {
    runModelPrediction();
  }, [selectedStock, modelType, periodDays]);

  const runModelPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.predict(selectedStock, modelType, periodDays);
      setPredictionData(data);
    } catch (err) {
      setError(err.message || 'Model prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  // Build combined forecast chart data
  const buildForecastSeries = () => {
    if (!predictionData) return [];
    const points = [];
    
    // Last 15 evaluation points as anchor
    const evalTail = predictionData.evaluation_series.slice(-15);
    evalTail.forEach(pt => {
      points.push({
        date: pt.date,
        historicalActual: pt.actual,
        historicalPredicted: pt.predicted,
        futureForecast: null
      });
    });

    // Anchor point
    if (points.length > 0) {
      points[points.length - 1].futureForecast = points[points.length - 1].historicalActual;
    }

    // Future projections
    predictionData.future_series.forEach(f => {
      points.push({
        date: f.date,
        historicalActual: null,
        historicalPredicted: null,
        futureForecast: f.predicted_price
      });
    });

    return points;
  };

  const forecastData = buildForecastSeries();

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans m-0">
                Machine Learning Price Estimation
              </h1>
              <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                Scikit-Learn Pipeline
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supervised regression modeling based on lagged closing prices, volume ratios, and technical oscillators.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runModelPrediction}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-2xs transition-colors disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Training Model...' : 'Train & Predict'}</span>
            </button>
          </div>
        </div>

        {/* Model Parameters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
          <div>
            <label className="block text-slate-500 font-sans font-medium mb-1">Target Stock Symbol</label>
            <input
              type="text"
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL"
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-sans font-medium mb-1">Regression Algorithm</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-sans text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="linear_regression">Linear Regression (Baseline OLS)</option>
              <option value="random_forest">Random Forest Regression (Ensemble 100 Trees)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-sans font-medium mb-1">Forecast Horizon</label>
            <div className="flex space-x-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriodDays(days)}
                  className={`flex-1 py-1.5 rounded font-mono transition-colors border ${
                    periodDays === days
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold'
                      : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded text-rose-800 text-sm">
          <span className="font-bold">Model execution halted:</span> {error}
        </div>
      ) : loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded border border-slate-200">
          <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-3"></div>
          <p className="text-sm font-medium">Extracting technical features and training {modelType === 'random_forest' ? 'Random Forest' : 'Linear Regression'} model...</p>
          <p className="text-xs text-slate-400 mt-1">Applying chronological 80/20 train-test split without time shuffling.</p>
        </div>
      ) : predictionData ? (
        <>
          {/* Key Prediction Result Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
              <div className="text-[11px] uppercase font-mono text-slate-400">Current Reference Price</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ${predictionData.current_price.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Base Date: {predictionData.last_date}
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
              <div className="text-[11px] uppercase font-mono text-slate-400">Model Estimate ({predictionData.period_days} Days)</div>
              <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
                ${predictionData.predicted_price_end.toFixed(2)}
              </div>
              <div className={`text-xs font-semibold font-mono mt-1 ${
                predictionData.projected_change_percent >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {predictionData.projected_change_percent >= 0 ? '▲ +' : '▼ '}
                {predictionData.projected_change_percent.toFixed(2)}% expected trajectory
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
              <div className="text-[11px] uppercase font-mono text-slate-400">Active Algorithm</div>
              <div className="text-base font-bold font-sans text-slate-800 mt-2">
                {predictionData.model_name}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Train: {predictionData.metrics.train_size} | Test: {predictionData.metrics.test_size} rows
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
              <div className="text-[11px] uppercase font-mono text-slate-400">Model Goodness of Fit</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                R² = {predictionData.metrics.r2_score}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {predictionData.metrics.r2_score > 0.7 ? 'Strong variance explanation' : 'Moderate variance fit'}
              </div>
            </div>
          </div>

          {/* Validation Metrics Strip */}
          <div className="bg-white p-4 rounded border border-slate-200 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">
              Statistical Evaluation Metrics (Holdout Test Set)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">MAE (Mean Absolute Error)</span>
                <span className="text-lg font-bold text-slate-900">${predictionData.metrics.mae}</span>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                  Average dollar magnitude difference between actual and estimated price.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">RMSE (Root Mean Squared Error)</span>
                <span className="text-lg font-bold text-slate-900">${predictionData.metrics.rmse}</span>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                  Penalizes larger outliers more heavily to assess prediction stability.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-slate-500 block text-[11px]">R² Coefficient of Determination</span>
                <span className="text-lg font-bold text-blue-700">{predictionData.metrics.r2_score}</span>
                <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                  Proportion of variance in closing price predictable from inputs.
                </p>
              </div>
            </div>
          </div>

          {/* Chart 1: Future Projection Chart */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  Autoregressive Forward Projection ({predictionData.period_days}-Day Horizon)
                </h3>
                <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  Model Estimate
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Solid line represents historical test ground truth; dashed blue line represents projected future trajectory.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={30} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    formatter={(val, name) => [`$${val?.toFixed(2)}`, name === 'futureForecast' ? 'Projected Price' : 'Actual Price']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="historicalActual" 
                    name="Historical Close" 
                    stroke="#0f172a" 
                    strokeWidth={2} 
                    dot={{ r: 2 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="futureForecast" 
                    name="Projected Price (Forecast)" 
                    stroke="#2563eb" 
                    strokeWidth={2} 
                    strokeDasharray="5 3" 
                    dot={{ r: 3, fill: '#2563eb' }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Historical Out-Of-Sample Test Evaluation */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Out-Of-Sample Test Validation: Actual vs. Model Estimate
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation on the chronologically held-out 20% test slice. Demonstrates empirical fit without lookahead bias.
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={predictionData.evaluation_series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={35} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    formatter={(val, name) => [`$${val?.toFixed(2)}`, name === 'actual' ? 'Actual Close' : 'Model Estimate']}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', borderRadius: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="actual" name="Actual Close" stroke="#0f172a" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="predicted" name="Model Estimate" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="3 2" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Academic / College Project Methodology & Ethics Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded text-xs text-amber-900 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wide text-[10px] text-amber-800">
                Academic Methodology & Disclaimer Note
              </span>
              <p className="mt-1 leading-relaxed text-amber-800">
                All forecasted trajectories are purely empirical statistical model estimates derived from historical technical indicators (lags, moving averages, RSI, and MACD). Financial markets exhibit non-stationary time-series properties influenced by unobservable macro catalysts, geopolitical events, and unexpected news sentiment. In accordance with project ethics and regulatory guidelines, this software is strictly an academic demonstration and must not be used for live capital allocation.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
