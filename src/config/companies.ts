import type { Company, TimeRange } from '../types/finance';

export const MAX_COMPETITORS = 4;

export const DEFAULT_COMPANIES: readonly Company[] = [
  { symbol: 'IBM', name: 'IBM' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'ORCL', name: 'Oracle' },
  { symbol: 'SAP', name: 'SAP' },
  { symbol: 'CRM', name: 'Salesforce' },
];

export const TIME_RANGES: readonly { id: TimeRange; label: string }[] = [
  { id: 'today', label: 'Current day' },
  { id: '7d', label: 'Last 7 days' },
  { id: 'quarter', label: 'Last quarter' },
];
