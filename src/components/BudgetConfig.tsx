import React, { useState } from 'react';
import { BudgetLimit, CategoryInfo } from '../types';
import { AVAILABLE_CATEGORIES } from '../data';
import { 
  Utensils, Home, Car, Zap, Film, ShoppingBag, 
  HeartPulse, GraduationCap, HelpCircle, TrendingUp,
  Settings, Save, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface BudgetConfigProps {
  limits: BudgetLimit[];
  onUpdateLimit: (category: string, newLimit: number) => void;
  onResetLimits: () => void;
}

// Icon mapper helper
export function CategoryIcon({ name, className = "w-4 h-4" }: { name: string; className?: string }) {
  switch (name) {
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Car': return <Car className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Film': return <Film className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    default: return <HelpCircle className={className} />;
  }
}

export default function BudgetConfig({ limits, onUpdateLimit, onResetLimits }: BudgetConfigProps) {
  const [editLimits, setEditLimits] = useState<{ [category: string]: string }>(
    limits.reduce((acc, curr) => ({ ...acc, [curr.category]: curr.limit.toString() }), {})
  );
  const [savedCategories, setSavedCategories] = useState<string[]>([]);

  const handleInputChange = (category: string, value: string) => {
    setEditLimits(prev => ({ ...prev, [category]: value }));
  };

  const handleSave = (category: string) => {
    const val = parseFloat(editLimits[category]);
    if (isNaN(val) || val < 0) {
      alert("Please enter a valid positive number for the budget limit.");
      return;
    }
    onUpdateLimit(category, val);
    setSavedCategories(prev => [...prev, category]);
    setTimeout(() => {
      setSavedCategories(prev => prev.filter(c => c !== category));
    }, 2000);
  };

  const handleResetToDefault = () => {
    if (confirm("Are you sure you want to reset all category spending limits to their standard values?")) {
      onResetLimits();
      // Synchronize back
      const defaultLimits = [
        { category: 'Food', limit: 600 },
        { category: 'Rent & Living', limit: 2200 },
        { category: 'Transport', limit: 150 },
        { category: 'Utilities', limit: 200 },
        { category: 'Entertainment', limit: 250 },
        { category: 'Shopping', limit: 400 },
        { category: 'Healthcare', limit: 300 },
        { category: 'Education', limit: 200 },
        { category: 'Misc', limit: 150 }
      ];
      setEditLimits(
        defaultLimits.reduce((acc, curr) => ({ ...acc, [curr.category]: curr.limit.toString() }), {})
      );
    }
  };

  // Skip "Income" from budget limits as it's an inflow
  const budgetableCategories = AVAILABLE_CATEGORIES.filter(c => c.name !== 'Income');

  return (
    <div id="budget-config-container" className="flex flex-col gap-6">
      {/* Upper header action area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14161A] p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Monthly Budget Limits</span>
          </h2>
          <p className="text-xs text-slate-400">Configure visual thresholds and notifications for individual categories.</p>
        </div>
        <button
          id="btn-reset-limits"
          onClick={handleResetToDefault}
          className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 rounded-xl transition-all duration-200 cursor-pointer"
        >
          Reset to Factory Defaults
        </button>
      </div>

      {/* Limits Grid */}
      <div id="budget-limits-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetableCategories.map((cat) => {
          const limitObj = limits.find(l => l.category === cat.name) || { category: cat.name, limit: 0 };
          const value = editLimits[cat.name] || '0';
          const isSaved = savedCategories.includes(cat.name);

          return (
            <div 
              key={cat.name}
              id={`limit-card-${cat.name.toLowerCase().replace(/[^a-z0-s]/g, '')}`}
              className="bg-[#14161A] rounded-3xl border border-slate-800 hover:border-slate-700/80 p-5 flex flex-col justify-between transition-all group hover:shadow-lg"
            >
              {/* Header Info */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800/80 text-emerald-400">
                    <CategoryIcon name={cat.icon} className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500">Current limit: ${limitObj.limit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Form Input Group */}
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Unlimited"
                    value={value}
                    onChange={(e) => handleInputChange(cat.name, e.target.value)}
                    className="w-full pl-6 pr-3 py-1.5 text-xs font-mono text-slate-200 bg-[#0A0B0D] border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <button
                  id={`btn-save-limit-${cat.name}`}
                  onClick={() => handleSave(cat.name)}
                  className={`p-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                  title="Save budget limit"
                >
                  {isSaved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Threshold indicator preview */}
              <div className="mt-3.5 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-500">
                <AlertTriangle className="w-3 h-3 text-yellow-500/80" />
                <span>Alerts trigger once monthly spend exceeds 75%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
