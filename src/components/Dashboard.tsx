import React from 'react';
import { Transaction, BudgetLimit } from '../types';
import { AVAILABLE_CATEGORIES } from '../data';
import { CategoryIcon } from './BudgetConfig';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  AlertTriangle, CheckCircle, Percent, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  limits: BudgetLimit[];
  onNavigateToLimits: () => void;
  onNavigateToLedger: () => void;
}

export default function Dashboard({ transactions, limits, onNavigateToLimits, onNavigateToLedger }: DashboardProps) {
  
  // Calculate Totals
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Calculate Spend per category
  const categorySpend: { [category: string]: number } = {};
  expenseTransactions.forEach((tx) => {
    categorySpend[tx.category] = (categorySpend[tx.category] || 0) + tx.amount;
  });

  // Data for Category breakdown (Donut Chart)
  const pieData = Object.keys(categorySpend).map((catName) => {
    const catInfo = AVAILABLE_CATEGORIES.find(c => c.name === catName) || { color: '#64748b' };
    return {
      name: catName,
      value: Math.round(categorySpend[catName] * 100) / 100,
      color: catInfo.color
    };
  }).filter(item => item.value > 0);

  // Data for Spent vs Limit comparison (Bar Chart)
  const barData = AVAILABLE_CATEGORIES
    .filter(cat => cat.name !== 'Income')
    .map((cat) => {
      const limitObj = limits.find(l => l.category === cat.name) || { limit: 0 };
      const actualSpend = categorySpend[cat.name] || 0;
      return {
        name: cat.name,
        'Actual Spent': Math.round(actualSpend * 100) / 100,
        'Budget Target': limitObj.limit,
        color: cat.color
      };
    });

  // Calculate overall limit status
  const totalBudgetableLimit = limits.reduce((acc, curr) => acc + curr.limit, 0);
  const budgetUtilizationPercent = totalBudgetableLimit > 0 
    ? Math.round((totalExpense / totalBudgetableLimit) * 100) 
    : 0;

  // Custom tooltips for better styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-md text-xs font-medium font-mono">
          <p className="font-bold text-slate-300 font-sans mb-1">{payload[0].name}</p>
          <p className="text-indigo-400">Value: ${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-md text-xs font-mono font-medium">
          <p className="font-bold text-slate-300 font-sans mb-1">{payload[0].payload.name}</p>
          <p className="text-emerald-400">Spent: ${payload[0].value.toLocaleString()}</p>
          <p className="text-indigo-400">Target Limit: ${payload[1].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="dashboard-container" className="flex flex-col gap-6">
      
      {/* Metrics Row */}
      <div id="metrics-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Net Balance Card */}
        <div id="metric-net-balance" className="bg-[#14161A] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Net Balance</span>
              <span className="text-xs text-slate-400 font-medium">Accumulated net funds available</span>
            </div>
            <div className={`p-2.5 rounded-xl ${netBalance >= 0 ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold font-mono tracking-tight ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg border mt-2 ${
              netBalance >= 0 
                ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/20' 
                : 'bg-rose-950/30 text-rose-400 border-rose-900/20'
            }`}>
              {netBalance >= 0 ? (
                <>
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Financially Solvent</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>Deficit Warning</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Total Monthly Income */}
        <div id="metric-monthly-income" className="bg-[#14161A] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Cash Inflows</span>
              <span className="text-xs text-slate-400 font-medium">Income credits recorded</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white font-mono tracking-tight">
              ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-900/20 mt-2">
              <ArrowUpRight className="w-3 h-3" />
              <span>Earnings Surplus</span>
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div id="metric-total-expenses" className="bg-[#14161A] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Expenses Outflow</span>
              <span className="text-xs text-slate-400 font-medium">Spending logs and bills paid</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-900/30">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white font-mono tracking-tight">
              ${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold bg-rose-950/30 px-2 py-0.5 rounded-lg border border-rose-900/20 mt-2">
              <ArrowDownRight className="w-3 h-3" />
              <span>Budget Outflow</span>
            </span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div id="charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Allocation Pie */}
        <div id="chart-pie-card" className="bg-[#14161A] p-6 rounded-3xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Expense Allocation</h4>
              <p className="text-xs text-slate-400">Percentage distribution of monthly spending</p>
            </div>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex-1 min-h-[260px] flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-12">
                No expense transactions recorded to display.
              </div>
            ) : (
              <div className="w-full h-full relative" style={{ minHeight: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-semibold text-slate-400">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Spent vs Budget Targets Bar Chart */}
        <div id="chart-bar-card" className="bg-[#14161A] p-6 rounded-3xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Spent vs. Target Budgets</h4>
              <p className="text-xs text-slate-400">Comparing actual spending against target ceilings</p>
            </div>
            <button 
              id="btn-navigate-limits-dashboard"
              onClick={onNavigateToLimits}
              className="text-xs font-semibold text-emerald-400 hover:text-white hover:bg-emerald-500 bg-slate-800 hover:text-black px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
            >
              Adjust Limits
            </button>
          </div>

          <div className="flex-1 min-h-[260px]">
            <div className="w-full h-full" style={{ minHeight: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }} />
                  <Bar dataKey="Actual Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="Budget Target" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Category Budget Alerts Progress Grid */}
      <div id="budget-progress-section" className="bg-[#14161A] p-6 rounded-3xl border border-slate-800 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="text-sm font-bold text-white">Category Spending Progress</h4>
            <p className="text-xs text-slate-400">Track usage progress bars against set ceilings</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">Overall Progress</span>
            <span className={`text-xs font-mono font-bold ${
              budgetUtilizationPercent >= 100 
                ? 'text-rose-400' 
                : budgetUtilizationPercent >= 75 
                ? 'text-yellow-400' 
                : 'text-emerald-400'
            }`}>
              {budgetUtilizationPercent}% Used (${totalExpense.toLocaleString()} of ${totalBudgetableLimit.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Progress Grid */}
        <div id="progress-cards-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_CATEGORIES
            .filter(cat => cat.name !== 'Income')
            .map((cat) => {
              const limitObj = limits.find(l => l.category === cat.name) || { limit: 0 };
              const spent = categorySpend[cat.name] || 0;
              const limit = limitObj.limit;
              const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0;

              // Color-coding based on threshold percent
              let statusColor = 'bg-emerald-500';
              let textColor = 'text-emerald-400';
              let bgColor = 'bg-emerald-950/30';
              let borderColor = 'border-emerald-900/30';

              if (percentUsed >= 100) {
                statusColor = 'bg-rose-500 animate-pulse';
                textColor = 'text-rose-400';
                bgColor = 'bg-rose-950/30';
                borderColor = 'border-rose-900/30';
              } else if (percentUsed >= 75) {
                statusColor = 'bg-yellow-500';
                textColor = 'text-yellow-400';
                bgColor = 'bg-yellow-950/30';
                borderColor = 'border-yellow-900/30';
              }

              return (
                <div 
                  key={cat.name}
                  id={`progress-card-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                  className="p-4 rounded-2xl border border-slate-800 bg-[#0A0B0D] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${cat.bgColor.split(' ')[0] || 'bg-slate-800'}`}>
                        <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      ${spent.toFixed(2)} / ${limit.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar background */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full ${statusColor}`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">{percentUsed}% consumed</span>
                    {percentUsed >= 75 && (
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${bgColor} ${textColor} ${borderColor}`}>
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>{percentUsed >= 100 ? 'Limit Breached' : 'Caution Target'}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
