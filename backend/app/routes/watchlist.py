"""
Watchlist persistence endpoints using SQLite.
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.models.schemas import WatchlistItem, WatchlistAddRequest
from app.database.database import get_all_watchlist, add_to_watchlist, remove_from_watchlist
from app.services.stock_service import get_stock_quote

router = APIRouter(prefix="/api", tags=["Watchlist"])


@router.get("/watchlist", response_model=List[WatchlistItem])
def fetch_watchlist():
    """Retrieves all tracked stocks with their current market quote snapshots."""
    records = get_all_watchlist()
    watchlist_with_quotes: List[WatchlistItem] = []

    for item in records:
        sym = item["symbol"]
        quote = get_stock_quote(sym)
        watchlist_with_quotes.append(
            WatchlistItem(
                id=item["id"],
                symbol=sym,
                name=item["name"] or (quote.name if quote else sym),
                added_at=str(item["added_at"]),
                quote=quote
            )
        )

    return watchlist_with_quotes


@router.post("/watchlist", response_model=dict)
def add_ticker(payload: WatchlistAddRequest):
    """Adds a new stock symbol to the watchlist."""
    sym = payload.symbol.strip().upper()
    quote = get_stock_quote(sym)
    if not quote:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot add invalid or inaccessible symbol '{sym}'."
        )

    success = add_to_watchlist(sym, payload.name or quote.name)
    if not success:
        return {"status": "exists", "message": f"{sym} is already in your watchlist."}

    return {"status": "success", "message": f"{sym} successfully added to watchlist."}


@router.delete("/watchlist/{symbol}", response_model=dict)
def delete_ticker(symbol: str):
    """Removes a stock symbol from the watchlist."""
    sym = symbol.strip().upper()
    deleted = remove_from_watchlist(sym)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"'{sym}' was not found in your watchlist.")

    return {"status": "success", "message": f"{sym} removed from watchlist."}
