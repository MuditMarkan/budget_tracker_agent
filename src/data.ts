import { Transaction, BudgetLimit, PRDSection, CategoryInfo } from './types';

export const INITIAL_PRD_SECTIONS: PRDSection[] = [
  {
    id: 'prd-summary',
    title: '1. Executive Summary',
    content: `### 1.1 Project Overview
The **Budget Tracker** is a client-first, highly responsive financial manager designed to empower users with full visibility into their income, expenditures, and visual category budgets. By adhering to local-first architectural principles, it delivers instantaneous interactions and absolute data privacy.

### 1.2 Problem Statement
Many consumers struggle with maintaining visual discipline over their spending habits. Existing solutions are either too complex, require high-friction external account syncs, or lack in-app documentation detailing their operational requirements and scope guidelines.

### 1.3 Key Value Proposition
- **Frictionless Onboarding**: Start managing budgets instantly without complex signup procedures.
- **Aesthetic Financial Visualizations**: Clean, responsive layout highlighting budget thresholds and monthly comparisons.
- **In-App PRD Explorer**: Integrated product requirements allows developers and product owners to trace features back to specifications instantly.
- **Durable Client Persistence**: Utilizes standard secure local storage for zero-config persistence.
`
  },
  {
    id: 'prd-requirements',
    title: '2. Functional Requirements',
    content: `### 2.1 Transaction Engine
The system must support full CRUD operations on individual financial logs:
- **Type**: Must distinguish between positive cash inflows (**Income**) and outflows (**Expense**).
- **Categories**: Dynamic associations (e.g., Food, Transport, Rent, Entertainment, Utilities, Healthcare, Shopping, Income, Misc).
- **Date Constraints**: Date selectors defaulting to current UTC timestamp.
- **Notes field**: Optional textual metadata to record receipts or custom memos.

### 2.2 Budget Limits & Alerts
Users must be able to specify monthly spending ceilings on a per-category basis:
- **Visual Progress Trackers**: Real-time spending progress bars displaying budget usage ratios.
- **Dynamic Heat Warnings**: 
  - 🟢 **Under 75%**: Safe zone.
  - 🟡 **75% - 100%**: Caution zone.
  - 🔴 **Over 100%**: Threshold breached warning.

### 2.3 Analytics & Interactive Visuals
- **Donut Chart**: Expense category distribution using cohesive Tailwind-themed palettes.
- **Monthly Trend Chart**: Double bar charts comparing target limits against actual expenditures per category.
- **Data Export/Import**: Full backup utility to download raw financial state in JSON, and restore previous states securely.
`
  },
  {
    id: 'prd-ux-design',
    title: '3. UX & Visual Identity',
    content: `### 3.1 Design Principles
The visual canvas emphasizes elegant negative space, cohesive typography, and professional color coding.

### 3.2 Visual Attributes
- **Typography**: Inter Sans-Serif font paired with JetBrains Mono for financial figures to ensure absolute readability and tabular alignment.
- **Color System**: Soft neutrals (gray-50/100 for backgrounds, deep slate-800 for headers) combined with vibrant semantic accents:
  - Income / Surplus: Emerald Green (emerald-500)
  - Balance / Target: Slate/Indigo (indigo-600)
  - Expense / Breaches: Rose/Red (rose-500)

### 3.3 Micro-interactions
- Framer Motion slide-overs and expanders for transaction entry modals.
- Interactive hover feedback on table rows and budget progress cards.
`
  },
  {
    id: 'prd-roadmap',
    title: '4. Future Product Roadmap',
    content: `### Phase 2: Multi-Device Sync
- Integration with Firebase Firestore database using the platform's \`firebase-integration\` capability for cloud persistence.
- OAuth user authentication for secure cross-device access.

### Phase 3: AI Financial Advisory
- Integration with the Gemini SDK (via \`@google/genai\`) to generate automated weekly spending insights, anomaly alerts, and recommendations to save money based on transaction history.

### Phase 4: Bank Account Aggregation
- Open-banking API integration to feed real-time transactions automatically into the ledger.
`
  }
];

export const AVAILABLE_CATEGORIES: CategoryInfo[] = [
  { name: 'Income', color: '#10b981', bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'TrendingUp' },
  { name: 'Food', color: '#f97316', bgColor: 'bg-orange-50 text-orange-700 border-orange-200', icon: 'Utensils' },
  { name: 'Rent & Living', color: '#6366f1', bgColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'Home' },
  { name: 'Transport', color: '#06b6d4', bgColor: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: 'Car' },
  { name: 'Utilities', color: '#eab308', bgColor: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: 'Zap' },
  { name: 'Entertainment', color: '#ec4899', bgColor: 'bg-pink-50 text-pink-700 border-pink-200', icon: 'Film' },
  { name: 'Shopping', color: '#a855f7', bgColor: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'ShoppingBag' },
  { name: 'Healthcare', color: '#ef4444', bgColor: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'HeartPulse' },
  { name: 'Education', color: '#3b82f6', bgColor: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'GraduationCap' },
  { name: 'Misc', color: '#64748b', bgColor: 'bg-slate-50 text-slate-700 border-slate-200', icon: 'HelpCircle' }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Monthly Salary Credit',
    amount: 5200,
    type: 'income',
    category: 'Income',
    date: '2026-06-01',
    notes: 'Primary employment monthly paycheck'
  },
  {
    id: 'tx-2',
    description: 'Luxury Apartment Rent',
    amount: 1800,
    type: 'expense',
    category: 'Rent & Living',
    date: '2026-06-02',
    notes: 'June rent and parking utility'
  },
  {
    id: 'tx-3',
    description: 'Weekly Organic Grocery',
    amount: 184.5,
    type: 'expense',
    category: 'Food',
    date: '2026-06-15',
    notes: 'Whole Foods organic grocery stock'
  },
  {
    id: 'tx-4',
    description: 'Cozy Sushi Dinner Date',
    amount: 112.4,
    type: 'expense',
    category: 'Food',
    date: '2026-06-18',
    notes: 'Premium sashimi and green tea'
  },
  {
    id: 'tx-5',
    description: 'Electric & Heating Bill',
    amount: 145,
    type: 'expense',
    category: 'Utilities',
    date: '2026-06-10',
    notes: 'Power grid summer utility billing'
  },
  {
    id: 'tx-6',
    description: 'Freelance Design Project',
    amount: 850,
    type: 'income',
    category: 'Income',
    date: '2026-06-20',
    notes: 'UI landing page design milestone'
  },
  {
    id: 'tx-7',
    description: 'Premium Audio Streaming',
    amount: 14.99,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-06-05',
    notes: 'Monthly hi-fi tier subscription'
  },
  {
    id: 'tx-8',
    description: 'Ergonomic Desk Chair',
    amount: 299,
    type: 'expense',
    category: 'Rent & Living',
    date: '2026-06-22',
    notes: 'Home office posture correction chair'
  },
  {
    id: 'tx-9',
    description: 'Eco Subway Commute Card',
    amount: 50,
    type: 'expense',
    category: 'Transport',
    date: '2026-06-03',
    notes: 'Monthly transit token refill'
  },
  {
    id: 'tx-10',
    description: 'Summer Wardrobe Outfits',
    amount: 210,
    type: 'expense',
    category: 'Shopping',
    date: '2026-06-12',
    notes: 'Linen shirts and lightweight trousers'
  }
];

export const INITIAL_BUDGET_LIMITS: BudgetLimit[] = [
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
