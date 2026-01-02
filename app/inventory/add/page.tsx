"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Save, CheckCircle, AlertCircle, RefreshCw, Mic, ScanBarcode, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import Papa from "papaparse";
import DummyDataGenerator from "@/components/DummyDataGenerator";

export default function AddItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);

  // Barcode Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    quantity: "",
    price: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Voice Input Logic ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Browser does not support speech recognition.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Simple heuristic: if it contains numbers, try to parse, otherwise just set name
      //Ideally, we would parse "500 masks" -> quantity 500, name masks.
      // For now, just setting the name for simplicity as per plan.
      setFormData(prev => ({ ...prev, name: transcript }));
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // --- Barcode Functionality ---
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      
      scanner.render((decodedText) => {
        // Success callback
        setFormData(prev => ({ ...prev, name: `Item ${decodedText}` })); // Using barcode as name suffix for now
        setShowScanner(false);
        scanner.clear();
      }, (error) => {
        // Error callback (ignore for scanning noise)
      });
      
      scannerRef.current = scanner;
    }

    return () => {
        if (scannerRef.current) {
            try { scannerRef.current.clear(); } catch(e) {}
        }
    };
  }, [showScanner]);

  const toggleScanner = () => {
      setShowScanner(!showScanner);
  };

  // --- CSV Upload Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setLoading(true);
        setStatus("Uploading CSV data...");
        let count = 0;
        
        for (const row of results.data as any[]) {
             // Expect keys: name, category, quantity, price
             if(row.name && row.quantity && row.price) {
                 try {
                     await fetch("/api/items", {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                             name: row.name,
                             category: row.category || "General",
                             quantity: Number(row.quantity),
                             price: Number(row.price)
                         }),
                     });
                     count++;
                 } catch(err) {
                     console.error("Failed to upload row", row);
                 }
             }
        }
        setSuccess(true);
        setError(`Uploaded ${count} items from CSV.`);
        setLoading(false);
        setStatus("");
      },
      error: (err) => {
          setError("Failed to parse CSV file.");
      }
    });
  };

  // --- Main Submit ---
  const [status, setStatus] = useState(""); // For showing bulk status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to add item");

      setSuccess(true);
      setFormData({ name: "", category: "General", quantity: "", price: "" });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save item. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

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
                    Add Inventory
                </h1>
                <p className="text-gray-400 text-sm">Add single items or bulk upload via CSV</p>
            </div>
        </div>

        {/* CSV Upload Section */}
        <div className="mb-8 p-4 border border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative group">
            <div className="flex items-center justify-center gap-4 cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white">Upload CSV File for Bulk Entry</p>
                    <p className="text-xs text-gray-500">Headers: name, category, quantity, price</p>
                </div>
            </div>
            <input 
                type="file" 
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name with Voice & Barcode */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Item Name</label>
              <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Surgical Masks"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <button 
                        type="button" 
                        onClick={startListening}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Voice Input"
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={toggleScanner}
                    className="aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-blue-500/30 transition-all"
                    title="Scan Barcode"
                  >
                      <ScanBarcode className="w-6 h-6 text-gray-300" />
                  </button>
              </div>
            </div>

            {/* Barcode Scanner Overlay */}
            <AnimatePresence>
                {showScanner && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:col-span-2 bg-black/50 rounded-xl overflow-hidden relative"
                    >
                        <div id="reader" className="w-full bg-black"></div>
                        <button 
                            type="button" 
                            onClick={toggleScanner}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Category */}
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

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium ml-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Price */}
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
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
            >
                <AlertCircle className="w-5 h-5" />
                {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
            >
                <CheckCircle className="w-5 h-5" />
                {status ? "Batch operation completed!" : "Item added successfully to database!"}
            </motion.div>
          )}

          {/* Actions */}
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
              disabled={loading}
              className="flex-[2] py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {status || "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save to Azure
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
      
      {/* Dummy Data Generator Component */}
      <DummyDataGenerator />
    </div>
  );
}
