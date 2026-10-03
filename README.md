# StockVision: Stock Market Analysis and Prediction Web Application

> **College Minor Project**  
> **Tech Stack:** React (Vite) + Tailwind CSS + Recharts + Python FastAPI + Pandas + Scikit-Learn + SQLite

---

## 1. Project Overview
**StockVision** is a full-stack, data-centric financial analytics web application developed for academic and technical research. The application simulates the analytical capabilities of a traditional financial research workstation (similar to Bloomberg Terminal, Yahoo Finance, or TradingView), intentionally avoiding AI buzzwords, chatbots, or gimmicks to maintain an authentic, professional, and practical design.

### Key Objectives:
- Retrieve and visualize real-time snapshot quotes and historical OHLCV data from financial markets.
- Compute quantitative technical indicators (20 SMA, 50 SMA, 20 EMA, 14 RSI, MACD, and 20-day Annualized Volatility).
- Provide time-series price estimations using supervised machine learning regression algorithms (**Linear Regression** and **Random Forest Regressor**).
- Avoid data leakage by utilizing strict chronological (time-based) train/test splits.
- Enable multi-asset normalized performance comparison and watchlist management backed by SQLite.

---

## 2. Architecture & Design

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT (BROWSER)                                   |
|  React 19 + Vite + Tailwind CSS v4 + Recharts                                         |
|  • Dashboard (Quote Snapshot, Range Charts, Ticker Tape)                              |
|  • Technical Analysis (SMA 20/50, EMA 20, RSI 14, MACD, Volatility)                   |
|  • Price Prediction (Model Estimates, Metrics MAE/RMSE/R², Forecast Trajectory)       |
|  • Multi-Stock Comparison (Normalized % Return Curves, Risk Table)                   |
|  • Historical Data (Sortable OHLCV Table, Pagination, CSV Export)                     |
|  • Watchlist (SQLite Monitored Tickers with Real-Time Quotes)                         |
|  • About Project (Academic Documentation, Methodologies, Viva Q&A)                    |
+---------------------------------------------------------------------------------------+
                                        ▲
                                        │ REST API (JSON) via Fetch
                                        ▼
+---------------------------------------------------------------------------------------+
|                                   SERVER (FASTAPI)                                    |
|  Python 3 + Uvicorn + Pydantic                                                        |
|                                                                                       |
|  [Routes]                                                                             |
|  ├── /api/stocks                  -> Directory search & Ticker matching               |
|  ├── /api/stocks/{symbol}         -> Real-time quote & fundamentals                   |
|  ├── /api/stocks/{symbol}/history -> Historical OHLCV series                          |
|  ├── /api/stocks/{symbol}/indicators -> Technical indicator computations             |
|  ├── /api/predict                 -> Supervised ML regression & multi-step forecast   |
|  ├── /api/compare                 -> Multi-asset normalization & volatility analysis  |
|  └── /api/watchlist               -> SQLite CRUD persistence                          |
|                                                                                       |
|  [Services & Engines]                                                                 |
|  ├── stock_service.py     -> yfinance wrapper, TTL quote caching                      |
|  ├── indicator_service.py -> Pandas/NumPy vectorized indicator formulas               |
|  └── ml/pipeline.py       -> Lag engineering, 80/20 time split, Scikit-learn models   |
+---------------------------------------------------------------------------------------+
                │                                                   │
                ▼                                                   ▼
+-------------------------------+                   +-------------------------------+
|         DATA PROVIDER         |                   |        PERSISTENT STORE       |
|  Yahoo Finance (yfinance)     |                   |  SQLite Database (stockvision.db)
|  Daily Adjusted OHLCV Feeds   |                   |  • watchlist                  |
+-------------------------------+                   |  • stock_directory            |
                                                    |  • joblib serialized models   |
                                                    +-------------------------------+
