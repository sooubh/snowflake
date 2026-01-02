'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Filter, X, Check, ChevronDown, Calendar, Tag, Activity, MapPin } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
export function FilterPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [filters, setFilters] = useState({
        dateRange: searchParams.get('dateRange') || '7d',
        category: searchParams.get('category') || 'all',
        status: searchParams.get('status') || 'all',
        location: searchParams.get('location') || 'all',
    });

    const options = {
        locations: ["PSD", "Hospital", "NGO"],
        categories: ["General", "PPE", "Medication", "Equipment", "Supplies"]
    };

    // Sync state with URL params when they change externally (e.g. back button)
    useEffect(() => {
        setFilters({
            dateRange: searchParams.get('dateRange') || '7d',
            category: searchParams.get('category') || 'all',
            status: searchParams.get('status') || 'all',
            location: searchParams.get('location') || 'all',
        });
    }, [searchParams]);

    const updateFilters = useCallback((newFilters: typeof filters) => {
        setFilters(newFilters);

        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const handleReset = () => {
        const defaultFilters = {
            dateRange: '7d',
            category: 'all',
            status: 'all',
            location: 'all'
        };
        updateFilters(defaultFilters);
        // setIsOpen(false); // Optional: close on reset
    };

    const activeFilterCount = Object.values(filters).filter(v => v !== 'all' && v !== '7d').length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors shadow-sm hover:shadow active:scale-95 ${isOpen || activeFilterCount > 0
                    ? 'bg-primary/10 border-primary text-primary-dark dark:text-primary'
                    : 'bg-white dark:bg-[#2a2912] border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-[#323118]'
                    }`}
            >
                <Filter className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold text-white bg-primary rounded-full">
                        {activeFilterCount}
                    </span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#2a2912] rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Filter Dashboard</h3>
                        <button
                            onClick={handleReset}
                            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
                        >
                            Reset all
                        </button>
                    </div>

                    <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        {/* Date Range */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Date Range
                            </label>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => updateFilters({ ...filters, dateRange: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border-none text-sm focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 3 Months</option>
                                <option value="ytd">Year to Date</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" /> Category
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['all', ...options.categories].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => updateFilters({ ...filters, category: cat })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filters.category === cat
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                            }`}
                                    >
                                        {cat === 'all' ? 'All' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> Status
                            </label>
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={filters.status === 'all'}
                                        onChange={() => updateFilters({ ...filters, status: 'all' })}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">All Statuses</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={filters.status === 'critical'}
                                        onChange={() => updateFilters({ ...filters, status: 'critical' })}
                                        className="text-red-500 focus:ring-red-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        <span className="text-sm">Critical Only</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={filters.status === 'low'}
                                        onChange={() => updateFilters({ ...filters, status: 'low' })}
                                        className="text-yellow-500 focus:ring-yellow-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                        <span className="text-sm">Low Stock</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={filters.status === 'good'}
                                        onChange={() => updateFilters({ ...filters, status: 'good' })}
                                        className="text-green-500 focus:ring-green-500"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-sm">Good Stock</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> Location
                            </label>
                            <select
                                value={filters.location}
                                onChange={(e) => updateFilters({ ...filters, location: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border-none text-sm focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">All Locations</option>
                                {options.locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="p-3 bg-neutral-50 dark:bg-[#323118] text-center">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
