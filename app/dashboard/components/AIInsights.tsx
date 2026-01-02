import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Sparkles } from 'lucide-react';

export function AIInsights() {
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <CardTitle className="text-indigo-900">AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="text-sm text-slate-700 bg-white p-3 rounded-md shadow-sm border border-indigo-50">
            <span className="font-semibold text-indigo-700">Predictive Alert:</span> Consumption of <strong>Paracetamol</strong> in Central Store is trending 15% higher this week. Risk of stock-out in 2 days.
          </li>
          <li className="text-sm text-slate-700 bg-white p-3 rounded-md shadow-sm border border-indigo-50">
             <span className="font-semibold text-indigo-700">Optimization:</span> Reduce waste by redistributing <strong>Surgical Masks</strong> from North Clinic to Rural Outpost.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
