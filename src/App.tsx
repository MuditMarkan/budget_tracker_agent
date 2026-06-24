import React, { useState, useEffect } from 'react';
import { Transaction, BudgetLimit, PRDSection } from './types';
import { 
  INITIAL_PRD_SECTIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGET_LIMITS 
} from './data';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import BudgetConfig from './components/BudgetConfig';
import PrdDocs from './components/PrdDocs';
import TransactionForm from './components/TransactionForm';
import { 
  LayoutDashboard, List, Target, BookOpen, Plus, 
  User, Database, AlertCircle, FileText, Download, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- STATE INITIALIZATION (Asynchronous Fetching with API Backend) ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [limits, setLimits] = useState<BudgetLimit[]>([]);
  const [prdSections, setPrdSections] = useState<PRDSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'limits' | 'prd-docs'>('dashboard');
  const [isAddTxOpen, setIsAddTxOpen] = useState<boolean>(false);

  // --- PERSISTENCE EFFECT (Fetch state on mount) ---
  useEffect(() => {
    let isMounted = true;
    
    async function loadAllData() {
      try {
        const [txRes, limitsRes, prdRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/limits'),
          fetch('/api/prd-sections')
        ]);
        
        if (!txRes.ok || !limitsRes.ok || !prdRes.ok) {
          throw new Error('Database server responded with an error status.');
        }
        
        const txData = await txRes.json();
        const limitsData = await limitsRes.json();
        const prdData = await prdRes.json();
        
        if (isMounted) {
          setTransactions(txData);
          setLimits(limitsData);
          setPrdSections(prdData);
          setSyncError(null);
        }
      } catch (err: any) {
        console.error('Failed to load budget database state:', err);
        if (isMounted) {
          setSyncError(err.message || 'Could not establish connection to the ledger database.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    loadAllData();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- ACTIONS & CRUD HANDLERS (Asynchronous APIs) ---
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      if (!res.ok) throw new Error('API server failed to record transaction entry.');
      const savedTx = await res.json();
      setTransactions(prev => [savedTx, ...prev]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Network sync failure.');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('API server failed to delete ledger entry.');
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Network sync failure.');
    }
  };

  const handleUpdateLimit = async (category: string, newLimit: number) => {
    try {
      const res = await fetch(`/api/limits/${encodeURIComponent(category)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: newLimit })
      });
      if (!res.ok) throw new Error('API server failed to save budget ceiling.');
      
      setLimits(prev => {
        const exists = prev.some(l => l.category === category);
        if (exists) {
          return prev.map(l => l.category === category ? { ...l, limit: newLimit } : l);
        } else {
          return [...prev, { category, limit: newLimit }];
        }
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Network sync failure.');
    }
  };

  const handleResetLimits = async () => {
    try {
      const res = await fetch('/api/limits/reset', { method: 'POST' });
      if (!res.ok) throw new Error('API server failed to reset budget limits.');
      const updatedLimits = await res.json();
      setLimits(updatedLimits);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Network sync failure.');
    }
  };

  const handleSavePRDSection = async (id: string, newContent: string) => {
    try {
      const res = await fetch(`/api/prd-sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      if (!res.ok) throw new Error('API server failed to update requirements specification.');
      const updatedSection = await res.json();
      setPrdSections(prev => prev.map(s => s.id === id ? updatedSection : s));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Network sync failure.');
    }
  };

  const handleImportData = async (rawJson: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.limits)) {
        return false;
      }
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      if (!res.ok) throw new Error('API server failed to process database import.');
      
      setTransactions(parsed.transactions);
      setLimits(parsed.limits);
      if (Array.isArray(parsed.prdSections)) {
        setPrdSections(parsed.prdSections);
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleExportData = () => {
    const fullState = {
      transactions,
      limits,
      prdSections
    };
    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BUDGET_TRACKER_STATE.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetAllData = async () => {
    try {
      const res = await fetch('/api/reset-all', { method: 'POST' });
      if (!res.ok) throw new Error('API server failed to execute hard reset.');
      
      const [txRes, limitsRes, prdRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/limits'),
        fetch('/api/prd-sections')
      ]);
      
      setTransactions(await txRes.json());
      setLimits(await limitsRes.json());
      setPrdSections(await prdRes.json());
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Network sync failure.');
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#0A0B0D] flex flex-col md:flex-row font-sans text-slate-200 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* 1. SIDEBAR NAVIGATION PANELS */}
      <aside id="app-sidebar" className="w-full md:w-64 bg-[#0A0B0D] text-slate-300 flex flex-col justify-between p-5 border-b md:border-b-0 md:border-r border-slate-800 shrink-0">
        
        {/* Upper Sidebar */}
        <div className="flex flex-col gap-6">
          
          {/* Brand header */}
          <div className="flex items-center gap-3 px-1.5 py-1">
            <div className="bg-emerald-500 text-black p-2 rounded-xl shadow-lg shadow-emerald-500/10">
              <Database className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-wide uppercase">VaultFlow</h1>
              <span className="text-[10px] font-mono text-slate-500 font-bold block leading-tight">Ledger & Specification</span>
            </div>
          </div>

          {/* Quick Transaction Action Button */}
          <button
            id="btn-sidebar-quick-add"
            onClick={() => setIsAddTxOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-md shadow-emerald-500/10 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Log Entry</span>
          </button>

          {/* Nav Links */}
          <nav id="sidebar-nav" className="flex flex-col gap-1.5 mt-2">
            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase px-2 mb-1">Navigation</span>
            
            <button
              id="tab-btn-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all border ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800/50 text-white border-slate-700/50 shadow-inner font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/30'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-emerald-400' : ''}`} />
              <span>Dashboard Overview</span>
            </button>

            <button
              id="tab-btn-ledger"
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all border ${
                activeTab === 'ledger'
                  ? 'bg-slate-800/50 text-white border-slate-700/50 shadow-inner font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/30'
              }`}
            >
              <List className={`w-4 h-4 shrink-0 ${activeTab === 'ledger' ? 'text-emerald-400' : ''}`} />
              <span>Transaction Ledger</span>
            </button>

            <button
              id="tab-btn-limits"
              onClick={() => setActiveTab('limits')}
              className={`flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all border ${
                activeTab === 'limits'
                  ? 'bg-slate-800/50 text-white border-slate-700/50 shadow-inner font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/30'
              }`}
            >
              <Target className={`w-4 h-4 shrink-0 ${activeTab === 'limits' ? 'text-emerald-400' : ''}`} />
              <span>Monthly Targets</span>
            </button>

            <button
              id="tab-btn-prd"
              onClick={() => setActiveTab('prd-docs')}
              className={`flex items-center gap-3 px-4 py-2.5 text-xs font-medium rounded-xl transition-all border ${
                activeTab === 'prd-docs'
                  ? 'bg-slate-800/50 text-white border-slate-700/50 shadow-inner font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/30'
              }`}
            >
              <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'prd-docs' ? 'text-emerald-400' : ''}`} />
              <span>PRD Requirements</span>
            </button>
          </nav>
        </div>

        {/* Lower Sidebar Session Information */}
        <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-slate-800">
          <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase px-2">Active Session</span>
          
          <div className="bg-[#14161A] p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="bg-slate-800/80 text-emerald-400 p-1 rounded-md">
                <User className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold text-white tracking-tight line-clamp-1">
                aquariustestautomation@gmail.com
              </span>
            </div>
            <div className="text-[9px] font-medium text-slate-400 flex items-center justify-between">
              <span>Environment:</span>
              <span className="font-mono text-[8px] bg-emerald-950/30 text-emerald-400 px-1 py-0.2 rounded border border-emerald-900/30">Sandbox Preview</span>
            </div>
          </div>
        </div>

      </aside>

      {/* 2. MAIN CONTAINER VIEWPORT */}
      <main id="app-viewport" className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* Dynamic Canvas with Animated Transitions */}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              </div>
              <p className="mt-4 text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Ledger...</p>
            </div>
          ) : syncError ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-[#14161A] border border-slate-800 rounded-3xl p-8 max-w-md mx-auto text-center gap-4 my-auto">
              <div className="p-3 bg-rose-950/20 text-rose-400 rounded-2xl border border-rose-900/30">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Database Sync Error</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{syncError}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className="flex-1"
              >
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    transactions={transactions} 
                    limits={limits}
                    onNavigateToLimits={() => setActiveTab('limits')}
                    onNavigateToLedger={() => setActiveTab('ledger')}
                  />
                )}

                {activeTab === 'ledger' && (
                  <TransactionList 
                    transactions={transactions}
                    onDeleteTransaction={handleDeleteTransaction}
                    onImportData={handleImportData}
                    onExportData={handleExportData}
                    onResetData={handleResetAllData}
                  />
                )}

                {activeTab === 'limits' && (
                  <BudgetConfig 
                    limits={limits}
                    onUpdateLimit={handleUpdateLimit}
                    onResetLimits={handleResetLimits}
                  />
                )}

                {activeTab === 'prd-docs' && (
                  <PrdDocs 
                    sections={prdSections}
                    onSaveSection={handleSavePRDSection}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

      </main>

      {/* 3. TRANSACTION MODAL DIALOG */}
      {isAddTxOpen && (
        <TransactionForm 
          onAddTransaction={handleAddTransaction}
          onClose={() => setIsAddTxOpen(false)}
        />
      )}

    </div>
  );
}
