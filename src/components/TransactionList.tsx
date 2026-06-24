import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import { AVAILABLE_CATEGORIES } from '../data';
import { CategoryIcon } from './BudgetConfig';
import { 
  Search, Trash2, ListFilter, Download, Upload, RefreshCw, 
  ArrowUpDown, Calendar, DollarSign, FileText, Check, AlertCircle 
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onImportData: (data: string) => Promise<boolean>;
  onExportData: () => void;
  onResetData: () => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function TransactionList({ 
  transactions, 
  onDeleteTransaction, 
  onImportData, 
  onExportData, 
  onResetData 
}: TransactionListProps) {
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase()) || 
                          (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort transactions
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await onImportData(content);
      setImportSuccess(success);
      setTimeout(() => setImportSuccess(null), 3000);
    };
    reader.readAsText(file);
    
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="tx-list-container" className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      
      {/* Filtering Sidebar */}
      <div id="tx-filter-bar" className="xl:col-span-1 bg-[#14161A] p-5 rounded-3xl border border-slate-800 shadow-sm flex flex-col gap-4 h-fit">
        <div className="flex items-center gap-2 px-1 pb-3 border-b border-slate-800">
          <ListFilter className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white text-xs uppercase tracking-wider">Search & Filters</span>
        </div>

        {/* Search */}
        <div>
          <label htmlFor="search-input" className="block text-xs font-semibold text-slate-400 mb-1">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="search-input"
              type="text"
              placeholder="Merchant or note text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#0A0B0D] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-200 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Type selection */}
        <div>
          <label htmlFor="type-filter" className="block text-xs font-semibold text-slate-400 mb-1">Transaction Flow</label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 text-xs bg-[#0A0B0D] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-200 transition-all"
          >
            <option value="all">All Flows (In / Out)</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>

        {/* Category selection */}
        <div>
          <label htmlFor="category-filter" className="block text-xs font-semibold text-slate-400 mb-1">Financial Category</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#0A0B0D] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-200 transition-all"
          >
            <option value="all">All Categories</option>
            {AVAILABLE_CATEGORIES.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Sorting options */}
        <div>
          <label htmlFor="sort-filter" className="block text-xs font-semibold text-slate-400 mb-1">Order Listing By</label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-3 py-2 text-xs bg-[#0A0B0D] border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-200 transition-all font-mono"
          >
            <option value="date-desc">Date: Newest first</option>
            <option value="date-asc">Date: Oldest first</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>

        {/* Data Administration Utilities */}
        <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">Data Utilities</span>
          
          <button
            id="btn-export-backup"
            onClick={onExportData}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Financial JSON</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            id="btn-import-backup"
            onClick={handleImportClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import Financial JSON</span>
          </button>

          {importSuccess === true && (
            <div className="flex items-center gap-1.5 p-2 bg-emerald-950/30 text-emerald-400 text-[10px] font-medium rounded-lg border border-emerald-900/20">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Import successful!</span>
            </div>
          )}
          {importSuccess === false && (
            <div className="flex items-center gap-1.5 p-2 bg-rose-950/30 text-rose-400 text-[10px] font-medium rounded-lg border border-rose-900/20">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Invalid data file schema.</span>
            </div>
          )}

          <button
            id="btn-reset-app-data"
            onClick={() => {
              if (confirm("Are you sure you want to reset all data? This will clear all transactions and reseed the default database state.")) {
                onResetData();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-xs font-semibold rounded-xl border border-rose-900/30 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Database State</span>
          </button>
        </div>
      </div>

      {/* Structured ledger database table */}
      <div id="tx-ledger-main" className="xl:col-span-3 bg-[#14161A] rounded-3xl border border-slate-800 shadow-sm overflow-hidden flex flex-col h-fit">
        
        {/* Table summary bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/10">
          <div>
            <span className="text-xs font-mono font-semibold text-slate-500">Total Entries Loaded</span>
            <h3 className="text-sm font-bold text-white">{sorted.length} matching transactions</h3>
          </div>
          <span className="text-xs font-medium text-slate-400 italic bg-[#0A0B0D] px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs">
            Showing filtered ledger rows
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-900/20">
                <th className="px-6 py-3">Details / Merchant</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs font-medium">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-slate-700 animate-pulse" />
                      <p className="font-semibold text-sm text-slate-400">No matching transactions found</p>
                      <p className="text-xs text-slate-500">Try adjusting your filters or record a new transaction.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((tx) => {
                  const catInfo = AVAILABLE_CATEGORIES.find(c => c.name === tx.category) || {
                    name: tx.category, color: '#94a3b8', bgColor: 'bg-slate-800 text-slate-300 border-slate-700', icon: 'HelpCircle'
                  };

                  return (
                    <tr 
                      key={tx.id}
                      id={`tx-row-${tx.id}`}
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* Name and notes details */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{tx.description}</span>
                          {tx.notes && (
                            <span className="text-[10px] text-slate-500 font-normal line-clamp-1 italic mt-0.5 max-w-xs flex items-center gap-1">
                              <FileText className="w-3 h-3 shrink-0" />
                              <span>{tx.notes}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          catInfo.bgColor.includes('bg-slate-50')
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : catInfo.bgColor
                        }`}>
                          <CategoryIcon name={catInfo.icon} className="w-3 h-3" />
                          <span>{tx.category}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{tx.date}</span>
                        </span>
                      </td>

                      {/* Amount with proper formatting and color code */}
                      <td className="px-6 py-4 text-right font-mono">
                        <span className={`text-xs font-bold ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                      </td>

                      {/* Trash action button */}
                      <td className="px-6 py-4 text-center">
                        <button
                          id={`btn-delete-tx-${tx.id}`}
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 cursor-pointer"
                          title="Delete transaction entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
