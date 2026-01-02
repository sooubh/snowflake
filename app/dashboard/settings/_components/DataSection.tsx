"use client";

import { useState, useEffect } from "react";
import { SIMULATED_USERS, UserProfile } from "@/lib/auth";
import { Database, Server, CheckCircle, AlertCircle } from "lucide-react";

export function DataSection() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    useEffect(() => {
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        }
        const userId = getCookie('simulated_user_id');
        if (userId) {
            const foundUser = SIMULATED_USERS.find(u => u.id === userId);
            if (foundUser) setUser(foundUser);
        }
    }, []);

    const addLog = (msg: string) => setLog(prev => [msg, ...prev]);

    const generateItemsForUser = (targetUser: UserProfile) => {
        const categories = ['Medicine', 'PPE', 'Equipment', 'Supplies'];
        const items = [];
        
        for (let i = 0; i < 15; i++) {
            const cat = categories[Math.floor(Math.random() * categories.length)];
            const names = cat === 'Medicine' ? ['Paracetamol', 'Insulin', 'Antibiotics', 'Vaccine', 'Syrup'] :
                          cat === 'PPE' ? ['Masks', 'Gloves', 'Gowns', 'Shields'] :
                          cat === 'Equipment' ? ['Stethoscope', 'BP Monitor', 'Thermometer'] : ['Bandages', 'Cotton', 'Syringes'];
            
            const name = names[Math.floor(Math.random() * names.length)] + ` (${targetUser.section} - ${i+1})`;
            
            items.push({
                name: name,
                category: cat,
                quantity: Math.floor(Math.random() * 500),
                price: Number((Math.random() * 50 + 1).toFixed(2)),
                ownerId: targetUser.id,
                section: targetUser.section
            });
        }
        return items;
    };

    const handleSeed = async () => {
        if (!user) return;
        setLoading(true);
        setLog([]);
        addLog("Starting seeding process...");

        try {
            let targets: UserProfile[] = [];

            if (user.role === 'admin') {
                // Admin seeds for ALL retailers in their section
                targets = SIMULATED_USERS.filter(u => u.role === 'retailer' && u.section === user.section);
                addLog(`Identified ${targets.length} retailers in ${user.section} Section.`);
            } else {
                // Retailer seeds only for themselves
                targets = [user];
                addLog(`Targeting single retailer: ${user.name}`);
            }

            let totalAdded = 0;

            for (const target of targets) {
                addLog(`Generating items for ${target.name}...`);
                const items = generateItemsForUser(target);
                
                for (const item of items) {
                    try {
                         await fetch("/api/items", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify(item),
                         });
                    } catch(e) {
                        console.error(e);
                    }
                }
                totalAdded += items.length;
                addLog(`✅ Added ${items.length} items for ${target.name}`);
            }
            
            addLog(`🎉 COMPLETED! Added ${totalAdded} items total.`);

        } catch (err) {
            addLog(`❌ Error: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="text-gray-500">Loading user profile...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Data Management</h3>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage demo data for your {user.role === 'admin' ? `${user.section} Section` : "Inventory"}.
                </p>
            </div>

            {/* Seed Fresh Data Section - NEW 450 items seeding */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-900/20 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-lg mb-2 flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Seed Fresh Data (450 Items)
                        </h4>
                        <p className="text-emerald-700 dark:text-emerald-300 text-sm mb-2">
                            Seeds 50 realistic items to each of the 3 retailer stores per section.
                        </p>
                        <ul className="text-emerald-600 dark:text-emerald-400 text-xs space-y-1 ml-4">
                            <li>• Deletes ALL existing data first</li>
                            <li>• FDC: Central Store A, B, C (150 items)</li>
                            <li>• Hospital: City General, Rural PHC 1, 2 (150 items)</li>
                            <li>• NGO: Relief Camp Alpha, Beta, Mobile Unit 1 (150 items)</li>
                            <li>• <strong>Total: 450 items</strong></li>
                        </ul>
                    </div>
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <Server className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                <button 
                    onClick={async () => {
                        if (!confirm('⚠️ This will DELETE all existing data and seed 450 fresh items. Continue?')) return;
                        setLoading(true);
                        setLog([]);
                        addLog("🌱 Starting fresh data seeding...");
                        
                        try {
                            const { seedFreshData } = await import('@/app/actions/seedData');
                            const result = await seedFreshData();
                            
                            if (result.success) {
                                addLog(`✅ ${result.message}`);
                                addLog(`📊 Stats: ${JSON.stringify(result.stats, null, 2)}`);
                            } else {
                                addLog(`❌ Error: ${result.message}`);
                            }
                        } catch (error) {
                            addLog(`❌ Failed: ${error}`);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
                    className="w-full mt-4 py-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Server className="animate-pulse w-5 h-5" /> : <Database className="w-5 h-5" />}
                    {loading ? "Seeding Data..." : "Seed Fresh Data (450 Items)"}
                </button>
            </div>

            {/* Original Demo Data Section */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/20 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 text-lg mb-2">
                             {user.role === 'admin' ? `Populate ${user.section} Section Data` : "Populate My Inventory"}
                        </h4>
                        <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-4">
                            {user.role === 'admin' 
                             ? `This will generate ~15 dummy items for EVERY retailer in the ${user.section} section.`
                             : "This will generate ~15 dummy items in your personal inventory."
                            }
                        </p>
                    </div>
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                        <Database className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>

                <button 
                    onClick={handleSeed}
                    disabled={loading}
                    className="w-full py-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Server className="animate-pulse w-5 h-5" /> : <Database className="w-5 h-5" />}
                    {loading ? "Generating Data..." : "Generate Demo Data"}
                </button>
            </div>

            {log.length > 0 && (
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 h-48 overflow-y-auto border border-slate-700 custom-scrollbar">
                    {log.map((l, i) => (
                        <div key={i} className="mb-1 border-b border-white/5 pb-1">{l}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
