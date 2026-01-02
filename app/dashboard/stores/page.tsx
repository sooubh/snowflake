"use client";

import { useState, useEffect } from "react";
import { SIMULATED_USERS, UserProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Store, User, Mail, Shield, Settings, CheckCircle, Plus, Trash2, X, Edit2 } from "lucide-react";
import Link from 'next/link';
import { getStoresAction, addStoreAction, deleteStoreAction, updateStoreAction, getStoreItemsAction } from "@/app/actions/admin";
import { SystemStore, StockItem  } from '@/lib/snowflakeService';

export default function StoresManagementPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [stores, setStores] = useState<SystemStore[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Form State
    const [newStoreName, setNewStoreName] = useState("");
    const [newStoreSection, setNewStoreSection] = useState("Hospital");
    
    // Edit State
    const [editingStore, setEditingStore] = useState<SystemStore | null>(null);
    const [editStoreName, setEditStoreName] = useState("");

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // 1. Get Logged In User
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        }
        const userId = getCookie('simulated_user_id');
        
        if (!userId) {
            router.push('/');
            return;
        }

        const user = SIMULATED_USERS.find(u => u.id === userId);
        if (!user || user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        setCurrentUser(user);

        // 2. Fetch Stores with Section Filter
        fetchStores(user.section);
        
        // 3. Set Default Section for Add Form
        setNewStoreSection(user.section);

    }, [router]);

    const fetchStores = async (section?: string) => {
        setLoading(true);
        // Use provided section or fallback to currentUser's section if available
        const filterSection = section || currentUser?.section;
        
        console.log('🔍 Fetching stores for section:', filterSection);
        
        // Pass the section filter to ensure only stores from this section are returned
        const data = await getStoresAction(filterSection);
        
        console.log('📦 Received stores:', data.length, 'stores for section:', filterSection);
        
        // Fetch inventory for each store to show stats
        const storesWithInventory = await Promise.all(
            data.map(async (store) => {
                const items = await getStoreItemsAction(store.section);
                return {
                    ...store,
                    itemCount: items.length,
                    lowStockCount: items.filter((item: StockItem) => item.quantity <= 10).length,
                    totalValue: items.reduce((sum: number, item: StockItem) => sum + (item.price * item.quantity), 0)
                };
            })
        );
        
        setStores(storesWithInventory);
        setLoading(false);
    };

    const handleAddStore = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Ensure we use the correct section (double check vs currentUser)
        const sectionToAdd = currentUser?.section || newStoreSection;
        
        const res = await addStoreAction(newStoreName, sectionToAdd);
        if (res.success) {
            setIsAddModalOpen(false);
            setNewStoreName("");
            fetchStores(); // Refresh
        } else {
            alert(res.error || "Failed to add store");
        }
        setSubmitting(false);
    };

    const handleDeleteStore = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete store "${name}"? This will DELETE all stock in it.`)) return;
        
        const res = await deleteStoreAction(id);
        if (res.success) {
            fetchStores();
        } else {
            alert(res.error || "Failed to delete store");
        }
    };

    const openEditModal = (store: SystemStore) => {
        setEditingStore(store);
        setEditStoreName(store.name);
        setIsEditModalOpen(true);
    };

    const handleUpdateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStore) return;
        setSubmitting(true);

        const res = await updateStoreAction(editingStore.id, { name: editStoreName });
        if (res.success) {
            setIsEditModalOpen(false);
            setEditingStore(null);
            fetchStores();
        } else {
            alert(res.error || "Failed to update store");
        }
        setSubmitting(false);
    };

    if (!currentUser) return <div className="p-8 text-neutral-500">Checking permissions...</div>;

    return (
        <div className="p-6 md:p-8 space-y-8 relative max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
                        <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                           <Store className="w-8 h-8" />
                        </span>
                        Stores Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium ml-1">
                        Manage active retailers, warehouses and inventory sections.
                    </p>
                </div>
                <button 
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus size={20} strokeWidth={3} /> 
                    Add New Store
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[1,2,3].map(i => <div key={i} className="h-48 rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {stores.length === 0 ? (
                        <div className="col-span-full p-12 text-center bg-white dark:bg-[#1f1e0b] rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                            <Store className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-neutral-500">No stores found</h3>
                            <p className="text-neutral-400">Create your first store to get started.</p>
                        </div>
                     ) : stores.map((store) => (
                        <div key={store.id} className="group bg-white dark:bg-[#1f1e0b] rounded-3xl p-6 border border-transparent dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button 
                                    onClick={() => openEditModal(store)}
                                    className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-500 hover:text-indigo-600 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteStore(store.id, store.name)}
                                    className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                                    {store.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight mb-1">{store.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                            {store.section}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">
                                            <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500 font-medium">Total Items</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{(store as any).itemCount || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500 font-medium">Low Stock</span>
                                    <span className={`font-bold ${(store as any).lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {(store as any).lowStockCount || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500 font-medium">Total Value</span>
                                    <span className="font-bold text-slate-800 dark:text-white">₹{((store as any).totalValue || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <Link 
                                href={`/dashboard/stores/${store.name}?section=${store.section}`}
                                className="block w-full py-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl font-bold text-sm text-center transition-colors flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:text-white"
                            >
                                Manage Inventory
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </Link>
                        </div>
                     ))}
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1f1e0b] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/10 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Add New Store</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddStore} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Store Name</label>
                                <input 
                                    type="text" 
                                    value={newStoreName}
                                    onChange={e => setNewStoreName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                                    placeholder="e.g. Downtown Pharmacy"
                                    required
                                    minLength={3}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Section / Category</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={newStoreSection}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none dark:text-slate-400 font-medium cursor-not-allowed opacity-70"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs font-bold uppercase">
                                        Fixed
                                    </div>
                                </div>
                                <p className="text-[10px] text-neutral-400 mt-1.5 ml-1">
                                    * You can only create stores within your assigned section ({currentUser?.section}).
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Creating..." : "Create Store"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1f1e0b] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/10 scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Edit Store</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateStore} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Store Name</label>
                                <input 
                                    type="text" 
                                    value={editStoreName}
                                    onChange={e => setEditStoreName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
                                    placeholder="Store Name"
                                    required
                                    minLength={3}
                                    autoFocus
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
