"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { StockItem  } from '@/lib/snowflakeService';
import { Package, Trash2, Plus, ArrowLeft, Search, Filter, AlertTriangle, X } from "lucide-react";
import Link from 'next/link';
import { getStoreItemsAction, addStockItemAction, deleteStockItemAction } from "@/app/actions/admin";

export default function StoreInventoryPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Store Name for Display
    const storeId = Array.isArray(params.storeId) ? params.storeId[0] : params.storeId;
    const storeName = decodeURIComponent(storeId || "");

    // Section for Data Fetching (Use query param or fallback to store name if not present)
    const sectionParam = searchParams.get('section');
    const sectionName = sectionParam || storeName;

    const [items, setItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Filter State
    const [search, setSearch] = useState("");

    // Form State
    const [newItem, setNewItem] = useState<Partial<StockItem>>({
        name: "",
        category: "General",
        quantity: 0,
        price: 0,
        unit: "units",
        status: "In Stock"
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (sectionName) {
            fetchItems();
        }
    }, [sectionName]);

    const fetchItems = async () => {
        setLoading(true);
        const data = await getStoreItemsAction(sectionName);
        setItems(data);
        setLoading(false);
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        // Construct item
        const itemPayload = {
            ...newItem,
            section: sectionName,
            ownerId: "admin", // simulated
            lastUpdated: new Date().toISOString()
        } as any; // Quick fix for Omit type

        const res = await addStockItemAction(itemPayload);
        if (res.success) {
            setIsAddModalOpen(false);
            setNewItem({ name: "", category: "General", quantity: 0, price: 0, unit: "units", status: "In Stock" });
            fetchItems();
        } else {
            alert(res.error || "Failed to add item");
        }
        setSubmitting(false);
    };

    const handleDeleteItem = async (id: string, name: string) => {
        if (!confirm(`Delete item "${name}"?`)) return;
        const res = await deleteStockItemAction(id, sectionName);
        if (res.success) {
            fetchItems();
        } else {
            alert(res.error || "Failed to delete item");
        }
    };

    const filteredItems = items.filter(i => 
        i.name.toLowerCase().includes(search.toLowerCase()) || 
        i.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/dashboard/stores" className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 text-sm mb-2 transition-colors">
                        <ArrowLeft size={16} /> Back to Stores
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Package className="w-8 h-8 text-indigo-500" />
                        {sectionName} Inventory
                    </h1>
                </div>
                <div className="flex gap-2">
                     <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search items..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-[#1f1e0b] border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white w-full md:w-64 transition-all shadow-sm"
                        />
                    </div>
                    <button 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md transition-colors flex items-center gap-2"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={18} /> Add Item
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20 text-slate-500 animate-pulse">Loading inventory...</div>
            ) : (
                <div className="bg-white dark:bg-[#1f1e0b] rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-[#323118] border-b border-slate-200 dark:border-neutral-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price (₹)</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-400">
                                            No items found via search.
                                        </td>
                                    </tr>
                                )}
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.category}</td>
                                        <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                                            {item.quantity} <span className="text-slate-400 text-xs">{item.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">₹{item.price}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                                                item.quantity <= 10 
                                                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50' 
                                                : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50'
                                            }`}>
                                                {item.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteItem(item.id, item.name)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Delete Item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Item Modal */}
             {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1f1e0b] w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add New Stock Item</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Item Name</label>
                                    <input 
                                        type="text" 
                                        value={newItem.name}
                                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
                                    <input 
                                        type="text" 
                                        value={newItem.category}
                                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        list="categories"
                                    />
                                    <datalist id="categories">
                                        <option value="Medicine" />
                                        <option value="Equipment" />
                                        <option value="Supplies" />
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Unit</label>
                                    <input 
                                        type="text" 
                                        value={newItem.unit}
                                        onChange={e => setNewItem({...newItem, unit: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        placeholder="e.g. box, vial"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Quantity</label>
                                    <input 
                                        type="number" 
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Price (₹)</label>
                                    <input 
                                        type="number" 
                                        value={newItem.price}
                                        onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg transition-all disabled:opacity-50"
                                >
                                    {submitting ? "Adding..." : "Add Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
