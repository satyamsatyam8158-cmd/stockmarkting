"""
Machine Learning Pipeline for Time-Series Stock Price Prediction.

Pipeline stages:
1. Historical Data Ingestion & Preprocessing
2. Technical Feature Engineering (Lags, Moving Averages, RSI, MACD, Volume Changes)
3. Chronological Time-Series Train/Test Split (80% train, 20% test without shuffling)
4. Model Training (Linear Regression & Random Forest Regressor)
5. Out-of-sample Evaluation (MAE, RMSE, R² Score)
6. Recursive Multi-Step Forward Forecasting for target horizon
7. Model Persistence with joblib
"""

import os
from pathlib import Path
from typing import Dict, Any, Tuple, List, Optional
from datetime import datetime, timedelta
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from app.services.stock_service import get_stock_history_df
from app.services.indicator_service import calculate_indicators
from app.models.schemas import PredictResponse, ModelMetrics, EvalPoint, ForecastPoint

# Directory for persisting trained models
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODEL_CACHE_DIR = BASE_DIR / "data" / "models"
MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)


def build_feature_dataset(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Constructs time-series features from OHLCV and indicator data.
    Features:
    - Lag_1, Lag_2, Lag_3, Lag_5 (Previous closing prices)
    - SMA10, SMA20 (Short and medium trend)
    - EMA20 (Exponential smoothing)
    - Volume_Ratio (Current volume / 10-day average volume)
    - Daily_Return (Percentage return)
    - RSI (Relative Strength Index)
    - MACD, MACD_Hist (Momentum indicators)
    """
    df = df.copy()
    close = df["Close"]

    # Calculate indicators
    df = calculate_indicators(df)

    # Additional short-term SMA
    df["SMA10"] = close.rolling(window=10).mean()

    # Lag features (Past prices)
    df["Lag_1"] = close.shift(1)
    df["Lag_2"] = close.shift(2)
    df["Lag_3"] = close.shift(3)
    df["Lag_5"] = close.shift(5)

    # Volume features
    vol_sma10 = df["Volume"].rolling(window=10).mean().replace(0, 1)
    df["Volume_Ratio"] = df["Volume"] / vol_sma10

    # Target: Next day's price and delta change
    df["Target"] = close.shift(-1)
    df["Delta_Target"] = df["Target"] - close

    feature_cols = [
        "Lag_1", "Lag_2", "Lag_3", "Lag_5",
        "SMA10", "SMA20", "EMA20",
        "Volume_Ratio", "Daily_Return",
        "RSI", "MACD", "MACD_Hist"
    ]

    # Drop rows with NaN caused by rolling windows and shifting
    clean_df = df.dropna(subset=feature_cols + ["Target", "Delta_Target"]).copy()

    return clean_df, feature_cols


def train_and_predict(
    symbol: str,
    model_name: str = "linear_regression",
    period_days: int = 7
) -> Optional[PredictResponse]:
    """
    Executes the end-to-end ML pipeline:
    - Ingests 2 years of daily data for statistical stability
    - Computes feature matrix
    - Splits chronologically (80% train, 20% test)
    - Trains or loads model
    - Computes test metrics (MAE, RMSE, R²)
    - Performs autoregressive multi-step projection for `period_days`
    """
    sym = symbol.strip().upper()
    df_raw = get_stock_history_df(sym, period="2y")
    if df_raw is None or len(df_raw) < 100:
        return None

    dataset, feature_cols = build_feature_dataset(df_raw)
    if len(dataset) < 60:
        return None

    # 1. Chronological Time-Series Split (80% train, 20% test)
    split_idx = int(len(dataset) * 0.80)
    train_df = dataset.iloc[:split_idx]
    test_df = dataset.iloc[split_idx:]

    X_train = train_df[feature_cols].values
    X_test = test_df[feature_cols].values
    y_test_target = test_df["Target"].values

    clean_model_name = "random_forest" if "forest" in model_name.lower() else "linear_regression"
    model_path = MODEL_CACHE_DIR / f"{sym}_{clean_model_name}.joblib"

    if clean_model_name == "random_forest":
        # For non-linear tree models on financial data, predicting price deltas
        # prevents the classic tree out-of-bounds flatlining problem
        y_train_delta = train_df["Delta_Target"].values
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=6,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train_delta)
        # Holdout predictions
        pred_deltas = model.predict(X_test)
        y_test_pred = test_df["Close"].values + pred_deltas
    else:
        # Linear Regression directly models price transitions
        y_train_price = train_df["Target"].values
        model = LinearRegression()
        model.fit(X_train, y_train_price)
        y_test_pred = model.predict(X_test)

    # Persist model
    try:
        joblib.dump(model, model_path)
    except Exception:
        pass

    # 3. Model Evaluation on Hold-Out Test Set
    mae = float(mean_absolute_error(y_test_target, y_test_pred))
    rmse = float(root_mean_squared_error(y_test_target, y_test_pred))
    r2 = float(r2_score(y_test_target, y_test_pred))

    # Construct evaluation series (last 40 points of test set for clear chart visualization)
    eval_slice_len = min(40, len(test_df))
    eval_slice = test_df.iloc[-eval_slice_len:]
    eval_preds = y_test_pred[-eval_slice_len:]

    evaluation_series: List[EvalPoint] = []
    for i, (_, row) in enumerate(eval_slice.iterrows()):
        evaluation_series.append(
            EvalPoint(
                date=str(row["Date"]),
                actual=round(float(row["Target"]), 2),
                predicted=round(float(eval_preds[i]), 2)
            )
        )

    # 4. Multi-Step Autoregressive Forward Forecast
    last_row = dataset.iloc[-1].copy()
    current_price = float(last_row["Close"])
    last_date_str = str(last_row["Date"])

    current_features = last_row[feature_cols].values.copy()
    recent_prices = list(dataset["Close"].iloc[-10:].values)

    future_series: List[ForecastPoint] = []
    last_dt = datetime.strptime(last_date_str, "%Y-%m-%d")
    projected_price = current_price

    for step in range(1, period_days + 1):
        # Move forward 1 business day (skipping weekend)
        last_dt += timedelta(days=1)
        while last_dt.weekday() >= 5:  # 5=Sat, 6=Sun
            last_dt += timedelta(days=1)

        if clean_model_name == "random_forest":
            pred_delta = float(model.predict([current_features])[0])
            pred_val = projected_price + pred_delta
        else:
            pred_val = float(model.predict([current_features])[0])

        # Apply gentle variance bounds
        max_daily_swing = 0.05
        pred_val = max(projected_price * (1 - max_daily_swing), min(projected_price * (1 + max_daily_swing), pred_val))
        projected_price = pred_val

        future_series.append(
            ForecastPoint(
                date=last_dt.strftime("%Y-%m-%d"),
                predicted_price=round(projected_price, 2)
            )
        )

        # Update simulated lag features for the next recursive step
        recent_prices.append(projected_price)
        current_features[0] = recent_prices[-1]  # Lag_1
        current_features[1] = recent_prices[-2]  # Lag_2
        current_features[2] = recent_prices[-3]  # Lag_3
        current_features[3] = recent_prices[-5] if len(recent_prices) >= 5 else recent_prices[0]
        current_features[4] = np.mean(recent_prices[-10:])  # SMA10
        current_features[5] = np.mean(recent_prices[-20:]) if len(recent_prices) >= 20 else current_features[4]  # SMA20
        current_features[8] = ((recent_prices[-1] - recent_prices[-2]) / recent_prices[-2]) * 100  # Return

    end_pred_price = future_series[-1].predicted_price if future_series else current_price
    projected_change = round(((end_pred_price - current_price) / current_price) * 100, 2)

    return PredictResponse(
        symbol=sym,
        model_name="Random Forest Regression" if clean_model_name == "random_forest" else "Linear Regression",
        period_days=period_days,
        current_price=round(current_price, 2),
        last_date=last_date_str,
        predicted_price_end=round(end_pred_price, 2),
        projected_change_percent=projected_change,
        metrics=ModelMetrics(
            mae=round(mae, 2),
            rmse=round(rmse, 2),
            r2_score=round(r2, 4),
            train_size=len(train_df),
            test_size=len(test_df)
        ),
        evaluation_series=evaluation_series,
        future_series=future_series
    )
