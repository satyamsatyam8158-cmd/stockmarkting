"""
Database management module using SQLite.
Stores user watchlist and local cached ticker metadata.
"""

import sqlite3
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

# Locate data directory in the project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "stockvision.db"


def get_db_connection() -> sqlite3.Connection:
    """Creates or connects to the SQLite database with row factory enabled."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initializes tables for watchlist and search index."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Watchlist table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL UNIQUE,
        name TEXT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Cached Ticker search metadata
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS stock_directory (
        symbol TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        exchange TEXT,
        sector TEXT
    );
    """)

    # Seed default popular symbols if empty
    cursor.execute("SELECT COUNT(*) FROM watchlist")
    if cursor.fetchone()[0] == 0:
        default_watchlist = [
            ("AAPL", "Apple Inc."),
            ("MSFT", "Microsoft Corporation"),
            ("GOOGL", "Alphabet Inc."),
            ("NVDA", "NVIDIA Corporation"),
            ("AMZN", "Amazon.com Inc.")
        ]
        cursor.executemany(
            "INSERT OR IGNORE INTO watchlist (symbol, name) VALUES (?, ?)",
            default_watchlist
        )

    # Seed stock directory
    cursor.execute("SELECT COUNT(*) FROM stock_directory")
    if cursor.fetchone()[0] == 0:
        directory_stocks = [
            ("AAPL", "Apple Inc.", "NASDAQ", "Technology"),
            ("MSFT", "Microsoft Corporation", "NASDAQ", "Technology"),
            ("GOOGL", "Alphabet Inc.", "NASDAQ", "Communication Services"),
            ("AMZN", "Amazon.com Inc.", "NASDAQ", "Consumer Cyclical"),
            ("TSLA", "Tesla Inc.", "NASDAQ", "Consumer Cyclical"),
            ("NVDA", "NVIDIA Corporation", "NASDAQ", "Technology"),
            ("META", "Meta Platforms Inc.", "NASDAQ", "Communication Services"),
            ("JPM", "JPMorgan Chase & Co.", "NYSE", "Financial Services"),
            ("V", "Visa Inc.", "NYSE", "Financial Services"),
            ("WMT", "Walmart Inc.", "NYSE", "Consumer Defensive"),
            ("RELIANCE.NS", "Reliance Industries Ltd", "NSE", "Energy"),
            ("TCS.NS", "Tata Consultancy Services Ltd", "NSE", "Technology"),
            ("INFY.NS", "Infosys Ltd", "NSE", "Technology"),
            ("HDFCBANK.NS", "HDFC Bank Ltd", "NSE", "Financial Services"),
            ("ICICIBANK.NS", "ICICI Bank Ltd", "NSE", "Financial Services"),
            ("SPY", "SPDR S&P 500 ETF Trust", "NYSE ARCA", "Index ETF"),
            ("QQQ", "Invesco QQQ Trust", "NASDAQ", "Index ETF"),
            ("DIA", "SPDR Dow Jones Industrial Average ETF", "NYSE ARCA", "Index ETF")
        ]
        cursor.executemany(
            "INSERT OR IGNORE INTO stock_directory (symbol, name, exchange, sector) VALUES (?, ?, ?, ?)",
            directory_stocks
        )

    conn.commit()
    conn.close()


def get_all_watchlist() -> List[Dict[str, Any]]:
    """Retrieves all items from the watchlist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, symbol, name, added_at FROM watchlist ORDER BY added_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def add_to_watchlist(symbol: str, name: Optional[str] = None) -> bool:
    """Adds a ticker symbol to the watchlist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO watchlist (symbol, name) VALUES (?, ?)",
            (symbol.strip().upper(), name or symbol.strip().upper())
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def remove_from_watchlist(symbol: str) -> bool:
    """Removes a ticker symbol from the watchlist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM watchlist WHERE symbol = ?", (symbol.strip().upper(),))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def search_stocks(query: str) -> List[Dict[str, Any]]:
    """Searches the local stock directory by symbol or company name."""
    conn = get_db_connection()
    cursor = conn.cursor()
    pattern = f"%{query.strip().upper()}%"
    cursor.execute(
        "SELECT symbol, name, exchange, sector FROM stock_directory WHERE symbol LIKE ? OR UPPER(name) LIKE ? LIMIT 10",
        (pattern, pattern)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
