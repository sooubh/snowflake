import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { ShoppingCart, Send, FilePlus, Download } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Link href="/reorder" className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
          <ShoppingCart className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Create Order</span>
        </Link>
        <button className="flex flex-col items-center justify-center p-4 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
          <Send className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Send Alert</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
          <FilePlus className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Log Stock</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
          <Download className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Export Report</span>
        </button>
      </CardContent>
    </Card>
  );
}
