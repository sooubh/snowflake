"use client";

import { useState } from "react";
import { SIMULATED_USERS, UserProfile } from "@/lib/auth";
import { Server, Database, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export default function SeederPage() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const generateItemsForUser = (user: UserProfile) => {
    const categories = ['Medicine', 'PPE', 'Equipment', 'Supplies'];
    const items = [];
    
    for (let i = 0; i < 15; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const names = cat === 'Medicine' ? ['Paracetamol', 'Insulin', 'Antibiotics', 'Vaccine', 'Syrup'] :
                      cat === 'PPE' ? ['Masks', 'Gloves', 'Gowns', 'Shields'] :
                      cat === 'Equipment' ? ['Stethoscope', 'BP Monitor', 'Thermometer'] : ['Bandages', 'Cotton', 'Syringes'];
        
        const name = names[Math.floor(Math.random() * names.length)] + ` (${user.section} - ${i+1})`;
        
        items.push({
            name: name,
            category: cat,
            quantity: Math.floor(Math.random() * 500),
            price: Number((Math.random() * 50 + 1).toFixed(2)),
            ownerId: user.id,
            section: user.section
        });
    }
    return items;
  };

  const handleSeed = async () => {
    if(!confirm("WARNING: This will ADD 150+ items to your live Azure Database. Continue?")) return;
    
    setLoading(true);
    setLog([]);
    addLog("Starting seeding process...");

    try {
        const retailers = SIMULATED_USERS.filter(u => u.role === 'retailer');
        let totalAdded = 0;

        for (const user of retailers) {
            addLog(`Generating items for ${user.name} (${user.id})...`);
            const items = generateItemsForUser(user);
            
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
            addLog(`✅ Added ${items.length} items for ${user.name}`);
        }
        
        addLog(`🎉 COMPLETED! Added ${totalAdded} items total.`);

    } catch (err) {
        addLog(`❌ Error: ${err}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white p-12 font-sans flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">
         <div className="flex items-center gap-4">
             <div className="p-4 bg-purple-500/20 rounded-2xl">
                 <Database className="w-10 h-10 text-purple-400" />
             </div>
             <div>
                 <h1 className="text-4xl font-black">Database Seeder</h1>
                 <p className="text-gray-400">Populate Azure Cosmos DB with Demo Data</p>
             </div>
         </div>

         <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
             <p className="mb-6 text-gray-300">
                This tool will generate ~15 items for <strong>each of the 9 simulated retailers</strong> (135 items total).
                Each item will be tagged with the correct <code>ownerId</code> and <code>section</code> (PSD, Hospital, NGO).
             </p>

             <button 
                onClick={handleSeed}
                disabled={loading}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
             >
                {loading ? <Server className="animate-pulse" /> : <Database />}
                {loading ? "Seeding Database..." : "Seed Database Now"}
             </button>
         </div>

         <div className="bg-black/50 rounded-2xl p-6 font-mono text-sm h-96 overflow-y-auto border border-white/5 custom-scrollbar">
            {log.length === 0 ? <span className="text-gray-600">Waiting to start...</span> : log.map((l, i) => (
                <div key={i} className="mb-1 text-gray-300 border-b border-white/5 pb-1">{l}</div>
            ))}
         </div>
      </div>
    </div>
  );
}
