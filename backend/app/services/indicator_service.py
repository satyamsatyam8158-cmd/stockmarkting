"""
Mathematical Technical Indicator calculation engine using Pandas and NumPy.
Calculates:
- 20-day Simple Moving Average (SMA 20)
- 50-day Simple Moving Average (SMA 50)
- 20-day Exponential Moving Average (EMA 20)
- 14-day Relative Strength Index (RSI 14)
- Moving Average Convergence Divergence (MACD 12, 26, 9)
- Bollinger Bands (20-day, 2 std deviations)
- Daily Returns (%)
- Annualized & Rolling Volatility
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

from app.models.schemas import IndicatorsResponse, IndicatorSummary, IndicatorDataPoint
from app.services.stock_service import get_stock_history_df


def calculate_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes technical indicators on an OHLCV dataframe.
    """
    df = df.copy()
    close = df["Close"]

    # 1. Simple Moving Averages
    df["SMA20"] = close.rolling(window=20).mean()
    df["SMA50"] = close.rolling(window=50).mean()

    # 2. Exponential Moving Average
    df["EMA20"] = close.ewm(span=20, adjust=False).mean()

    # 3. Bollinger Bands (20 periods, 2 std)
    rolling_std = close.rolling(window=20).std()
    df["BB_Upper"] = df["SMA20"] + (rolling_std * 2)
    df["BB_Lower"] = df["SMA20"] - (rolling_std * 2)

    # 4. Daily Return
    df["Daily_Return"] = close.pct_change() * 100

    # 5. Volatility (Annualized standard deviation of daily returns over 20-day window)
    # Using 252 trading days per year
    df["Volatility_20d"] = close.pct_change().rolling(window=20).std() * np.sqrt(252) * 100

    # 6. RSI (14 periods) - Wilder's smoothed method
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/14, min_periods=14, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    df["RSI"] = 100 - (100 / (1 + rs))

    # 7. MACD (12-day fast EMA, 26-day slow EMA, 9-day Signal line)
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    df["MACD"] = ema12 - ema26
    df["MACD_Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()
    df["MACD_Hist"] = df["MACD"] - df["MACD_Signal"]

    return df


def get_stock_indicators(symbol: str, period: str = "1y") -> Optional[IndicatorsResponse]:
    """
    Retrieves history and computes indicators, returning an IndicatorsResponse object.
    """
    df = get_stock_history_df(symbol, period=period)
    if df is None or len(df) < 25:
        return None

    df_ind = calculate_indicators(df)

    # Create summary metrics from the most recent valid points
    last_row = df_ind.iloc[-1]
    
    current_rsi = float(last_row["RSI"]) if not pd.isna(last_row["RSI"]) else None
    rsi_status = "Neutral"
    if current_rsi is not None:
        if current_rsi >= 70:
            rsi_status = "Overbought (Potential Bearish Reversal)"
        elif current_rsi <= 30:
            rsi_status = "Oversold (Potential Bullish Reversal)"
        else:
            rsi_status = "Neutral Momentum (30 - 70 range)"

    current_macd = float(last_row["MACD"]) if not pd.isna(last_row["MACD"]) else None
    current_signal = float(last_row["MACD_Signal"]) if not pd.isna(last_row["MACD_Signal"]) else None
    macd_status = "Neutral"
    if current_macd is not None and current_signal is not None:
        if current_macd > current_signal:
            macd_status = "Bullish Crossover (MACD above Signal)"
        else:
            macd_status = "Bearish Crossover (MACD below Signal)"

    volatility = float(last_row["Volatility_20d"]) if not pd.isna(last_row["Volatility_20d"]) else None

    summary = IndicatorSummary(
        current_rsi=round(current_rsi, 2) if current_rsi is not None else None,
        rsi_status=rsi_status,
        current_macd=round(current_macd, 2) if current_macd is not None else None,
        macd_status=macd_status,
        annualized_volatility=round(volatility, 2) if volatility is not None else None,
        sma20=round(float(last_row["SMA20"]), 2) if not pd.isna(last_row["SMA20"]) else None,
        sma50=round(float(last_row["SMA50"]), 2) if not pd.isna(last_row["SMA50"]) else None
    )

    series_data = []
    for _, row in df_ind.iterrows():
        series_data.append(
            IndicatorDataPoint(
                date=str(row["Date"]),
                close=float(row["Close"]),
                sma20=round(float(row["SMA20"]), 2) if not pd.isna(row["SMA20"]) else None,
                sma50=round(float(row["SMA50"]), 2) if not pd.isna(row["SMA50"]) else None,
                ema20=round(float(row["EMA20"]), 2) if not pd.isna(row["EMA20"]) else None,
                rsi=round(float(row["RSI"]), 2) if not pd.isna(row["RSI"]) else None,
                macd=round(float(row["MACD"]), 2) if not pd.isna(row["MACD"]) else None,
                macd_signal=round(float(row["MACD_Signal"]), 2) if not pd.isna(row["MACD_Signal"]) else None,
                macd_hist=round(float(row["MACD_Hist"]), 2) if not pd.isna(row["MACD_Hist"]) else None,
                bb_upper=round(float(row["BB_Upper"]), 2) if not pd.isna(row["BB_Upper"]) else None,
                bb_lower=round(float(row["BB_Lower"]), 2) if not pd.isna(row["BB_Lower"]) else None,
                daily_return=round(float(row["Daily_Return"]), 2) if not pd.isna(row["Daily_Return"]) else None,
            )
        )

    return IndicatorsResponse(
        symbol=symbol.strip().upper(),
        summary=summary,
        series=series_data
    )
