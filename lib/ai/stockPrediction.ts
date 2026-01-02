import { StockItem } from './riskScoring';

export function predictStockDepletion(currentStock: number, avgDailyIssue: number, days: number): number[] {
    const predictions: number[] = [];
    let stock = currentStock;
    for (let i = 0; i < days; i++) {
        stock = Math.max(0, stock - avgDailyIssue);
        predictions.push(stock);
    }
    return predictions;
}

export function calculateReorderQuantity(item: StockItem): number {
    // Recommended order = (Avg Daily Issue * Lead Time) - Current Stock + Safety Stock (Buffer)
    // Simple buffer: 2 days of stock
    const safetyStock = item.avg_daily_issue * 2;
    const demandDuringLeadTime = item.avg_daily_issue * item.lead_time_days;

    const targetStock = demandDuringLeadTime + safetyStock;
    const quantityNeeded = targetStock - item.closing_stock;

    return Math.max(0, Math.ceil(quantityNeeded));
}
