"""
Stock data service interfacing with Yahoo Finance via yfinance.
Includes caching, data validation, and fallback handling.
"""

import time
import logging
from typing import Dict, Any, List, Optional
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

from app.models.schemas import StockQuote, StockHistoryItem, MarketSummaryIndex
from app.database.database import search_stocks

logger = logging.getLogger(__name__)

# Lightweight in-memory cache to respect API rate limits and ensure snappy response
QUOTE_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 60  # 1 minute quote cache


def get_stock_quote(symbol: str) -> Optional[StockQuote]:
    """
    Fetches the latest snapshot quote for a given stock symbol.
    Uses memory caching with a 60-second TTL.
    """
    sym = symbol.strip().upper()
    now = time.time()

    if sym in QUOTE_CACHE:
        cached = QUOTE_CACHE[sym]
        if now - cached["timestamp"] < CACHE_TTL_SECONDS:
            return cached["data"]

    try:
        ticker = yf.Ticker(sym)
        # Fetch 5 days history to guarantee accurate open, close, and previous close
        hist = ticker.history(period="5d")
        if hist.empty:
            return None

        last_row = hist.iloc[-1]
        prev_row = hist.iloc[-2] if len(hist) > 1 else last_row

        curr_price = float(last_row["Close"])
        prev_close = float(prev_row["Close"]) if len(hist) > 1 else float(last_row["Open"])
        change = round(curr_price - prev_close, 2)
        pct_change = round((change / prev_close) * 100, 2) if prev_close != 0 else 0.0

        # Try to retrieve metadata from fast_info or info
        name = sym
        market_cap = None
        pe_ratio = None
        fifty_two_high = None
        fifty_two_low = None
        currency = "USD"

        try:
            fi = ticker.fast_info
            curr_price = float(getattr(fi, "last_price", curr_price))
            prev_close = float(getattr(fi, "previous_close", prev_close))
            change = round(curr_price - prev_close, 2)
            pct_change = round((change / prev_close) * 100, 2) if prev_close != 0 else 0.0
            market_cap = getattr(fi, "market_cap", None)
            fifty_two_high = getattr(fi, "year_high", None)
            fifty_two_low = getattr(fi, "year_low", None)
            currency = getattr(fi, "currency", "USD") or "USD"
        except Exception:
            pass

        try:
            info = ticker.info
            name = info.get("shortName") or info.get("longName") or sym
            pe_ratio = info.get("trailingPE")
            if not market_cap:
                market_cap = info.get("marketCap")
        except Exception:
            pass

        quote = StockQuote(
            symbol=sym,
            name=name,
            price=round(curr_price, 2),
            change=change,
            percent_change=pct_change,
            open=round(float(last_row["Open"]), 2),
            high=round(float(last_row["High"]), 2),
            low=round(float(last_row["Low"]), 2),
            previous_close=round(prev_close, 2),
            volume=int(last_row["Volume"]),
            market_cap=round(market_cap, 2) if market_cap else None,
            pe_ratio=round(pe_ratio, 2) if pe_ratio else None,
            fifty_two_week_high=round(fifty_two_high, 2) if fifty_two_high else None,
            fifty_two_week_low=round(fifty_two_low, 2) if fifty_two_low else None,
            currency=currency,
            last_updated=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        QUOTE_CACHE[sym] = {"data": quote, "timestamp": now}
        return quote

    except Exception as e:
        logger.error(f"Error fetching quote for {sym}: {e}")
        return None


def get_stock_history_df(symbol: str, period: str = "1y", interval: str = "1d") -> Optional[pd.DataFrame]:
    """
    Retrieves historical price dataframe from yfinance.
    Valid periods: '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max'.
    """
    sym = symbol.strip().upper()
    try:
        ticker = yf.Ticker(sym)
        df = ticker.history(period=period, interval=interval)
        if df.empty or len(df) < 5:
            return None

        # Clean index and columns
        df = df.reset_index()
        # Ensure Date is string YYYY-MM-DD
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
        elif "Datetime" in df.columns:
            df["Date"] = pd.to_datetime(df["Datetime"]).dt.strftime("%Y-%m-%d")

        # Keep relevant columns and ensure float types
        cols = ["Date", "Open", "High", "Low", "Close", "Volume"]
        df = df[[c for c in cols if c in df.columns]].dropna()
        for col in ["Open", "High", "Low", "Close"]:
            df[col] = df[col].astype(float).round(2)
        df["Volume"] = df["Volume"].astype(int)

        return df
    except Exception as e:
        logger.error(f"Error retrieving history for {sym}: {e}")
        return None


def get_stock_history_list(symbol: str, period: str = "1y") -> Optional[List[StockHistoryItem]]:
    """Returns historical data as a list of StockHistoryItem models."""
    df = get_stock_history_df(symbol, period=period)
    if df is None:
        return None

    items = []
    for _, row in df.iterrows():
        items.append(
            StockHistoryItem(
                date=str(row["Date"]),
                open=float(row["Open"]),
                high=float(row["High"]),
                low=float(row["Low"]),
                close=float(row["Close"]),
                volume=int(row["Volume"])
            )
        )
    return items


def get_market_summary() -> List[MarketSummaryIndex]:
    """
    Retrieves high-level summary for benchmark indices.
    (S&P 500 ETF, NASDAQ ETF, Dow Jones ETF, Nifty 50)
    """
    indices = [
        {"sym": "SPY", "name": "S&P 500 (SPY)"},
        {"sym": "QQQ", "name": "NASDAQ 100 (QQQ)"},
        {"sym": "DIA", "name": "Dow Jones (DIA)"},
        {"sym": "^NSEI", "name": "NIFTY 50"}
    ]
    summary_list = []
    for item in indices:
        sym = item["sym"]
        try:
            ticker = yf.Ticker(sym)
            hist = ticker.history(period="2d")
            if not hist.empty:
                last_row = hist.iloc[-1]
                prev_row = hist.iloc[-2] if len(hist) > 1 else last_row
                curr_price = float(last_row["Close"])
                prev_close = float(prev_row["Close"])
                chg = round(curr_price - prev_close, 2)
                pct_chg = round((chg / prev_close) * 100, 2) if prev_close != 0 else 0.0

                summary_list.append(MarketSummaryIndex(
                    symbol=sym,
                    name=item["name"],
                    price=round(curr_price, 2),
                    change=chg,
                    percent_change=pct_chg
                ))
        except Exception as e:
            logger.warning(f"Could not fetch index {sym}: {e}")

    return summary_list
