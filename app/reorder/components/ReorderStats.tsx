'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { StockItem  } from '@/lib/snowflakeService';

interface ReorderStatsProps {
    items: StockItem[];
}

export function ReorderStats({ items }: ReorderStatsProps) {
  const searchParams = useSearchParams();

  const stats = useMemo(() => {
    // Determine status based on minQuantity
    const atRiskItems = items.filter(item => {
        const minQty = item.minQuantity || 20;
        return item.quantity <= (minQty * 1.5); // Low or Critical
    });

    const atRisk = atRiskItems.length;

    // Calculate value of needed stock (Targeting ~100 units or 3*minQty as 'safe' level)
    // Simplified: Cost to bring everything up to 100
    const totalValue = atRiskItems.reduce((acc, item) => {
      const target = 100; // Mock Max Capacity
      const missing = Math.max(0, target - item.quantity);
      return acc + (missing * item.price);
    }, 0);

    return { atRisk, totalValue };
  }, [items]);

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-neutral-dark dark:text-white">Reorder & Priority Recommendations</h1>
        <p className="text-neutral-500 text-base flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">schedule</span>
          Last updated: Today, 09:41 AM
        </p>
      </div>
      {/* Key Metrics Cards - Now Properly Aligned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#23220f] rounded-xl p-4 border border-neutral-100 dark:border-neutral-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-neutral-500 text-sm font-medium">Items at Risk</p>
            <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
          </div>
          <p className="text-3xl font-bold text-neutral-dark dark:text-white">{stats.atRisk}</p>
          <p className="text-xs text-red-600 font-medium mt-1">Requiring immediate action</p>
        </div>
        <div className="bg-white dark:bg-[#23220f] rounded-xl p-4 border border-neutral-100 dark:border-neutral-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-neutral-500 text-sm font-medium">Est. Value</p>
            <span className="material-symbols-outlined text-neutral-500 text-xl">payments</span>
          </div>
          <p className="text-3xl font-bold text-neutral-dark dark:text-white">${stats.totalValue.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-1">Potential replenishment cost</p>
        </div>
      </div>
    </div>
  );
}

