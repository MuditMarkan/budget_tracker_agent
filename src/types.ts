export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string;
}

export interface BudgetLimit {
  category: string;
  limit: number;
}

export interface PRDSection {
  id: string;
  title: string;
  content: string;
}

export interface CategoryInfo {
  name: string;
  color: string;
  icon: string;
  bgColor: string;
}
