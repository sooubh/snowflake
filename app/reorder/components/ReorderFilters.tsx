'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export function ReorderFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Update search param with debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchValue) {
                params.set('search', searchValue);
            } else {
                params.delete('search');
            }
            router.push(`${pathname}?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, pathname, router, searchParams]);

    const toggleFilter = useCallback((key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const currentValue = params.get(key) === 'true';

        if (currentValue) {
            params.delete(key);
        } else {
            params.set(key, 'true');
        }

        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const filters = [
        { key: 'criticalOnly', label: 'Critical Only', icon: 'warning' },
        { key: 'lowLeadTime', label: 'Low Lead Time', icon: 'speed' },
        { key: 'lifeSaving', label: 'Life Saving', icon: 'medical_services' },
    ];

    const activeFilterCount = filters.filter(f => searchParams.get(f.key) === 'true').length;

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            {/* Search Bar - Left Corner */}
            <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-neutral-400 group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search by item name or SKU..."
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#23220f] border border-neutral-100 dark:border-neutral-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-neutral-400 text-sm"
                />
            </div>

            {/* Unified Filter Bar - Right Corner */}
            <div className="relative flex items-center gap-2">
                <div className="relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${isFilterOpen || activeFilterCount > 0
                            ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20'
                            : 'bg-white dark:bg-[#23220f] border-neutral-100 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">tune</span>
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="flex items-center justify-center size-5 rounded-full bg-black text-white text-[10px] font-black leading-none ml-1">
                                {activeFilterCount}
                            </span>
                        )}
                        <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isFilterOpen && (
                        <>
                            {/* Overlay to close dropdown */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsFilterOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a190b] border border-neutral-100 dark:border-neutral-700 rounded-2xl shadow-2xl p-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-50 dark:border-neutral-800/50 mb-1">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Select Criteria</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams.toString());
                                                filters.forEach(f => params.delete(f.key));
                                                router.push(`${pathname}?${params.toString()}`);
                                            }}
                                            className="text-[10px] uppercase tracking-wider font-bold text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                {filters.map((filter) => {
                                    const isActive = searchParams.get(filter.key) === 'true';
                                    return (
                                        <button
                                            key={filter.key}
                                            onClick={() => {
                                                toggleFilter(filter.key);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`material-symbols-outlined text-lg ${isActive ? 'text-primary' : 'text-neutral-400'}`}>
                                                    {filter.icon}
                                                </span>
                                                {filter.label}
                                            </div>
                                            <div className={`size-4 rounded border transition-colors flex items-center justify-center ${isActive ? 'bg-primary border-primary' : 'border-neutral-300 dark:border-neutral-600'
                                                }`}>
                                                {isActive && <span className="material-symbols-outlined text-[10px] text-black font-black">check</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
