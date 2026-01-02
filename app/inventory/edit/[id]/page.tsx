"use client";

import { useState, useEffect } from "react";
import { use } from "react"; // For unwrapping params
import { motion } from "framer-motion";
import { Server, Save, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { StockItem  } from '@/lib/snowflakeService';

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    quantity: "",
    price: "",
  });

  // Fetch Existing Data
  useEffect(() => {
      async function fetchItem() {
          try {
              // In a real app we would have a specific get-by-id endpoint or filter client side
              // Efficient way: Fetch all and find (since we don't have get-by-id API yet)
              // Better: Add GET to /api/items/[id]
              // For now, let's just fetch all and filter in memory as a quick solution
              // Wait! We just made /api/items/[id] DELETE/PUT. We can add GET there too!
              // But for speed, let's just assume we can fetch via generic items API and filter
              const res = await fetch("/api/items");
              if(res.ok) {
                  const items: StockItem[] = await res.json();
                  const item = items.find(i => i.id === id);
                  if(item) {
                      setFormData({
                          name: item.name,
                          category: item.category,
                          quantity: item.quantity.toString(),
                          price: item.price.toString()
                      });
                  } else {
                      setError("Item not found");
                  }
              }
          } catch(err) {
              setError("Failed to load item details");
          } finally {
              setLoading(false);
          }
      }
      fetchItem();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update item");

      setSuccess(true);
      setTimeout(() => {
          router.back();
          router.refresh(); // Refresh previous page to show changes
      }, 1000);
    } catch (err) {
      setError("Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading item...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white p-6 md:p-12 font-sans flex flex-col items-center relative overflow-y-auto">
      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl mb-8"
      >
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
                <Server className="w-8 h-8 text-blue-400" />
            </div>
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Edit Item
                </h1>
                <p className="text-gray-400 text-sm">Update inventory details</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Item Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
              >
                <option value="General" className="bg-[#1a1a24]">General</option>
                <option value="PPE" className="bg-[#1a1a24]">PPE</option>
                <option value="Medication" className="bg-[#1a1a24]">Medication</option>
                <option value="Equipment" className="bg-[#1a1a24]">Equipment</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Price per Unit ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Updated successfully! Redirecting...
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
            >
                Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
