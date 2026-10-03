"""
FastAPI endpoints for stock quotes, historical OHLCV data,
technical indicators, and multi-asset comparison.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any

from app.models.schemas import (
    StockQuote,
    StockHistoryResponse,
    IndicatorsResponse,
    MarketSummaryIndex,
    StockComparisonItem
)
from app.services.stock_service import (
    get_stock_quote,
    get_stock_history_list,
    get_stock_history_df,
    get_market_summary
)
from app.services.indicator_service import get_stock_indicators
from app.database.database import search_stocks

router = APIRouter(prefix="/api", tags=["Stocks"])


@router.get("/stocks", response_model=List[Dict[str, Any]])
def list_or_search_stocks(q: str = Query("", description="Search ticker symbol or company name")):
    """Searches the database directory for stock symbols."""
    results = search_stocks(q)
    return results


@router.get("/stocks/market-summary", response_model=List[MarketSummaryIndex])
def fetch_market_summary():
    """Retrieves current performance of benchmark indices."""
    return get_market_summary()


@router.get("/stocks/{symbol}", response_model=StockQuote)
def fetch_stock_quote(symbol: str):
    """Retrieves real-time or latest available quote for a stock."""
    quote = get_stock_quote(symbol)
    if not quote:
        raise HTTPException(
            status_code=404,
            detail=f"Stock symbol '{symbol.upper()}' not found or market data unavailable."
        )
    return quote


@router.get("/stocks/{symbol}/history", response_model=StockHistoryResponse)
def fetch_stock_history(
    symbol: str,
    period: str = Query("1y", description="Timeframe: 1mo, 3mo, 6mo, 1y, 2y, 5y")
):
    """Retrieves chronological historical OHLCV records."""
    valid_periods = ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]
    if period not in valid_periods:
        period = "1y"

    records = get_stock_history_list(symbol, period=period)
    if not records:
        raise HTTPException(
            status_code=404,
            detail=f"Historical price data for '{symbol.upper()}' is unavailable."
        )

    return StockHistoryResponse(
        symbol=symbol.upper(),
        count=len(records),
        data=records
    )


@router.get("/stocks/{symbol}/indicators", response_model=IndicatorsResponse)
def fetch_stock_indicators(
    symbol: str,
    period: str = Query("1y", description="Timeframe for technical indicator calculation")
):
    """Calculates SMA, EMA, RSI, MACD, Bollinger Bands, and Volatility."""
    indicators = get_stock_indicators(symbol, period=period)
    if not indicators:
        raise HTTPException(
            status_code=404,
            detail=f"Technical indicators could not be computed for '{symbol.upper()}'. Insufficient historical data."
        )
    return indicators


@router.get("/compare", response_model=List[StockComparisonItem])
def compare_stocks(
    symbols: str = Query("AAPL,MSFT,GOOGL", description="Comma separated ticker symbols"),
    period: str = Query("6mo", description="Comparison period: 1mo, 3mo, 6mo, 1y")
):
    """
    Compares performance, volatility, and volume across multiple stocks.
    Normalizes closing prices to percentage change from baseline for fair comparison.
    """
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not sym_list:
        raise HTTPException(status_code=400, detail="Please provide at least one valid symbol.")

    results: List[StockComparisonItem] = []

    for sym in sym_list[:5]:  # Limit to 5 symbols for performance
        df = get_stock_history_df(sym, period=period)
        quote = get_stock_quote(sym)
        if df is None or len(df) < 5:
            continue

        base_price = float(df.iloc[0]["Close"])
        last_price = float(df.iloc[-1]["Close"])
        pct_change = round(((last_price - base_price) / base_price) * 100, 2)

        # Volatility
        daily_returns = df["Close"].pct_change().dropna()
        volatility = round(float(daily_returns.std() * (252 ** 0.5) * 100), 2)
        avg_volume = int(df["Volume"].mean())

        # Build normalized series
        series_points = []
        for _, row in df.iterrows():
            close_val = float(row["Close"])
            norm_return = round(((close_val - base_price) / base_price) * 100, 2)
            series_points.append({
                "date": str(row["Date"]),
                "close": close_val,
                "return_pct": norm_return
            })

        results.append(StockComparisonItem(
            symbol=sym,
            name=quote.name if quote else sym,
            current_price=last_price,
            percent_change_period=pct_change,
            volatility=volatility,
            avg_volume=avg_volume,
            data=series_points
        ))

    if not results:
        raise HTTPException(status_code=404, detail="None of the specified symbols could be fetched for comparison.")

    return results
