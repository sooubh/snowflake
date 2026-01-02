"use client";

import { useState, useEffect } from "react";
import { use } from "react"; // For unwrapping params
import { motion } from "framer-motion";
import { Server, Save, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
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
    unit: "",
    expiryDate: "",
  });

  // Fetch Existing Data
  useEffect(() => {
      async function fetchItem() {
          try {
              const res = await fetch("/api/items");
              if(res.ok) {
                  const items: StockItem[] = await res.json();
                  const item = items.find(i => i.id === id);
                  if(item) {
                      setFormData({
                          name: item.name,
                          category: item.category,
                          quantity: item.quantity.toString(),
                          price: item.price.toString(),
                          unit: item.unit || "",
                          expiryDate: item.expiryDate || "",
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
      // Ensure date is ISO
      const payload = {
          ...formData,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined
      };

      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update item");

      setSuccess(true);
      setTimeout(() => {
          router.push("/dashboard"); 
          router.refresh(); 
      }, 1000);
    } catch (err) {
      setError("Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-[500px] flex items-center justify-center text-neutral-500">Loading item...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-neutral-500" />
        </button>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">Edit Inventory Item</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#2a2912] border border-neutral-200 dark:border-neutral-700 rounded-3xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-100 dark:border-neutral-800">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                    {formData.name || "Item Details"}
                </h2>
                <p className="text-neutral-500 text-sm">Update stock levels and metadata</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Item Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1f1e0b] focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1f1e0b] focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
              >
                <option value="General">General</option>
                <option value="PPE">PPE</option>
                <option value="Medication">Medication</option>
                <option value="Equipment">Equipment</option>
                <option value="Supplies">Supplies</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1f1e0b] focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Unit (e.g., box, vial)</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="units"
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1f1e0b] focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value })}
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1f1e0b] focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Price per Unit ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1f1e0b] focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Updated successfully! Redirecting...
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition-all"
            >
                Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
