export type StockRisk = 'Critical' | 'Warning' | 'Healthy';

export interface StockItem {
  item_id: string;
  item_name: string;
  closing_stock: number;
  avg_daily_issue: number;
  lead_time_days: number;
  [key: string]: unknown;
}

export function calculateDaysLeft(stock: number, avgDailyIssue: number): number {
  if (avgDailyIssue <= 0) return 999; // Infinite if no usage
  return Math.floor(stock / avgDailyIssue);
}

export function getRiskLevel(daysLeft: number): StockRisk {
  if (daysLeft <= 3) return 'Critical';
  if (daysLeft <= 7) return 'Warning';
  return 'Healthy';
}

export function getRiskColor(risk: StockRisk): string {
  switch (risk) {
    case 'Critical': return 'bg-red-500 text-white';
    case 'Warning': return 'bg-amber-500 text-white';
    case 'Healthy': return 'bg-emerald-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}
