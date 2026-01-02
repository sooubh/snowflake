import { Card, CardContent } from '@/components/Card';
import { ArrowUp, AlertCircle, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import sampleData from '@/data/sampleStockData.json';
import { calculateDaysLeft, getRiskLevel } from '@/lib/ai/riskScoring';

export function KPIStats() {
  const totalItems = sampleData.length;

  let criticalCount = 0;
  let warningCount = 0;
  let healthyCount = 0;

  sampleData.forEach(item => {
    const daysLeft = calculateDaysLeft(item.closing_stock, item.avg_daily_issue);
    const risk = getRiskLevel(daysLeft);
    if (risk === 'Critical') criticalCount++;
    else if (risk === 'Warning') warningCount++;
    else healthyCount++;
  });

  const healthScore = Math.round((healthyCount / totalItems) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white dark:bg-[#1f1e0b] border-slate-200 dark:border-neutral-800">
        <CardContent className="flex items-center p-6">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Health</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{healthScore}%</h3>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
              <ArrowUp className="h-3 w-3 mr-1" /> +2% vs last week
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#1f1e0b] border-slate-200 dark:border-neutral-800">
        <CardContent className="flex items-center p-6">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Critical Alerts</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{criticalCount}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Items &le; 3 days stock</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#1f1e0b] border-slate-200 dark:border-neutral-800">
        <CardContent className="flex items-center p-6">
          <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mr-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Warnings</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{warningCount}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Items &le; 7 days stock</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#1f1e0b] border-slate-200 dark:border-neutral-800">
        <CardContent className="flex items-center p-6">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-4">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Items</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{totalItems}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Active SKUs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
