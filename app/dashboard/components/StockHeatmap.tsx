import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import sampleData from '@/data/sampleStockData.json';
import { calculateDaysLeft, getRiskLevel, getRiskColor } from '@/lib/ai/riskScoring';
import Link from 'next/link';

export function StockHeatmap() {
  // Group by location for visualization
  const locationGroups: Record<string, typeof sampleData> = {};
  
  sampleData.forEach(item => {
    if (!locationGroups[item.location_name]) {
      locationGroups[item.location_name] = [];
    }
    locationGroups[item.location_name].push(item);
  });

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Stock Health Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(locationGroups).map(([location, items]) => (
            <div key={location}>
              <h4 className="text-sm font-medium text-slate-600 mb-3">{location}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {items.map(item => {
                  const daysLeft = calculateDaysLeft(item.closing_stock, item.avg_daily_issue);
                  const risk = getRiskLevel(daysLeft);
                  const colorClass = getRiskColor(risk);
                  
                  return (
                    <Link key={item.item_id} href={`/item/${item.item_id}`}>
                      <div className={`p-3 rounded-lg border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${colorClass.replace('text-white', 'bg-opacity-90 text-white')}`}>
                        <div className="text-xs font-semibold truncate" title={item.item_name}>{item.item_name}</div>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-xs opacity-90">{daysLeft} days</span>
                          <span className="text-xs font-bold">{item.closing_stock}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
