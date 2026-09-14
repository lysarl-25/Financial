import type { Category } from '@/types'

export const categories: Category[] = [
  // Income categories
  { id: 'cat-inc-salary', name: 'Salary', type: 'income', icon: 'Wallet', color: '#0f9d70' },
  { id: 'cat-inc-freelance', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#2e5b54' },
  { id: 'cat-inc-business', name: 'Business', type: 'income', icon: 'Briefcase', color: '#3f716a' },
  { id: 'cat-inc-investment', name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#0b7a58' },
  { id: 'cat-inc-bonus', name: 'Bonus', type: 'income', icon: 'Gift', color: '#5f8f85' },
  { id: 'cat-inc-other', name: 'Other', type: 'income', icon: 'CircleDollarSign', color: '#8fb4ac' },

  // Expense categories
  { id: 'cat-exp-food', name: 'Food', type: 'expense', icon: 'UtensilsCrossed', color: '#e0603f' },
  { id: 'cat-exp-transport', name: 'Transportation', type: 'expense', icon: 'Car', color: '#2563eb' },
  { id: 'cat-exp-shopping', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'cat-exp-bills', name: 'Bills', type: 'expense', icon: 'Receipt', color: '#8b5cf6' },
  { id: 'cat-exp-entertainment', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#f59e0b' },
  { id: 'cat-exp-health', name: 'Health', type: 'expense', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'cat-exp-education', name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#14b8a6' },
  { id: 'cat-exp-rent', name: 'Rent', type: 'expense', icon: 'Home', color: '#92400e' },
  { id: 'cat-exp-travel', name: 'Travel', type: 'expense', icon: 'Plane', color: '#06b6d4' },
  { id: 'cat-exp-other', name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#6b7280' },
]
