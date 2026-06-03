import { StockCategory } from '@prisma/client';

export const ALLOCATION_BY_RISK: Record<
  string,
  Record<StockCategory, number>
> = {
  beginner: { large: 0.6, mid: 0.3, small: 0.1 },
  moderate: { large: 0.4, mid: 0.4, small: 0.2 },
  aggressive: { large: 0.3, mid: 0.3, small: 0.4 },
};

export const PREDEFINED_STOCKS: Record<
  StockCategory,
  { symbol: string; name: string }[]
> = {
  large: [
    { symbol: 'RELIANCE', name: 'Reliance Industries' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
  ],
  mid: [
    { symbol: 'DIXON', name: 'Dixon Technologies' },
    { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite' },
  ],
  small: [
    { symbol: 'IDEA', name: 'Vodafone Idea' },
    { symbol: 'SUZLON', name: 'Suzlon Energy' },
  ],
};
