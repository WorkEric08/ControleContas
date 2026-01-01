export interface BillItem {
  id: string;
  text: string;
  value: number;
  isPaid: boolean;
  isLocked: boolean;
  createdAt: number;
  dueDate?: string; // Formato YYYY-MM-DD
}

export interface BillCategory {
  id: string;
  name: string;
  items: BillItem[];
  budget?: number;
  type: 'expense' | 'goal';
}

export interface MonthData {
  [monthKey: string]: BillCategory[]; // Chave no formato "YYYY-MM"
}

export interface UserProfile {
  name: string;
  username: string;
  age: string;
  avatar: string;
}