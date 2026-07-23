export interface Transaction {
  date: string;
  description: string;
  merchantName: string;
  amount: number;
  category: string;
}

export interface CategorySummary {
  name: string;
  amount: number;
}

export interface Subscription {
  name: string;
  merchantName: string;
  amount: number;
  frequency: string;
  suggestion: string;
}

export interface AnalysisData {
  currency: string;
  transactions: Transaction[];
  summary: {
    totalSpent: number;
    topCategories: CategorySummary[];
  };
  insights: string[];
  subscriptions: Subscription[];
}