```

---

## 3. Database Schema (SQLite)

Located at `data/stockvision.db`:

```sql
-- Watchlist Table
CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Directory Index
CREATE TABLE IF NOT EXISTS stock_directory (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    exchange TEXT,
    sector TEXT
);
```

---

## 4. Machine Learning Pipeline

### Data Flow:
$$\text{OHLCV Raw Series} \xrightarrow{} \text{Feature Engineering} \xrightarrow{} \text{Chronological Split (80/20)} \xrightarrow{} \text{Model Fit} \xrightarrow{} \text{Holdout Evaluation} \xrightarrow{} \text{Recursive Projection}$$

### Feature Matrix Vector:
- **Lag Features:** $\text{Lag}_1, \text{Lag}_2, \text{Lag}_3, \text{Lag}_5$ (prior closing prices)
- **Moving Averages:** $\text{SMA}_{10}, \text{SMA}_{20}, \text{EMA}_{20}$
- **Liquidity:** $\text{Volume Ratio} = \frac{\text{Volume}_t}{\text{SMA}_{10}(\text{Volume})}$
- **Momentum:** $\text{RSI}_{14}, \text{MACD}, \text{Daily Return}$

### Algorithms Implemented:
1. **Linear Regression (Ordinary Least Squares):** Serves as a transparent linear baseline.
2. **Random Forest Regression (Ensemble of 100 Trees):** Captures non-linear feature interactions and resistance/support bounds.

### Evaluation Metrics:
- **Mean Absolute Error (MAE):** Average magnitude of point-estimate error in dollars.
- **Root Mean Squared Error (RMSE):** Emphasizes and penalizes large outlier estimation errors.
- **Coefficient of Determination ($R^2$):** Proportion of variance in closing prices explained by the feature vector.

---

## 5. Folder Structure

```
stockMarket/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── database.py        # SQLite connection, tables, and CRUD
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py         # Pydantic request/response contracts
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── stock_service.py   # yfinance data provider and TTL cache
│   │   │   └── indicator_service.py # Vectorized technical indicator computations
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   └── pipeline.py        # Feature engineering, time split, train, eval
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── stocks.py          # Quotes, history, indicators, comparison
│   │   │   ├── prediction.py      # POST /api/predict
│   │   │   └── watchlist.py       # Watchlist CRUD
│   │   └── main.py                # FastAPI app entrypoint, CORS, lifespan
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Header, ticker tape, and search
│   │   │   ├── MetricCard.jsx     # Compact financial tiles
│   │   │   ├── PriceChart.jsx     # Price area & volume bar Recharts
│   │   │   └── IndicatorCharts.jsx # Moving averages, RSI, MACD, Returns
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Primary dashboard
│   │   │   ├── StockAnalysis.jsx  # Technical indicators
│   │   │   ├── Prediction.jsx     # ML price prediction & metrics
│   │   │   ├── Compare.jsx        # Multi-stock normalized comparison
│   │   │   ├── HistoricalData.jsx # Paginated OHLCV table with CSV export
│   │   │   ├── Watchlist.jsx      # SQLite monitored watchlist
│   │   │   └── About.jsx          # Academic documentation & viva guide
│   │   ├── services/
│   │   │   └── api.js             # Client API service
│   │   ├── App.jsx                # Root router & layout
│   │   ├── index.css              # Tailwind CSS v4 directives
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── data/                          # SQLite database and cached joblib models
├── .env.example
└── README.md
```

---

## 6. How to Run the Application

### Prerequisites:
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm

### Step 1: Start the Backend (FastAPI)
In a terminal window:
```bash
# Navigate to project root
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```
- API will be accessible at: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### Step 2: Start the Frontend (React + Vite)
In a second terminal window:
```bash
cd frontend
npm run dev
```
- Frontend will be accessible at: `http://localhost:5173`

---

## 7. Viva / Oral Examination Highlights
- **Why avoid AI buzzwords in the UI?** Traditional financial analytical software prioritizes data density, legibility, and quantitative rigor over decorative marketing gimmicks.
- **Why no random shuffle in train/test split?** Shuffling breaks temporal causality, causing lookahead bias (predicting the past using future information).
- **How is multi-day prediction achieved?** An autoregressive loop dynamically updates lag features and moving averages step-by-step into the target horizon.
