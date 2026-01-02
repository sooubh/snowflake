"use client";

import { useState, useEffect } from "react";
import { SIMULATED_USERS, UserProfile } from "@/lib/auth";
import { Database, Server } from "lucide-react";

export default function DummyDataGenerator() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Client-side cookie reading to get current user
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

  const generateItemsForUser = (targetUser: UserProfile) => {
    let items = [];
    const section = targetUser.section;
    
    // 1. Define Datasets
    const hospitalItems = [
        { name: 'Paracetamol 500mg', category: 'Medicine', unit: 'strips' },
        { name: 'Amoxicillin 250mg', category: 'Medicine', unit: 'strips' },
        { name: 'Insulin Glargine', category: 'Medicine', unit: 'vials' },
        { name: 'Cetirizine 10mg', category: 'Medicine', unit: 'strips' },
        { name: 'Azithromycin 500mg', category: 'Medicine', unit: 'strips' },
        { name: 'Surgical Masks', category: 'Supplies', unit: 'box' },
        { name: 'N95 Respirators', category: 'Supplies', unit: 'box' },
        { name: 'Sterile Gloves', category: 'Supplies', unit: 'pairs' },
        { name: 'Syringes 5ml', category: 'Supplies', unit: 'box' },
        { name: 'Bandages', category: 'Supplies', unit: 'rolls' },
        { name: 'Digital Thermometer', category: 'Equipment', unit: 'pcs' },
        { name: 'BP Myonitor', category: 'Equipment', unit: 'pcs' },
        { name: 'Pulse Oximeter', category: 'Equipment', unit: 'pcs' },
        { name: 'Stethoscope', category: 'Equipment', unit: 'pcs' },
        { name: 'IV Stand', category: 'Equipment', unit: 'pcs' },
    ];

    const psdItems = [
        { name: 'Rice (Sona Masoori)', category: 'Ration', unit: 'kg' },
        { name: 'Wheat Flour', category: 'Ration', unit: 'kg' },
        { name: 'Sugar', category: 'Ration', unit: 'kg' },
        { name: 'Cooking Oil', category: 'Ration', unit: 'liters' },
        { name: 'Salt (Iodized)', category: 'Ration', unit: 'packets' },
        { name: 'Blankets (Woolen)', category: 'Relief', unit: 'pcs' },
        { name: 'Tarpaulins', category: 'Relief', unit: 'pcs' },
        { name: 'Jerry Cans 20L', category: 'Relief', unit: 'pcs' },
        { name: 'Mosquito Nets', category: 'Relief', unit: 'pcs' },
        { name: 'Solar Lanterns', category: 'Relief', unit: 'pcs' },
    ];

    const ngoItems = [
        { name: 'Hygiene Kits', category: 'Kits', unit: 'kits' },
        { name: 'First Aid Box', category: 'Kits', unit: 'box' },
        { name: 'Sanitary Pads', category: 'Hygiene', unit: 'packets' },
        { name: 'Soap Bars', category: 'Hygiene', unit: 'pcs' },
        { name: 'Water Purification Tabs', category: 'Water', unit: 'strips' },
        { name: 'High Energy Biscuits', category: 'Food', unit: 'packets' },
        { name: 'Milk Powder', category: 'Food', unit: 'kg' },
        { name: 'Notebooks', category: 'Education', unit: 'pcs' },
        { name: 'Pencils/Pens', category: 'Education', unit: 'box' },
        { name: 'School Bags', category: 'Education', unit: 'pcs' },
    ];

    let baseItems = [];
    if (section === 'Hospital') baseItems = hospitalItems;
    else if (section === 'FDC') baseItems = psdItems;
    else baseItems = ngoItems;

    // Helper for Dates
    const getRandomDate = (start: Date, end: Date) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
    };

    // Helper for Batch
    const getBatch = () => `B${Math.floor(Math.random() * 9000) + 1000}-${new Date().getFullYear()}`;

    // Helper for Quantity (Less, Medium, More)
    const getQuantity = () => {
        const rand = Math.random();
        if (rand < 0.33) return Math.floor(Math.random() * 50); // Low: 0-50
        if (rand < 0.66) return Math.floor(Math.random() * 150) + 51; // Medium: 51-200
        return Math.floor(Math.random() * 300) + 201; // High: 201-500
    };

    for (const item of baseItems) {
        // Manufacture Date: 1 year ago to 1 month ago
        const mfgDate = getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        
        // Expiry Date: Today to 2 years future (some might be short expiry)
        const expDate = getRandomDate(new Date(), new Date(Date.now() + 730 * 24 * 60 * 60 * 1000));

        items.push({
            name: item.name,
            category: item.category,
            quantity: getQuantity(), // Use the improved logic
            price: Number((Math.random() * 100 + 10).toFixed(2)),
            ownerId: targetUser.id,
            section: targetUser.section,
            unit: item.unit,
            manufacturingDate: mfgDate,
            expiryDate: expDate,
            batchNumber: getBatch(),
            supplier: section === 'Hospital' ? 'MediCorp Pharma' : section === 'FDC' ? 'Govt Supply Depot' : 'Global Aid Supplies',
            description: `Standard ${item.category} unit for ${section} distribution.`
        });
    }
    return items;
  };

  const handleSeed = async () => {
    if (!user) return;
    setLoading(true);
    setStatus("Generating data...");

    try {
        let targets: UserProfile[] = [];

        // If on Add Item Page, we usually just want to populate data for THIS logged in user context
        // regardless of if they are admin or retailer? 
        // Admin likely wants to add data to their *own* logical view or manage.
        // Let's stick to the consistent logic: Admin seeds for all, Retailer for self.
        
        if (user.role === 'admin') {
            targets = SIMULATED_USERS.filter(u => u.role === 'retailer' && u.section === user.section);
        } else {
            targets = [user];
        }

        let totalAdded = 0;
        for (const target of targets) {
            const items = generateItemsForUser(target);
            for (const item of items) {
                await fetch("/api/items", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item),
                });
            }
            totalAdded += items.length;
        }
        
        setStatus(`Successfully added ${totalAdded} items!`);
        setTimeout(() => setStatus(""), 5000);
        // Optional: refresh page to see items? but this is an add page.
    } catch (err) {
        console.error(err);
        setStatus("Error generating data.");
    } finally {
        setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-2xl mt-8 pt-8 border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-300">Quick Actions</h3>
                <p className="text-sm text-gray-500">Helpers for development</p>
            </div>
        </div>
        
        <button 
            type="button"
            onClick={handleSeed}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-all flex items-center justify-center gap-2 group"
        >
            {loading ? <Server className="animate-pulse w-5 h-5" /> : <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            {loading ? "Adding Dummy Data..." : `Generate Safe Dummy Data for ${user.section}`}
        </button>
        {status && <p className="text-center text-green-400 mt-2 text-sm">{status}</p>}
    </div>
  );
}
