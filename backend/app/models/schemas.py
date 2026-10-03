"""
Pydantic data schemas for request validation and response serialization.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class StockQuote(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    percent_change: float
    open: float
    high: float
    low: float
    previous_close: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    currency: str = "USD"
    last_updated: str


class StockHistoryItem(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockHistoryResponse(BaseModel):
    symbol: str
    count: int
    data: List[StockHistoryItem]


class IndicatorDataPoint(BaseModel):
    date: str
    close: float
    sma20: Optional[float] = None
    sma50: Optional[float] = None
    ema20: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_hist: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_lower: Optional[float] = None
    daily_return: Optional[float] = None


class IndicatorSummary(BaseModel):
    current_rsi: Optional[float] = None
    rsi_status: Optional[str] = None
    current_macd: Optional[float] = None
    macd_status: Optional[str] = None
    annualized_volatility: Optional[float] = None
    sma20: Optional[float] = None
    sma50: Optional[float] = None


class IndicatorsResponse(BaseModel):
    symbol: str
    summary: IndicatorSummary
    series: List[IndicatorDataPoint]


class PredictRequest(BaseModel):
    symbol: str = Field(..., example="AAPL")
    model_name: str = Field("linear_regression", description="'linear_regression' or 'random_forest'")
    period_days: int = Field(7, ge=1, le=30, description="Forecast horizon in trading days")


class ModelMetrics(BaseModel):
    mae: float
    rmse: float
    r2_score: float
    train_size: int
    test_size: int


class EvalPoint(BaseModel):
    date: str
    actual: float
    predicted: float


class ForecastPoint(BaseModel):
    date: str
    predicted_price: float


class PredictResponse(BaseModel):
    symbol: str
    model_name: str
    period_days: int
    current_price: float
    last_date: str
    predicted_price_end: float
    projected_change_percent: float
    metrics: ModelMetrics
    evaluation_series: List[EvalPoint]
    future_series: List[ForecastPoint]
    disclaimer: str = "Statistical model estimate based on historical technical indicators. Not financial advice."


class ComparisonSeriesPoint(BaseModel):
    date: str
    symbol: str
    close: float
    normalized_return_pct: float


class StockComparisonItem(BaseModel):
    symbol: str
    name: str
    current_price: float
    percent_change_period: float
    volatility: float
    avg_volume: int
    data: List[Dict[str, Any]]


class WatchlistItem(BaseModel):
    id: int
    symbol: str
    name: Optional[str] = None
    added_at: str
    quote: Optional[StockQuote] = None


class WatchlistAddRequest(BaseModel):
    symbol: str
    name: Optional[str] = None


class MarketSummaryIndex(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    percent_change: float
