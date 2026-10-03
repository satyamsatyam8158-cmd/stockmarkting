import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function HistoricalData({ selectedStock }) {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('1y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    loadHistory(selectedStock, period);
  }, [selectedStock, period]);

  const loadHistory = async (sym, p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistory(sym, p);
      setData(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to load historical data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and Sort Data
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    return row.date.includes(searchTerm);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export utility
  const exportToCSV = () => {
    if (!data.length) return;
    const headers = ["Date", "Open", "High", "Low", "Close", "Volume"];
    const rows = sortedData.map(r => [r.date, r.open, r.high, r.low, r.close, r.volume]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedStock}_historical_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans m-0">
                Historical Price Records: {selectedStock}
              </h1>
              <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                OHLCV Table
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Raw historical transaction records with multi-column sorting, pagination, and CSV export.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportToCSV}
              disabled={!data.length}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter by Date (e.g. 2026-09)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded border border-slate-200 font-mono">
              {['3mo', '6mo', '1y', '2y', '5y'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    period === p ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-500 font-mono">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
            >
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
            <span>Total: {sortedData.length} records</span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded text-rose-800 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-1 text-rose-600" />
          {error}
        </div>
      ) : loading ? (
        <div className="bg-white p-12 text-center text-slate-500 rounded border border-slate-200">
          Loading historical records...
        </div>
      ) : (
        <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 text-[11px]">
                <tr>
                  <th 
                    onClick={() => handleSort('date')}
                    className="py-2.5 px-4 font-semibold cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {sortField === 'date' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                      ) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('open')}
                    className="py-2.5 px-4 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Open ($)</span>
                      {sortField === 'open' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                      ) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('high')}
                    className="py-2.5 px-4 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>High ($)</span>
                      {sortField === 'high' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                      ) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('low')}
                    className="py-2.5 px-4 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Low ($)</span>
                      {sortField === 'low' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                      ) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('close')}
                    className="py-2.5 px-4 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Close ($)</span>
                      {sortField === 'close' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                      ) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('volume')}
                    className="py-2.5 px-4 font-semibold text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Volume</span>
                      {sortField === 'volume' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                      ) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((row) => {
                  const isDayGreen = row.close >= row.open;
                  return (
                    <tr key={row.date} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{row.date}</td>
                      <td className="py-2.5 px-4 text-right text-slate-700">${row.open.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right text-emerald-600">${row.high.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right text-rose-600">${row.low.toFixed(2)}</td>
                      <td className={`py-2.5 px-4 text-right font-bold ${isDayGreen ? 'text-emerald-700' : 'text-rose-700'}`}>
                        ${row.close.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600">{row.volume.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded font-medium disabled:opacity-40 hover:bg-slate-100"
              >
                Previous
              </button>
              <span className="font-semibold text-slate-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded font-medium disabled:opacity-40 hover:bg-slate-100"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
