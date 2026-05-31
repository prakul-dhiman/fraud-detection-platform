import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Search, Download, Trash2, AlertCircle, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';
import ShapChart from '../components/ShapChart';

function downloadCSV(transactions) {
  const headers = ['id', 'time', 'amount', 'prediction', 'confidence', 'date'];
  const rows = transactions.map((tx) => [
    tx.id || '',
    tx.time ?? '',
    tx.amount ?? tx.Amount ?? '',
    tx.prediction === 1 || tx.prediction === 'fraud' ? 'FRAUD' : 'LEGIT',
    tx.confidence ? (tx.confidence * 100).toFixed(2) + '%' : '',
    tx.created_at || tx.date || '',
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fraudshield_history.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function DetailModal({ transaction, onClose }) {
  if (!transaction) return null;
  const isFraud = transaction.prediction === 1 || transaction.prediction === 'fraud';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl mx-4 bg-[#0c0c16] border border-white/10 rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Transaction Detail</p>
            <h2 className="text-lg font-bold">
              {isFraud ? (
                <span className="text-red-500 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> FRAUD DETECTED</span>
              ) : (
                <span className="text-emerald-500 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> LEGITIMATE</span>
              )}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-white/50 hover:bg-white/10 transition-colors">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Amount', value: transaction.amount != null ? `$${Number(transaction.amount).toFixed(2)}` : '—' },
            { label: 'Confidence', value: transaction.confidence ? `${(transaction.confidence * 100).toFixed(1)}%` : '—' },
            { label: 'Time Feature', value: transaction.time ?? '—' },
            { label: 'Date', value: transaction.created_at ? new Date(transaction.created_at).toLocaleString() : '—' },
          ].map((item) => (
            <div key={item.label} className="px-4 py-3 rounded-xl bg-white/5">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-white font-semibold text-sm">{item.value}</p>
            </div>
          ))}
        </div>

        {(transaction.shap_values || transaction.shapValues) ? (
          <ShapChart shapValues={transaction.shap_values || transaction.shapValues} title="Feature Contributions" />
        ) : (
          <div className="bg-white/5 rounded-xl p-5 text-center">
            <p className="text-white/30 text-sm">No SHAP explanation available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function History() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', 10);
      if (filter !== 'all') params.set('prediction', filter === 'fraud' ? 1 : 0);
      if (search.trim()) params.set('search', search.trim());
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);

      const res = await api.get(`/transactions/history?${params.toString()}`);
      setData(res.data.transactions || res.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search, dateFrom, dateTo]);

  useEffect(() => {
    const timer = setTimeout(fetchHistory, 300);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-indigo-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-white/20 bg-transparent text-indigo-500 focus:ring-indigo-500"
        />
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: info => `$${Number(info.getValue()).toFixed(2)}`,
    },
    {
      accessorKey: 'prediction',
      header: 'Risk',
      cell: info => {
        const val = info.getValue();
        const isFraud = val === 1 || val === 'fraud';
        return isFraud ? (
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-red-500/20 text-red-400 border border-red-500/20">Fraud</span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">Legit</span>
        );
      },
    },
    {
      accessorKey: 'confidence',
      header: 'Confidence',
      cell: info => info.getValue() ? `${(info.getValue() * 100).toFixed(1)}%` : '—',
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleString() : '—',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedTx(row.original); }}
          className="px-3 py-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors"
        >
          View Details
        </button>
      ),
    }
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows;

  const handleBulkExport = () => {
    if (!selectedRows.length) return;
    downloadCSV(selectedRows.map(r => r.original));
    toast.success(`Exported ${selectedRows.length} transactions`);
  };

  const handleBulkDelete = () => {
    if (!selectedRows.length) return;
    // Mock delete for demo
    setData(prev => prev.filter(item => !selectedRows.find(r => r.original.id === item.id)));
    setRowSelection({});
    toast.success(`Deleted ${selectedRows.length} transactions`);
  };

  return (
    <div className="max-w-6xl space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Enterprise Data Grid</h1>
          <p className="text-white/40 text-sm">Advanced history tracking and management</p>
        </div>
      </div>

      <div className="bg-[#111116] border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex bg-[#1a1a24] rounded-xl overflow-hidden border border-white/5">
            {['all', 'fraud', 'legit'].map(k => (
              <button
                key={k}
                onClick={() => { setFilter(k); setPage(1); }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${filter === k ? 'bg-indigo-600 text-white' : 'text-white/50 hover:bg-white/5'}`}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search amount..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#1a1a24] border border-white/5 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="bg-[#1a1a24] border border-white/5 text-white/60 text-sm rounded-xl px-3 py-2 focus:outline-none"
          />
          <span className="text-white/30 text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="bg-[#1a1a24] border border-white/5 text-white/60 text-sm rounded-xl px-3 py-2 focus:outline-none"
          />
        </div>

        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
            <span className="text-xs text-indigo-300 font-medium mr-2">{selectedRows.length} selected</span>
            <button onClick={handleBulkExport} className="p-1.5 hover:bg-indigo-500/20 rounded-md text-indigo-400 transition-colors" title="Export Selected">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={handleBulkDelete} className="p-1.5 hover:bg-red-500/20 rounded-md text-red-400 transition-colors" title="Delete Selected">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-white/5 bg-[#1a1a24]/50">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-1 hover:text-white/70' : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUp className="w-3 h-3" />,
                            desc: <ChevronDown className="w-3 h-3" />,
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-white/40">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading data...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-white/40">No transactions found</td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} onClick={() => row.toggleSelected()} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-white/80">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a24]/30 border-t border-white/5">
          <div className="text-xs text-white/40">
            Showing {data.length} of {total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-white/60 font-medium">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={data.length < 10} // Simple check
              className="px-3 py-1 text-xs rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedTx && <DetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}
