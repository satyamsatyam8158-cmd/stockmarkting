import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StockAnalysis from './pages/StockAnalysis';
import Prediction from './pages/Prediction';
import Compare from './pages/Compare';
import Watchlist from './pages/Watchlist';
import HistoricalData from './pages/HistoricalData';
import About from './pages/About';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState('AAPL');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Professional Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        selectedStock={selectedStock}
        onSelectStock={(sym) => {
          setSelectedStock(sym);
          // Return to dashboard or analysis when a new stock is picked
          if (activePage === 'about' || activePage === 'compare') {
            setActivePage('dashboard');
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePage === 'dashboard' && (
          <Dashboard
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'analysis' && (
          <StockAnalysis
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
          />
        )}

        {activePage === 'prediction' && (
          <Prediction
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
          />
        )}

        {activePage === 'compare' && (
          <Compare
            setSelectedStock={setSelectedStock}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'watchlist' && (
          <Watchlist
            setSelectedStock={setSelectedStock}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'history' && (
          <HistoricalData
            selectedStock={selectedStock}
          />
        )}

        {activePage === 'about' && (
          <About />
        )}
      </main>

      {/* Traditional Financial Analytics Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 font-mono">StockVision</span>
            <span>—</span>
            <span>Full-Stack Financial Analytics & Price Prediction Platform</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
            <span>FastAPI + SQLite + React</span>
            <span>•</span>
            <span>Scikit-Learn ML Pipeline</span>
            <span>•</span>
            <span>Academic Minor Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
