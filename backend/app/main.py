"""
StockVision - Financial Analytics & Machine Learning Backend
Main FastAPI Application Entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database.database import init_db
from app.routes import stocks, prediction, watchlist


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and directory
    init_db()
    yield
    # Shutdown logic if any


app = FastAPI(
    title="StockVision API",
    description="Full-stack financial analysis and statistical stock price prediction API.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in dev environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(stocks.router)
app.include_router(prediction.router)
app.include_router(watchlist.router)


@app.get("/")
def root():
    return {
        "project": "StockVision",
        "description": "Stock Market Analysis & Machine Learning Forecasting Application",
        "status": "online",
        "docs_url": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "StockVision API"}
