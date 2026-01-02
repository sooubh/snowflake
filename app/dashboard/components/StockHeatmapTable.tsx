'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { filterStockData, getStockStatus } from '../lib/utils';
import { StockItem  } from '@/lib/snowflakeService';
import { useMemo } from 'react';
import { SIMULATED_USERS } from '@/lib/auth';

interface StockHeatmapTableProps {
    limit?: number;
    items: StockItem[];
}

export function StockHeatmapTable({ limit, items }: StockHeatmapTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { processedData, locations, hasMore } = useMemo(() => {
    const combinedData: StockItem[] = items;

    const getLocationName = (id: string) => SIMULATED_USERS.find(u => u.id === id)?.name || "Unknown Location";

    // Flatten logic: Map items to their location names for dynamic columns
    // If admin view, "Main Warehouse" default was blocking visibility.
    // Now we group by the retailer Name.
    
    let allLocations: string[] = Array.from(new Set(combinedData.map((i: StockItem) => getLocationName(i.ownerId)))).sort();

    const filters = {
      dateRange: searchParams.get('dateRange') || '7d',
      category: searchParams.get('category') || 'all',
      status: searchParams.get('status') || 'all',
      location: searchParams.get('location') || 'all',
      view: searchParams.get('view') || 'district',
    };

    // Note: Simple filterStockData might still assume "Main Warehouse", we need to pass the real location or update filter logic too.
    // Ideally we filter BEFORE pivoting, but filterStockData inside utils needs to know how to resolve location too.
    // For now, let's keep filterStockData as is for Category/Status, but re-implement Location filter here strictly if needed,
    // OR update utils.ts. Let's update utils.ts next.
    // For this step, let's assume filterStockData returns broadly valid items and we just pivot them correctly.
    
    // UPDATE: We must interpret filter matches on the expanded location name if we want location filter to work.

    // Pivot Data: Map<ItemName, Map<LocationName, StockItem>>
    const pivot = new Map<string, Map<string, StockItem>>();
    const itemDetails = new Map<string, { id: string, category: string, unit: string }>();

    // We iterate over ALL items first, then apply filters? 
    // Or apply filters then pivot?
    // filterStockData currently hardcodes location. We should fix it. 
    // But for this component's internal logic:

    const filtered = filterStockData(combinedData, filters); // This might accidentally filter out things if location filter is active and utils is broken.

    // If filter is 'all', it passes. 

    if (filters.location !== 'all') {
      allLocations = [filters.location];
    }

    filtered.forEach(item => {
      const locName = getLocationName(item.ownerId);
      
      // If location filter is set, we need to manually enforce it here if utils.ts isn't doing it right yet.
      if (filters.location !== 'all' && locName !== filters.location) return;

      const itemName = item.name;
      
      if (!pivot.has(itemName)) {
        pivot.set(itemName, new Map());
        itemDetails.set(itemName, { id: item.id, category: item.category, unit: "units" });
      }
      pivot.get(itemName)!.set(locName, item);
    });

    // Convert to array for rendering
    let rows = Array.from(pivot.entries()).map(([itemName, locMap]) => {
      let totalStock = 0;
      locMap.forEach(item => totalStock += item.quantity);
      return {
        itemName,
        details: itemDetails.get(itemName)!,
        locations: locMap,
        totalStock
      };
    });

    const hasMore = limit ? rows.length > limit : false;
    if (limit) {
        rows = rows.slice(0, limit);
    }

    return { processedData: rows, locations: allLocations, hasMore };
  }, [searchParams, items, limit]);

  return (
    <div className="bg-white dark:bg-[#1f1e0b] rounded-3xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
      <div className="p-6 flex items-center justify-between">
        <div className='flex items-center gap-3'>
            <div className="size-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-neutral-500">grid_view</span>
            </div>
            <div>
                <h3 className="font-bold text-lg text-neutral-dark dark:text-white leading-tight">Stock Health Heatmap</h3>
                <p className="text-xs text-neutral-400">Real-time inventory levels across region</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Healthy
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span> Low
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
          </div>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50/50 dark:bg-[#323118]/20 text-[10px] uppercase text-neutral-400 font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4 sticky left-0 z-10 bg-neutral-50/50 dark:bg-[#1f1e0b] backdrop-blur-md">Item Name</th>
              {locations.map(loc => (
                <th key={loc} className={`px-6 py-4 ${loc.includes("Azure") ? 'text-blue-500' : ''}`}>
                    {loc.includes("Azure") ? "My Stock (Live)" : loc}
                </th>
              ))}
              <th className="px-6 py-4 text-right">Total Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Expiry</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50 text-sm">
            {processedData.length > 0 ? (
              processedData.map((row) => (
                <tr key={row.itemName} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                  <td className="px-6 py-4 font-medium sticky left-0 z-10 bg-white dark:bg-[#1f1e0b] group-hover:bg-neutral-50/50 dark:group-hover:bg-[#1f1e0b] text-neutral-dark dark:text-white">
                    <Link href={`/item/${row.details.id}?section=${Array.from(row.locations.values())[0].section}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${row.details.category === 'Medicine' ? 'bg-blue-50 text-blue-600 dark:text-blue-400 dark:bg-blue-900/10' :
                        row.details.category === 'Supplies' ? 'bg-orange-50 text-orange-600 dark:text-orange-400 dark:bg-orange-900/10' :
                          'bg-purple-50 text-purple-600 dark:text-purple-400 dark:bg-purple-900/10'
                        }`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {row.details.category === 'Medicine' ? 'pill' :
                            row.details.category === 'Supplies' ? 'inventory_2' : 'category'}
                        </span>
                      </div>
                      <span className="font-bold">{row.itemName}</span>
                    </Link>
                  </td>

                  {locations.map(loc => {
                    const item = row.locations.get(loc);
                    if (!item) {
                      return (
                        <td key={loc} className="px-6 py-4">
                          <span className="w-2 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full block mx-auto"></span>
                        </td>
                      );
                    }

                      const status = getStockStatus(item.quantity, 0);

                    return (
                      <td key={loc} className="px-6 py-4">
                        {status === 'critical' ? (
                          <div className="w-12 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center justify-center font-bold text-xs cursor-pointer ring-1 ring-inset ring-red-500/10 mx-auto transition-transform hover:scale-110" title={`Stock: ${item.quantity}`}>
                            {item.quantity}
                          </div>
                        ) : status === 'low' ? (
                          <div className="w-12 h-8 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 flex items-center justify-center font-bold text-xs cursor-pointer ring-1 ring-inset ring-orange-500/10 mx-auto transition-transform hover:scale-110" title={`Stock: ${item.quantity}`}>
                            {item.quantity}
                          </div>
                        ) : (
                          <div className="w-12 h-8 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 flex items-center justify-center font-bold text-xs cursor-pointer ring-1 ring-inset ring-green-500/10 mx-auto transition-transform hover:scale-110" title={`Stock: ${item.quantity}`}>
                            {item.quantity}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  <td className="px-6 py-4 text-right font-mono font-bold text-neutral-600 dark:text-neutral-400">{row.totalStock} <span className="text-[10px] text-neutral-400 font-normal">{row.details.unit}</span></td>

                  {/* Status Column */}
                  <td className="px-6 py-4">
                     {(() => {
                        const status = getStockStatus(row.totalStock, 0); // Logic from utils
                        if (status === 'critical') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50">Critical</span>;
                        if (status === 'low') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50">Low Stock</span>;
                        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50">Healthy</span>;
                     })()}
                  </td>

                  {/* Expiry Column */}
                  <td className="px-6 py-4">
                     {(() => {
                        const item = Array.from(row.locations.values())[0];
                        if (!item?.expiryDate) return <span className="text-neutral-300 text-xs text-center block">-</span>;
                        
                        const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        if (daysLeft < 0) return <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ring-red-500/10">Expired</span>;
                        if (daysLeft < 30) return <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md text-[10px] font-bold ring-1 ring-inset ring-orange-500/10">{daysLeft} days</span>;
                        return <span className="text-neutral-500 text-xs font-medium">{new Date(item.expiryDate).toLocaleDateString()}</span>;
                     })()}
                  </td>

                  <td className="px-6 py-4 text-sm text-neutral-400 font-medium">
                    {row.locations.size > 0 
                        ? new Date(Array.from(row.locations.values())[0].lastUpdated || Date.now()).toLocaleDateString() 
                        : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                          <button 
                              onClick={async () => {
                                  try {
                                      const firstItem = Array.from(row.locations.values())[0];
                                      if (!firstItem) {
                                          alert("No item data available");
                                          return;
                                      }
                                      
                                      if (firstItem.quantity < 1) {
                                          alert("Insufficient stock to sell");
                                          return;
                                      }
                                      
                                      const res = await fetch('/api/items/sell', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ 
                                              items: [{
                                                  itemId: row.details.id,
                                                  quantity: 1,
                                                  price: firstItem.price || 0
                                              }],
                                              section: firstItem.section
                                          })
                                      });
                                      
                                      if (res.ok) {
                                          alert("Item sold successfully!");
                                          window.location.reload();
                                      } else {
                                          const error = await res.json();
                                          alert(`Failed to sell item: ${error.error || 'Unknown error'}`);
                                      }
                                  } catch (e) {
                                      console.error(e);
                                      alert("Error selling item. Please try again.");
                                  }
                              }}
                              className="size-8 flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-600" 
                              title="Sell 1 Unit"
                          >
                            <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                          </button>
                          <Link href={`/dashboard/inventory/edit/${row.details.id}`} className="size-8 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-blue-500" title="Edit Item">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <button 
                              onClick={async () => {
                                  if(confirm("Are you sure you want to delete this item?")) {
                                      await fetch(`/api/items/${row.details.id}`, { method: 'DELETE' });
                                      router.refresh();
                                      window.location.reload(); 
                                  }
                              }}
                              className="size-8 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-neutral-400 hover:text-red-500" 
                              title="Delete Item"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                      </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={locations.length + 2} className="px-6 py-12 text-center text-neutral-500">
                  <div className="flex flex-col items-center gap-2">
                       <span className="material-symbols-outlined text-4xl text-neutral-300">search_off</span>
                       <p>No items match the current filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="p-4 border-t border-neutral-50 dark:border-neutral-800 flex justify-center bg-neutral-50/30 dark:bg-black/10">
            <Link href="/stocks" className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#323118] border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 rounded-2xl text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-primary hover:shadow-lg transition-all">
                <span>View Full Inventory</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
        </div>
      )}
    </div>
  );
}
