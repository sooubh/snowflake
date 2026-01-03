'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Filter, Tag, X, Loader2 } from 'lucide-react';
import { StockItem, Transaction, SystemStore } from '@/lib/snowflakeService';
import InvoiceModal from '@/components/InvoiceModal';
import { useToast } from '@/app/context/ToastContext';
import { getUser, UserProfile } from '@/lib/auth';
import { getStoresAction } from '@/app/actions/admin';

interface CartItem {
    item: StockItem;
    quantity: number;
}

export default function SalesPage() {
    const toast = useToast();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory, setInventory] = useState<StockItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionType, setTransactionType] = useState('SALE');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Store selection for admins
    const [availableStores, setAvailableStores] = useState<SystemStore[]>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

    const [showMobileCart, setShowMobileCart] = useState(false);

    // Resizable Layout State
    const [leftPanelWidth, setLeftPanelWidth] = useState(66.66); // Percentage
    const [isResizing, setIsResizing] = useState(false);

    // Drag Handlers
    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = (mouseMoveEvent.clientX / window.innerWidth) * 100;
            // Limit width between 30% and 75%
            if (newWidth > 30 && newWidth < 75) {
                setLeftPanelWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    // Get user on mount
    useEffect(() => {
        // Parse cookies using native browser API
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };

        const userId = getCookie('simulated_user_id');
        if (userId) {
            const userProfile = getUser(userId);
            if (userProfile) {
                setUser(userProfile);
                // For retailers, auto-select their own store
                if (userProfile.role === 'retailer') {
                    setSelectedStoreId(userId);
                }
            }
        }
    }, []);

    // Load stores for section - Only retailers (no admin)
    useEffect(() => {
        if (user) {
            console.log(`🏪 POS: Loading stores for section ${user.section}`);
            // Get only retailers in this section (exclude admin)
            const { SIMULATED_USERS } = require('@/lib/auth');
            const sectionUsers = SIMULATED_USERS.filter((u: any) =>
                u.section === user.section && u.role === 'retailer'  // Only retailers
            );
            console.log(`✅ POS: Found ${sectionUsers.length} retailer stores`);

            // Convert users to store format for dropdown
            const storesAsUsers = sectionUsers.map((u: any) => ({
                id: u.id,
                name: u.name,
                section: u.section
            }));

            setAvailableStores(storesAsUsers);

            // Auto-select first store for admins if none selected
            if (user.role === 'admin' && !selectedStoreId && storesAsUsers.length > 0) {
                setSelectedStoreId(storesAsUsers[0].id);
            } else if (user.role === 'retailer') {
                // Retailer always uses their own ID
                setSelectedStoreId(user.id);
            }
        }
    }, [user]);

    // Fetch inventory when user is loaded OR when selected store changes
    useEffect(() => {
        if (user && selectedStoreId) {
            fetchInventory();
        }
    }, [user, selectedStoreId]);

    const fetchInventory = async () => {
        if (!user || !selectedStoreId) return;

        setIsLoading(true);
        try {
            console.log(`📦 POS: Fetching inventory for section ${user.section}, store ${selectedStoreId}`);
            // Fetch items from user's section only
            const res = await fetch(`/api/items?section=${user.section}`);
            const data = await res.json();

            console.log(`📥 POS: Received ${Array.isArray(data) ? data.length : 0} items from API`);

            if (Array.isArray(data)) {
                // Filter by selected store's ownerId
                const filteredData = data.filter(item => item.ownerId === selectedStoreId);
                console.log(`✅ POS: Filtered to ${filteredData.length} items for store ${selectedStoreId}`);
                setInventory(filteredData);
            }
        } catch (error) {
            console.error("❌ POS: Failed to fetch inventory", error);
            toast.error('Error', 'Failed to load inventory');
        } finally {
            setIsLoading(false);
        }
    };

    // AI Integration: Listen for Add to Cart events
    useEffect(() => {
        const handleAIAddToCart = (e: any) => {
            // Handle data structure: { items: [...] }
            const data = e.detail;
            const itemsToAdd = data?.items || data; // Support both formats

            if (!Array.isArray(itemsToAdd)) return;

            itemsToAdd.forEach((reqItem: any) => {
                // Use either name or itemName field
                const searchName = reqItem.name || reqItem.itemName;
                if (!searchName) return;

                // Fuzzy match name
                const matchedItem = inventory.find(inv =>
                    inv.name.toLowerCase().includes(searchName.toLowerCase())
                );

                if (matchedItem && matchedItem.quantity > 0) {
                    setCart(prev => {
                        const existing = prev.find(c => c.item.id === matchedItem.id);
                        if (existing) {
                            return prev.map(c => c.item.id === matchedItem.id ? { ...c, quantity: c.quantity + reqItem.quantity } : c);
                        }
                        return [...prev, { item: matchedItem, quantity: reqItem.quantity }];
                    });
                }
            });
        };

        // Listen for both old and new event names for compatibility
        window.addEventListener('ledgerbot-add-to-cart', handleAIAddToCart);
        window.addEventListener('ledgerbot-add-to-sales-cart', handleAIAddToCart);
        return () => {
            window.removeEventListener('ledgerbot-add-to-cart', handleAIAddToCart);
            window.removeEventListener('ledgerbot-add-to-sales-cart', handleAIAddToCart);
        };
    }, [inventory]);

    // Extract unique categories from inventory
    const categories = useMemo(() => {
        const unique = Array.from(new Set(inventory.map(item => item.category)));
        return ['All', ...unique.sort()];
    }, [inventory]);

    // Smart filtering based on category and search
    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [inventory, searchTerm, selectedCategory]);

    const addToCart = (item: StockItem) => {
        setCart(prev => {
            const existing = prev.find(c => c.item.id === item.id);
            if (existing) {
                if (existing.quantity >= item.quantity) return prev; // Validating stock limit
                return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
            }
            return [...prev, { item, quantity: 1 }];
        });
        // Visual feedback
        toast.success('Added to cart', item.name);
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(c => c.item.id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(c => {
            if (c.item.id === itemId) {
                const newQty = c.quantity + delta;
                if (newQty < 1) return c;
                if (newQty > c.item.quantity) return c;
                return { ...c, quantity: newQty };
            }
            return c;
        }));
    };

    const setManualQuantity = (itemId: string, value: string) => {
        const qty = parseInt(value) || 0;
        setCart(prev => prev.map(c => {
            if (c.item.id === itemId) {
                const newQty = Math.max(1, Math.min(qty, c.item.quantity));
                return { ...c, quantity: newQty };
            }
            return c;
        }));
    };

    const calculateTotal = () => {
        const subtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
        const tax = subtotal * 0.18;
        return { subtotal, tax, total: subtotal + tax };
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setIsProcessing(true);
        toast.info('Processing transaction...', 'Please wait');

        // Construct payload
        const payload = {
            items: cart.map(c => ({
                itemId: c.item.id,
                price: c.item.price,
                quantity: c.quantity
            })),
            section: cart[0].item.section,
            transactionType,
            paymentMethod,
            customerName: "Walk-in",
            operatorId: "System"
        };

        try {
            const res = await fetch('/api/items/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                // Success!
                toast.success('Transaction Successful!', `Invoice: ${data.invoiceNumber}`);

                // Dispatch event for notifications
                window.dispatchEvent(new CustomEvent('sale-completed', {
                    detail: {
                        invoiceNumber: data.invoiceNumber,
                        totalAmount: data.totalAmount
                    }
                }));

                setLatestTransaction(data);
                setShowInvoice(true);
                setCart([]);

                // Refresh inventory
                await fetchInventory();
            } else {
                toast.error('Transaction Failed', data.error || 'Unknown error');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error', 'Failed to process transaction');
        } finally {
            setIsProcessing(false);
        }
    };

    const { subtotal, tax, total } = calculateTotal();

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-6rem)] bg-background-light dark:bg-black font-sans overflow-hidden rounded-3xl relative z-0">

            {/* Mobile Header Cart Toggle (Visible only on mobile) */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setShowMobileCart(true)}
                    className="relative flex items-center justify-center size-14 rounded-full bg-primary text-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    <ShoppingCart className="w-6 h-6" />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 size-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-black">
                            {cart.reduce((a, c) => a + c.quantity, 0)}
                        </span>
                    )}
                </button>
            </div>

            {/* Main Content Area */}
            <div
                className={`flex flex-col h-full transition-all duration-300 md:duration-0 ${showMobileCart ? 'hidden md:flex' : 'flex'}`}
                style={{ width: `${leftPanelWidth}%` }} // Dynamic Width
            >

                {/* Left: Product Catalog */}
                <div className="w-full p-2 md:p-3 flex flex-col h-full overflow-hidden">
                    {/* Header Section */}
                    <header className="mb-2">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-3">
                            <div className="flex-1">
                                <h1 className="text-xl md:text-2xl font-display font-bold text-neutral-dark dark:text-white tracking-tight flex items-center gap-2">
                                    Point of Sale
                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                        {inventory.length} Items
                                    </span>
                                </h1>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                                    Browse and add items to cart
                                </p>
                            </div>

                            {/* Store Selector for Admins */}
                            {user?.role === 'admin' && availableStores.length > 0 && (
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider ml-1">Selling From</label>
                                    <select
                                        value={selectedStoreId || ''}
                                        onChange={(e) => setSelectedStoreId(e.target.value)}
                                        className="appearance-none bg-white dark:bg-neutral-800 rounded-lg px-3 py-2 text-xs font-semibold border-none ring-1 ring-neutral-200 dark:ring-neutral-800 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    >
                                        {availableStores.map(store => (
                                            <option key={store.id} value={store.id}>{store.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {user?.role === 'retailer' && (
                                <div className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                                    <p className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Your Store</p>
                                    <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">{user.name}</p>
                                </div>
                            )}

                            <div className="relative group w-full lg:w-auto">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full lg:w-64 bg-white dark:bg-[#1f1e0b] rounded-xl pl-9 pr-9 py-2 border-none ring-1 ring-neutral-200 dark:ring-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-hide">
                            {/* ... (Keep existing category tabs logic, just ensure spacing is good) ... */}
                            <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider shrink-0">
                                <Filter className="w-3.5 h-3.5" />
                            </div>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${selectedCategory === category
                                        ? 'bg-primary text-black shadow-sm'
                                        : 'bg-white dark:bg-[#1f1e0b] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </header>

                    {/* Product Grid - Adjusted for 3 columns on PC */}
                    <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                                <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                                <p className="font-semibold text-sm mt-2">Loading...</p>
                            </div>
                        ) : filteredInventory.length === 0 ? (
                            // ... (keep empty state) ...
                            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-3 opacity-60">
                                <Search className="w-8 h-8 opacity-50" />
                                <div className="text-center">
                                    <p className="font-bold text-base">No items found</p>
                                </div>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 pb-20 md:pb-2`}>
                                {filteredInventory.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => item.quantity > 0 && addToCart(item)}
                                        className={`group bg-white dark:bg-[#1f1e0b] p-3 rounded-xl cursor-pointer transition-all flex flex-col justify-between h-44 shadow-sm hover:shadow-md ${item.quantity > 0
                                            ? 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                                            : 'opacity-50 grayscale cursor-not-allowed'
                                            }`}
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-start">
                                                <span className="inline-flex items-center justify-center size-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:bg-primary group-hover:text-black transition-colors">
                                                    <span className="material-symbols-outlined text-lg">
                                                        {item.category.includes('Med') ? 'pill' :
                                                            item.category.includes('Equip') ? 'medical_services' : 'inventory_2'}
                                                    </span>
                                                </span>
                                                {item.quantity <= 0 ? (
                                                    <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[9px] font-bold rounded uppercase tracking-wider">
                                                        Out
                                                    </span>
                                                ) : (
                                                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${item.quantity < 10
                                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                        }`}>
                                                        {item.quantity} Left
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-neutral-dark dark:text-white leading-tight line-clamp-2" title={item.name}>
                                                    {item.name}
                                                </h3>
                                                <p className="text-[9px] text-neutral-400 font-semibold mt-0.5 uppercase tracking-wide">
                                                    {item.category}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between pt-2 mt-auto">
                                            <div>
                                                <p className="font-display font-bold text-base text-neutral-dark dark:text-white">
                                                    ${item.price}
                                                </p>
                                            </div>
                                            <div className="group-hover:translate-x-1 transition-transform">
                                                <span className="size-6 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover:bg-primary group-hover:text-black transition-colors">
                                                    <Plus className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Resize Handle */}
            <div
                className="hidden md:flex flex-col justify-center items-center w-2 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-col-resize z-30 transition-colors select-none"
                onMouseDown={startResizing}
            >
                <div className="h-8 w-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {/* Right: Cart & Checkout Panel (Responsive Logic) */}
            <div
                className={`
                    bg-white dark:bg-[#1f1e0b] flex flex-col shadow-xl z-20 
                    absolute md:static inset-0 transition-transform duration-300 ease-in-out
                    ${showMobileCart ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                `}
                style={{ width: showMobileCart ? '100%' : 'auto', flex: 1 }} // Take remaining space on desktop, full width on mobile if open
            >
                <div className="p-3 bg-neutral-50/50 dark:bg-black/20">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {/* Mobile Back Button */}
                            <button
                                onClick={() => setShowMobileCart(false)}
                                className="md:hidden flex items-center justify-center size-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </button>
                            <h2 className="text-lg font-display font-bold text-neutral-dark dark:text-white flex items-center gap-2">
                                Current Order
                            </h2>
                        </div>
                        <span className="px-2 py-1 rounded-full bg-white dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 shadow-sm">
                            {cart.reduce((a, c) => a + c.quantity, 0)} Items
                        </span>
                    </div>

                    {/* Transaction Controls (Compact) */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider ml-1">Type</label>
                            <div className="relative">
                                <select
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value)}
                                    className="w-full appearance-none bg-white dark:bg-neutral-800 rounded-lg px-2 py-1.5 text-xs font-semibold border-none ring-1 ring-neutral-200 dark:ring-neutral-800 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="SALE">Sale</option>
                                    <option value="INTERNAL_USAGE">Usage</option>
                                    <option value="DAMAGE">Damage</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider ml-1">Payment</label>
                            <div className="relative">
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full appearance-none bg-white dark:bg-neutral-800 rounded-lg px-2 py-1.5 text-xs font-semibold border-none ring-1 ring-neutral-200 dark:ring-neutral-800 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CARD">Card</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-neutral-50/20 dark:bg-black/5">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-3 opacity-60">
                            <ShoppingCart className="w-8 h-8 opacity-50" />
                            <div className="text-center">
                                <p className="font-bold text-sm text-neutral-600 dark:text-neutral-300">Cart Empty</p>
                            </div>
                        </div>
                    ) : (
                        cart.map(c => (
                            <div key={c.item.id} className="group bg-white dark:bg-[#23220f] p-2 rounded-xl shadow-sm flex gap-2 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                <div className="flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 gap-0.5">
                                    <button
                                        onClick={() => updateQuantity(c.item.id, 1)}
                                        className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-md text-neutral-500 hover:text-green-600 dark:hover:text-green-500 transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={c.item.quantity}
                                        value={c.quantity}
                                        onChange={(e) => setManualQuantity(c.item.id, e.target.value)}
                                        className="text-xs font-mono font-bold w-8 text-center bg-transparent border-none focus:outline-none focus:bg-white dark:focus:bg-neutral-700 rounded px-0.5 text-neutral-dark dark:text-white"
                                    />
                                    <button
                                        onClick={() => updateQuantity(c.item.id, -1)}
                                        className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-md text-neutral-500 hover:text-red-500 transition-all"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                    <h4 className="font-bold text-xs text-neutral-dark dark:text-white truncate" title={c.item.name}>{c.item.name}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-[10px] text-neutral-400 font-mono">
                                            ${c.item.price}
                                        </p>
                                        <p className="font-bold text-neutral-dark dark:text-white font-mono text-xs">
                                            ${(c.item.price * c.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeFromCart(c.item.id)}
                                    className="self-center p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                <div className="p-3 bg-white dark:bg-[#1f1e0b] pb-24 md:pb-3 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                    <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="font-medium">Subtotal</span>
                            <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="font-medium">Tax (18%)</span>
                            <span className="font-mono font-semibold">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-1 border-t border-dashed border-neutral-100 dark:border-neutral-800">
                            <span className="font-bold text-base text-neutral-dark dark:text-white">Total</span>
                            <span className="font-display font-bold text-xl text-neutral-dark dark:text-white">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${cart.length > 0 && !isProcessing
                            ? 'bg-primary hover:bg-[#eae605] text-black shadow-lg hover:shadow-xl hover:shadow-primary/20'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" />
                                {cart.length > 0 ? "Generate Invoice" : "Add Items"}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <InvoiceModal
                transaction={latestTransaction}
                isOpen={showInvoice}
                onClose={() => setShowInvoice(false)}
            />
        </div>
    );
}
