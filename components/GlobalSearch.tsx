'use client';

import { useState, useEffect, useRef } from 'react';
import { StockItem } from '@/lib/azureDefaults';
import { useRouter } from 'next/navigation';
import { SIMULATED_USERS, UserProfile } from '@/lib/auth';

interface SearchResult {
    results: StockItem[];
    count: number;
    total: number;
    query: string;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [selectedSection, setSelectedSection] = useState('all');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Get current user on mount
    useEffect(() => {
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        };
        const userId = getCookie('simulated_user_id');
        if (userId) {
            const user = SIMULATED_USERS.find(u => u.id === userId);
            if (user) {
                setCurrentUser(user);
                // Set initial section to user's section
                setSelectedSection(user.section);
            }
        }
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults(null);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&section=${selectedSection}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, selectedSection]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    const handleItemClick = (item: StockItem) => {
        router.push(`/item/${item.id}?section=${item.section}`);
        onClose();
    };

    const groupedResults = results?.results.reduce((acc, item) => {
        if (!acc[item.section]) {
            acc[item.section] = [];
        }
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, StockItem[]>) || {};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="bg-white dark:bg-[#1f1e0b] w-full max-w-3xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 mt-20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-neutral-400 text-xl">search</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search stocks by name, SKU, or category..."
                            className="w-full pl-12 pr-12 py-4 bg-transparent text-lg font-medium text-neutral-dark dark:text-white placeholder-neutral-400 focus:outline-none"
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Section filter - Only show user's section, no cross-section access */}
                    {currentUser && (
                        <div className="flex gap-2 mt-3 items-center">
                            <span className="text-xs text-neutral-500 font-medium">Searching in:</span>
                            <div className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-black">
                                {currentUser.section}
                            </div>
                            <span className="text-xs text-neutral-400">({currentUser.role})</span>
                        </div>
                    )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading && (
                        <div className="p-12 text-center text-neutral-500">
                            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                            <p className="mt-2">Searching...</p>
                        </div>
                    )}

                    {!isLoading && query.length < 2 && (
                        <div className="p-12 text-center text-neutral-500">
                            <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                            <p className="font-bold">Start typing to search stocks</p>
                            <p className="text-sm mt-1">Search by name, SKU, category, or section</p>
                        </div>
                    )}

                    {!isLoading && query.length >= 2 && results && results.count === 0 && (
                        <div className="p-12 text-center text-neutral-500">
                            <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                            <p className="font-bold">No results found for "{query}"</p>
                            <p className="text-sm mt-1">Try a different search term or check spelling</p>
                        </div>
                    )}

                    {!isLoading && results && results.count > 0 && (
                        <div className="p-2">
                            {Object.entries(groupedResults).map(([section, items]) => (
                                <div key={section} className="mb-4">
                                    <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                        {section} ({items.length})
                                    </div>
                                    <div className="space-y-1">
                                        {items.map((item) => (
                                            <button
                                                key={`${item.id}-${item.section}`}
                                                onClick={() => handleItemClick(item)}
                                                className="w-full p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors text-left group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-10 rounded-lg flex items-center justify-center ${
                                                        item.category === 'Medicine' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                                        item.category === 'Supplies' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                                                        'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                                    }`}>
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            {item.category === 'Medicine' ? 'pill' : 'inventory_2'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-neutral-dark dark:text-white group-hover:text-primary transition-colors truncate">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 flex items-center gap-2">
                                                            <span className="font-mono">{item.id}</span>
                                                            <span>•</span>
                                                            <span>{item.category}</span>
                                                            <span>•</span>
                                                            <span className={item.quantity <= 10 ? 'text-red-600 font-bold' : ''}>
                                                                {item.quantity} units
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        item.status === 'Out of Stock' ? 'bg-red-100 text-red-700' :
                                                        item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {results && results.total > results.count && (
                    <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-black/20 text-center text-xs text-neutral-500">
                        Showing {results.count} of {results.total} results
                    </div>
                )}
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-black/20 flex justify-between items-center text-xs text-neutral-500">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded">↵</kbd>
                            to select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded">Esc</kbd>
                            to close
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
