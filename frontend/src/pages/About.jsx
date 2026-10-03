import React from 'react';
import { 
  BookOpen, 
  Code2, 
  Cpu, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  FileText,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Project Header */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Academic Minor Project Documentation
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans mt-2">
              StockVision: Quantitative Analysis & Time-Series Estimation Platform
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Department of Computer Science & Engineering • Academic Project Submission
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-500">
            <div>Type: Full-Stack Web + Machine Learning</div>
            <div>Architecture: Decoupled RESTful System</div>
            <div>License: Academic & Educational</div>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Project Objective</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The primary objective of <strong>StockVision</strong> is to develop a robust, modular, full-stack financial analytics web application capable of retrieving real-time and historical stock market data, computing mathematical technical indicators (SMA, EMA, RSI, MACD, Volatility), and providing empirical time-series price estimations using supervised machine learning regression algorithms (Linear Regression and Random Forest Regressor).
          </p>
        </div>
      </div>

      {/* Technologies Used Grid */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-blue-700" />
          <span>Software Stack & Component Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Frontend */}
          <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Client-Side Frontend</span>
            </div>
            <ul className="space-y-1.5 text-slate-600">
              <li>• <strong>React 19:</strong> Declarative component-driven UI architecture.</li>
              <li>• <strong>Vite:</strong> Ultra-fast modern build tooling and bundling.</li>
              <li>• <strong>Tailwind CSS v4:</strong> Professional utility-first financial styling.</li>
              <li>• <strong>Recharts:</strong> Composable SVG data visualizations (Area, Line, Bar).</li>
              <li>• <strong>Lucide React:</strong> Clean iconography for UI navigation.</li>
            </ul>
          </div>

          {/* Backend */}
          <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Server-Side Backend</span>
            </div>
            <ul className="space-y-1.5 text-slate-600">
              <li>• <strong>Python FastAPI:</strong> Asynchronous high-performance REST framework.</li>
              <li>• <strong>Pydantic:</strong> Strict data contract schema validation.</li>
              <li>• <strong>Pandas & NumPy:</strong> Vectorized financial calculations and data cleaning.</li>
              <li>• <strong>yfinance:</strong> Financial market data ingestion interface.</li>
              <li>• <strong>SQLite:</strong> Serverless ACID relational database for watchlists.</li>
            </ul>
          </div>

          {/* Machine Learning */}
          <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>Machine Learning & Analytics</span>
            </div>
            <ul className="space-y-1.5 text-slate-600">
              <li>• <strong>Scikit-Learn:</strong> Machine learning algorithms and regression evaluators.</li>
              <li>• <strong>Linear Regression:</strong> Ordinary Least Squares (OLS) baseline model.</li>
              <li>• <strong>Random Forest:</strong> 100-tree ensemble non-linear regression model.</li>
              <li>• <strong>Joblib:</strong> Model serialization and persistent disk caching.</li>
              <li>• <strong>Evaluation:</strong> MAE, RMSE, and R² Goodness-of-Fit metrics.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Machine Learning Pipeline & Methodology */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-700" />
          <span>Machine Learning Pipeline & Methodology</span>
        </h2>

        <div className="space-y-4 text-xs leading-relaxed text-slate-600">
          <p>
            Unlike cross-sectional tabular data, financial stock quotes exhibit continuous temporal dependencies. Shuffling time-series observations randomly causes catastrophic lookahead data leakage. StockVision strictly adheres to chronological order throughout the modeling workflow:
          </p>

          <div className="bg-slate-900 text-slate-200 p-4 rounded font-mono text-[11px] overflow-x-auto">
            <code>
              Raw Market Data (OHLCV) → Data Cleaning & Imputation → Feature Engineering (Lags, SMAs, RSI, MACD) → Chronological 80/20 Train-Test Split → Supervised Model Training → Out-of-Sample Metric Evaluation (MAE, RMSE, R²) → Multi-Step Autoregressive Projection
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-200 p-3.5 rounded bg-slate-50">
              <h3 className="font-bold text-slate-800 text-xs mb-1">Feature Engineering Vector</h3>
              <p className="text-[11px] text-slate-600 mb-2">Each time step t is transformed into a feature vector:</p>
              <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px] text-slate-700">
                <li><code>Lag_1, Lag_2, Lag_3, Lag_5</code>: Prior closing values</li>
                <li><code>SMA_10, SMA_20, EMA_20</code>: Trend-following moving averages</li>
                <li><code>Volume_Ratio</code>: Ratio of current volume to 10-day volume SMA</li>
                <li><code>Daily_Return</code>: Percentage price change</li>
                <li><code>RSI_14</code>: 14-period momentum oscillator</li>
                <li><code>MACD & MACD_Hist</code>: Convergence/divergence signals</li>
              </ul>
            </div>

            <div className="border border-slate-200 p-3.5 rounded bg-slate-50">
              <h3 className="font-bold text-slate-800 text-xs mb-1">Evaluation & Validation Strategy</h3>
              <p className="text-[11px] text-slate-600 mb-2">Models are evaluated strictly on holdout historical data:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                <li><strong>Train/Test Ratio:</strong> 80% initial records for training, 20% subsequent records for validation.</li>
                <li><strong>MAE (Mean Absolute Error):</strong> Quantifies average absolute dollar forecast deviation.</li>
                <li><strong>RMSE (Root Mean Squared Error):</strong> Highlights severe forecasting variance.</li>
                <li><strong>R² Score:</strong> Demonstrates the proportion of target variance explained by features.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Database Schema & Storage */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Database className="w-4 h-4 text-blue-700" />
          <span>Database Architecture (SQLite)</span>
        </h2>
        <p className="text-xs text-slate-600 mb-3">
          The persistent layer uses an embedded SQLite database (<code>data/stockvision.db</code>) managed with Python's native sqlite3 engine.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Table: watchlist</span>
            <div className="text-slate-600 text-[11px] space-y-0.5">
              <div>• id: INTEGER PRIMARY KEY AUTOINCREMENT</div>
              <div>• symbol: TEXT NOT NULL UNIQUE</div>
              <div>• name: TEXT</div>
              <div>• added_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP</div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">Table: stock_directory</span>
            <div className="text-slate-600 text-[11px] space-y-0.5">
              <div>• symbol: TEXT PRIMARY KEY</div>
              <div>• name: TEXT NOT NULL</div>
              <div>• exchange: TEXT</div>
              <div>• sector: TEXT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Limitations & Future Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Academic Limitations</span>
          </h2>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li><strong>Efficient Market Hypothesis (EMH):</strong> Price fluctuations incorporate public news instantly; pure technical indicator regression cannot anticipate black swan events or earnings surprises.</li>
            <li><strong>Non-Stationarity:</strong> Financial market regimes shift between high-volatility bear phases and low-volatility bull runs.</li>
            <li><strong>Autoregressive Decay:</strong> Multi-step recursive forecasting compounds estimation variance across extended forecast horizons.</li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span>Future Scope & Extensions</span>
          </h2>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li><strong>Deep Learning Architectures:</strong> Integration of Long Short-Term Memory (LSTM) and Temporal Fusion Transformers (TFT).</li>
            <li><strong>Natural Language Sentiment:</strong> Parsing quarterly 10-K SEC filings and financial news headlines using FinBERT.</li>
            <li><strong>Portfolio Optimization:</strong> Implementation of Modern Portfolio Theory (MPT) and Markowitz Efficient Frontier optimization.</li>
            <li><strong>Automated Backtesting:</strong> Backtesting simulated algorithmic trading strategies (e.g., RSI mean-reversion, MACD crossover).</li>
          </ul>
        </div>
      </div>

      {/* Viva / Presentation Q&A Quick Guide */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>College Viva / Examiner Question & Answer Defense Guide</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div className="border-b border-slate-100 pb-2">
            <p className="font-semibold text-slate-800">Q1: Why did you choose chronological train/test split over K-Fold Cross Validation?</p>
            <p className="text-slate-600 mt-0.5">
              <strong>Answer:</strong> Stock prices are strictly sequential time-series data. Standard K-Fold Cross Validation randomly shuffles samples, allowing past predictions to learn from future data points (lookahead bias / data leakage). A chronological split (first 80% train, subsequent 20% test) ensures the model only predicts future steps using strictly past information.
            </p>
          </div>

          <div className="border-b border-slate-100 pb-2">
            <p className="font-semibold text-slate-800">Q2: How is the multi-day forward forecast computed?</p>
            <p className="text-slate-600 mt-0.5">
              <strong>Answer:</strong> We implement an autoregressive recursive multi-step forecasting loop. To predict day t+1, we use features from day t. To predict day t+2, the predicted price from t+1 is fed back as the lag-1 input, and moving averages are dynamically recalculated.
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-800">Q3: How does the system handle API rate limiting?</p>
            <p className="text-slate-600 mt-0.5">
              <strong>Answer:</strong> The FastAPI backend employs an in-memory TTL (Time-To-Live) cache (60 seconds) for quote requests and disk persistence via joblib for trained machine learning models, preventing redundant queries and ensuring sub-second response times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
