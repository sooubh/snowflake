"use client";

import { useState, useEffect } from 'react';
import { UserProfile, SIMULATED_USERS } from '@/lib/auth';
import { SystemStore } from '@/lib/azureDefaults';

interface StoreSelectorProps {
    currentUser: UserProfile | null;
    selectedStoreId: string | 'all';
    onStoreChange: (storeId: string | 'all') => void;
    availableStores: SystemStore[];
}

export function StoreSelector({ currentUser, selectedStoreId, onStoreChange, availableStores }: StoreSelectorProps) {
    if (!currentUser) return null;

    // Retailers see locked badge with their store name
    if (currentUser.role === 'retailer') {
        const userStore = availableStores.find(s => s.section === currentUser.section);
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <span className="material-symbols-outlined text-neutral-500 text-sm">store</span>
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    {currentUser.name}
                </span>
                <span className="material-symbols-outlined text-neutral-400 text-sm">lock</span>
            </div>
        );
    }

    // Admins see dropdown with all their section's stores
    const selectedStore = availableStores.find(s => s.id === selectedStoreId);

    return (
        <div className="relative">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Select Store
            </label>
            <div className="relative">
                <select
                    value={selectedStoreId}
                    onChange={(e) => onStoreChange(e.target.value)}
                    className="appearance-none w-full px-4 py-3 pr-10 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                    <option value="all">📊 All Stores (Aggregated)</option>
                    {availableStores.map(store => (
                        <option key={store.id} value={store.id}>
                            🏪 {store.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="material-symbols-outlined text-neutral-400">expand_more</span>
                </div>
            </div>
            {selectedStoreId !== 'all' && selectedStore && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        <span className="font-bold">Viewing:</span> {selectedStore.name} in {selectedStore.section}
                    </p>
                </div>
            )}
        </div>
    );
}
