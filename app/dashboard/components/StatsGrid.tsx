'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { filterStockData, getStockStatus } from '../lib/utils';
import { useMemo } from 'react';
import { StockItem  } from '@/lib/snowflakeService';

interface StatsGridProps {
  items: StockItem[];
}

export function StatsGrid({ items }: StatsGridProps) {
  const searchParams = useSearchParams();

  const stats = useMemo(() => {
    const filters = {
      dateRange: searchParams.get('dateRange') || '7d',
      category: searchParams.get('category') || 'all',
      status: searchParams.get('status') || 'all',
      location: searchParams.get('location') || 'all',
      view: searchParams.get('view') || 'district',
    };

    const filtered = filterStockData(items, filters);

    // Metrics calculation
    const totalItems = filtered.length;
    const itemsAtRisk = filtered.filter(i => {
      const s = getStockStatus(i.quantity, 0); // Simplified status check if opening stock missing
      return s === 'critical' || s === 'low';
    }).length;

    // Calculate generic stock level for "Avg Days" proxy
    const avgDaysStock = useMemo(() => {
        if (totalItems === 0) return 0;
        
        let totalDays = 0;
        filtered.forEach(item => {
            // Heuristic: Estimate daily usage based on category
            let dailyUsage = 2; // Default
            const cat = (item.category || "").toLowerCase();
            if (cat.includes('medicine')) dailyUsage = 10;
            else if (cat.includes('ppe')) dailyUsage = 50;
            else if (cat.includes('device') || cat.includes('machine')) dailyUsage = 0.5;
            else if (cat.includes('consumable')) dailyUsage = 20;

            const days = item.quantity / dailyUsage;
            totalDays += days;
        });

        return Math.round(totalDays / totalItems);
    }, [filtered, totalItems]);

    const stockDiff = avgDaysStock - 30; // Compare to 30-day baseline
    const stockTrend = stockDiff > 0 ? `+${stockDiff} days` : `${stockDiff} days`;
    const stockTrendColor = stockDiff < 0 ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : 'text-green-600 bg-green-100 dark:bg-green-900/30';

    return {
      totalItems,
      itemsAtRisk,
      avgDaysStock,
      stockTrend,
      stockTrendColor
    };
  }, [searchParams, items]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Link href="/reports" className="group bg-white dark:bg-[#1f1e0b] p-5 rounded-3xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider group-hover:text-primary transition-colors">Total Items</span>
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-primary group-hover:text-black transition-colors">
             <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-display font-bold text-neutral-dark dark:text-white">{stats.totalItems.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">+5%</span>
        </div>
      </Link>

      <Link href="/alerts" className="group bg-white dark:bg-[#1f1e0b] p-5 rounded-3xl shadow-sm relative overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 block">
        <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider group-hover:text-orange-500 transition-colors">At Risk</span>
           <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
             <span className="material-symbols-outlined text-[18px]">warning</span>
          </div>
        </div>
        <div className="flex items-end justify-between relative z-10">
          <span className="text-3xl font-display font-bold text-neutral-dark dark:text-white">{stats.itemsAtRisk}</span>
          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg">+2 New</span>
        </div>
      </Link>

      <div className="bg-white dark:bg-[#1f1e0b] p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Stock Coverage</span>
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
             <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-display font-bold text-neutral-dark dark:text-white">{stats.avgDaysStock} <span className="text-sm font-medium text-neutral-400">Days</span></span>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${stats.stockTrendColor}`}>{stats.stockTrend}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1f1e0b] p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
         <div className="absolute right-0 bottom-0 w-20 h-20 bg-green-500/5 rounded-tl-[3rem] transition-transform hover:scale-110"></div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
             Saved Waste
             <span className="bg-blue-600 text-white text-[9px] px-1 rounded-md font-bold">AI</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
             <span className="material-symbols-outlined text-[18px]">savings</span>
          </div>
        </div>
        <div className="flex items-end justify-between relative z-10">
          <span className="text-3xl font-display font-bold text-neutral-dark dark:text-white">$45k</span>
          <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">+12%</span>
        </div>
      </div>
    </div>
  );
}

