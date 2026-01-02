"use client";

import { useMemo } from 'react';
import { StockItem  } from '@/lib/snowflakeService';
import { SIMULATED_USERS } from '@/lib/auth';
import { getStockStatus } from '../lib/utils';
import Link from 'next/link';

interface StoreHealthOverviewProps {
    items: StockItem[];
}

export function StoreHealthOverview({ items }: StoreHealthOverviewProps) {
    const storeStats = useMemo(() => {
        // Group by Store (OwnerId)
        const groups = new Map<string, { name: string, totalItems: number, critical: number, low: number, items: StockItem[] }>();

        // Init with all known stores in this section? 
        // For now, based on items.
        // We really should use `SIMULATED_USERS` or a fetched store list to show stores even with 0 items.
        // But let's stick to what we have in `items` for safety, or cross reference `SIMULATED_USERS`.
        
        // Let's iterate simulated users to get all Potential stores in this section?
        // Simulating "fetching all stores"
        const relevantStores = SIMULATED_USERS.filter(u => items.some(i => i.ownerId === u.id) || u.role === 'retailer'); 
        // This logic is a bit fuzzy without server side store list passed down.
        // Let's just group `items`.
        
        items.forEach(item => {
            if (!groups.has(item.ownerId)) {
                // Find Name
                const user = SIMULATED_USERS.find(u => u.id === item.ownerId);
                groups.set(item.ownerId, {
                    name: user?.name || "Unknown Store",
                    totalItems: 0,
                    critical: 0,
                    low: 0,
                    items: []
                });
            }
            
            const stats = groups.get(item.ownerId)!;
            stats.totalItems++;
            stats.items.push(item);
            
            const status = getStockStatus(item.quantity, 0);
            if (status === 'critical') stats.critical++;
            else if (status === 'low') stats.low++;
        });

        return Array.from(groups.values());
    }, [items]);

    return (
        <div className="bg-white dark:bg-[#1f1e0b] rounded-3xl shadow-sm p-6">
            <h3 className="font-bold text-lg text-neutral-dark dark:text-white mb-4">Plant/Store Health Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeStats.map(store => (
                    <div key={store.name} className="p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-neutral-dark dark:text-white">{store.name}</h4>
                                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">{store.totalItems} Items</p>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                store.critical > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                store.low > 0 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                                'bg-green-100 text-green-600 dark:bg-green-900/30'
                            }`}>
                                {store.critical > 0 ? 'Critical' : store.low > 0 ? 'Warning' : 'Healthy'}
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                            {store.critical > 0 && (
                                <div className="flex-1 bg-red-50 dark:bg-red-900/10 rounded-lg p-2 text-center">
                                    <span className="block text-xl font-bold text-red-600 dark:text-red-400">{store.critical}</span>
                                    <span className="text-[10px] text-red-400 uppercase font-bold">Crit</span>
                                </div>
                            )}
                            {store.low > 0 && (
                                <div className="flex-1 bg-orange-50 dark:bg-orange-900/10 rounded-lg p-2 text-center">
                                    <span className="block text-xl font-bold text-orange-600 dark:text-orange-400">{store.low}</span>
                                    <span className="text-[10px] text-orange-400 uppercase font-bold">Low</span>
                                </div>
                            )}
                             <div className="flex-1 bg-neutral-100 dark:bg-white/5 rounded-lg p-2 text-center">
                                <span className="block text-xl font-bold text-neutral-600 dark:text-neutral-400">{store.totalItems - store.critical - store.low}</span>
                                <span className="text-[10px] text-neutral-400 uppercase font-bold">OK</span>
                            </div>
                        </div>

                        <Link 
                            href={`/dashboard/stores/${store.name}`}
                            className="block w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-center text-white rounded-lg font-bold text-xs shadow-md transition-colors"
                        >
                            Manage Stock
                        </Link>
                    </div>
                ))}
                {storeStats.length === 0 && (
                    <div className="col-span-3 text-center py-10 text-neutral-400">
                        No stores data available.
                    </div>
                )}
            </div>
        </div>
    );
}
