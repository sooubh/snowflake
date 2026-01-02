'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StockItem  } from '@/lib/snowflakeService';
import { SIMULATED_USERS } from '@/lib/auth'; // To resolve ownerId to Name

interface AlertsSidebarProps {
    alerts?: StockItem[];
}

export function AlertsSidebar({ alerts = [] }: AlertsSidebarProps) {
  const [showAll, setShowAll] = useState(false);
  const getLocationName = (id: string) => SIMULATED_USERS.find(u => u.id === id)?.name || "Unknown Store";

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);
  const hiddenCount = alerts.length - 3;

  return (
    <div className="w-full lg:w-[360px] flex flex-col gap-6 shrink-0">
      
      {/* Urgent Action Sidebar */}
      <div className="bg-white dark:bg-[#1f1e0b] rounded-3xl p-5 shadow-sm border border-transparent dark:border-neutral-800 flex-1">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-neutral-dark dark:text-white">Critical Alerts</h3>
            {alerts.length > 0 && <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>}
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            {alerts.length} Issues
          </span>
        </div>

        <div className="space-y-3">
            {displayedAlerts.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-sm bg-neutral-50 dark:bg-white/5 rounded-2xl">
                    <span className="material-symbols-outlined text-3xl mb-2 text-green-500">check_circle</span>
                    <p>All stats are healthy.</p>
                </div>
            ) : (
                displayedAlerts.map(item => (
                    <div key={item.id} className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 group hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">error</span>
                        <div className="w-full">
                            <h4 className="text-sm font-bold text-neutral-dark dark:text-white mb-1">
                                {item.quantity === 0 ? "Stock Depleted" : "Low Stock"}
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">
                                <span className="font-bold">{item.name}</span> is down to <span className="font-mono font-bold text-red-600">{item.quantity} {item.unit}</span> at {getLocationName(item.ownerId)}.
                            </p>
                            <Link 
                                href={`/dashboard/stores/${getLocationName(item.ownerId)}`} // Direct to store management
                                className="block w-full text-center py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                            >
                                Restock Immediately
                            </Link>
                        </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {alerts.length > 3 && (
            <button 
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-4 py-2 text-center text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
                {showAll ? (
                    <>
                        <span>Show Less</span>
                        <span className="material-symbols-outlined text-[16px]">expand_less</span>
                    </>
                ) : (
                    <>
                        <span>View {hiddenCount} More Alerts</span>
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                    </>
                )}
            </button>
        )}
      </div>
    </div>
  );
}
