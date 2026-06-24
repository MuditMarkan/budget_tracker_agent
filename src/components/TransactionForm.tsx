import React, { useState, useEffect } from 'react';
import { Transaction, CategoryInfo } from '../types';
import { AVAILABLE_CATEGORIES } from '../data';
import { Plus, X, AlertCircle } from 'lucide-react';

interface TransactionFormProps {
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

export default function TransactionForm({ onAddTransaction, onClose }: TransactionFormProps) {
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<string>('Food');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Auto-switch category when type changes
  useEffect(() => {
    if (type === 'income') {
      setCategory('Income');
    } else {
      setCategory('Food');
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Please provide a short description or merchant name.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid monetary amount greater than zero.');
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  const currentCategories = type === 'income' 
    ? AVAILABLE_CATEGORIES.filter(c => c.name === 'Income' || c.name === 'Misc')
    : AVAILABLE_CATEGORIES.filter(c => c.name !== 'Income');

  return (
    <div id="tx-modal-overlay" className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        id="tx-modal-body" 
        className="bg-[#14161A] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0A0B0D]/50 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Add Transaction</h3>
            <p className="text-xs text-slate-400">Record a new ledger transaction</p>
          </div>
          <button 
            id="btn-close-tx-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {/* Error Message */}
          {error && (
            <div id="tx-error-banner" className="flex items-center gap-2 p-3 bg-rose-950/20 text-rose-400 text-xs rounded-lg border border-rose-900/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: Income or Expense */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Transaction Type</label>
            <div className="grid grid-cols-2 gap-2 bg-[#0A0B0D] p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                id="btn-type-expense"
                onClick={() => setType('expense')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  type === 'expense' 
                    ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Expense (Outflow)
              </button>
              <button
                type="button"
                id="btn-type-income"
                onClick={() => setType('income')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  type === 'income' 
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Income (Inflow)
              </button>
            </div>
          </div>

          {/* Grid for Description and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="tx-desc" className="block text-xs font-semibold text-slate-400 mb-1">Description / Merchant</label>
              <input
                id="tx-desc"
                type="text"
                required
                placeholder="e.g., Target, Starbucks, Paycheck"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#0A0B0D] border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-655"
              />
            </div>
            <div>
              <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-400 mb-1">Amount ($)</label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                required
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#0A0B0D] border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono placeholder:text-slate-655"
              />
            </div>
          </div>

          {/* Grid for Category and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tx-category" className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#0A0B0D] border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {currentCategories.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
              <input
                id="tx-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#0A0B0D] border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label htmlFor="tx-notes" className="block text-xs font-semibold text-slate-400 mb-1">Notes (Optional)</label>
            <textarea
              id="tx-notes"
              rows={2}
              placeholder="Add payment method, specific items, or memo details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#0A0B0D] border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none placeholder:text-slate-655"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
            <button
              type="button"
              id="btn-cancel-add-tx"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-add-tx"
              className="px-5 py-2.5 text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-md shadow-emerald-500/10 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
