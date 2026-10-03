import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  LineChart, 
  Layers, 
  Bookmark, 
  Table, 
  Info, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'analysis', label: 'Stock Analysis', icon: TrendingUp },
  { id: 'prediction', label: 'Prediction', icon: LineChart },
  { id: 'compare', label: 'Compare', icon: Layers },
  { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
  { id: 'history', label: 'Historical Data', icon: Table },
  { id: 'about', label: 'About Project', icon: Info },
];

export default function Navbar({ activePage, setActivePage, selectedStock, onSelectStock }) {
  const [indices, setIndices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch market indices for top ticker bar
    api.getMarketSummary()
      .then(data => setIndices(data))
      .catch(err => console.error("Indices load error:", err));
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 0) {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const results = await api.searchStocks(val);
        setSearchResults(results);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectSymbol = (symbol) => {
    onSelectStock(symbol);
    setSearchQuery('');
    setShowDropdown(false);
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
      {/* Top Benchmark Index Ticker Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center space-x-6 min-w-max">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Market Indices</span>
          {indices.length > 0 ? (
            indices.map((idx) => {
              const isPositive = idx.percent_change >= 0;
              return (
                <div key={idx.symbol} className="flex items-center space-x-1.5 font-mono">
                  <span className="text-slate-200 font-medium">{idx.name}:</span>
                  <span className="text-white">${idx.price.toLocaleString()}</span>
                  <span className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}{idx.percent_change}%
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex items-center space-x-4 text-slate-400 font-mono">
              <span>S&P 500: Loading...</span>
              <span>NASDAQ: Loading...</span>
              <span>DOW: Loading...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 pl-4 border-l border-slate-800 text-[11px] min-w-max">
          <span className="flex items-center text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
            Data Feeds Active
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">College Minor Project</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActivePage('dashboard')}>
            <div className="w-9 h-9 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              SV
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">StockVision</span>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono">v1.0</span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5">Financial Analytics & Machine Learning Platform</p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-72 sm:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowDropdown(true)}
                placeholder="Search symbol (e.g., AAPL, MSFT, RELIANCE.NS)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all font-mono"
              />
            </div>

            {/* Dropdown Suggestions */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.symbol}
                      onClick={() => handleSelectSymbol(item.symbol)}
                      className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold font-mono text-blue-700">{item.symbol}</span>
                        <span className="text-slate-600 ml-2">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-100 px-1 rounded">{item.exchange}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-500">
                    {isSearching ? 'Searching directory...' : (
                      <button
                        onClick={() => handleSelectSymbol(searchQuery)}
                        className="text-blue-700 hover:underline font-semibold"
                      >
                        Load '{searchQuery.toUpperCase()}' from market feed
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-1 font-medium">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-700 rounded-b-none'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
