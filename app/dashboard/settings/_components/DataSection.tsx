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

            const name = names[Math.floor(Math.random() * names.length)] + ` (${targetUser.section} - ${i + 1})`;

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
                    } catch (e) {
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

            {/* Data Seeding Disabled
            <div className="p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                <p className="text-slate-500 italic">Data seeding options have been disabled.</p>
            </div>
            */}

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
