import { Category } from './types';

export const CATEGORIES: Record<
  Category,
  { color: string; textColor: string; bgLight: string; icon: string }
> = {
  Food: {
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgLight: 'bg-orange-50',
    icon: '🍕',
  },
  Transportation: {
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50',
    icon: '🚗',
  },
  Entertainment: {
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgLight: 'bg-purple-50',
    icon: '🎬',
  },
  Shopping: {
    color: 'bg-pink-500',
    textColor: 'text-pink-600',
    bgLight: 'bg-pink-50',
    icon: '🛍️',
  },
  Bills: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgLight: 'bg-red-50',
    icon: '📄',
  },
  Health: {
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgLight: 'bg-green-50',
    icon: '🏥',
  },
  Other: {
    color: 'bg-gray-500',
    textColor: 'text-gray-600',
    bgLight: 'bg-gray-50',
    icon: '📦',
  },
};

export const CATEGORY_LIST: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Health',
  'Other',
];
