'use client';

import { useState } from 'react';
import { StockItem  } from '@/lib/snowflakeService';

interface EditItemModalProps {
    item: StockItem;
    onClose: () => void;
    onSave?: (updatedItem: StockItem) => void;
}

export function EditItemModal({ item, onClose, onSave }: EditItemModalProps) {
    const [formData, setFormData] = useState({
        suggestedQty: 50 - item.quantity, // Simple logic: Top up to 50
        priority: 'high',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Save the changes (in a real app, this would call an API)
        const updatedItem = {
            ...item,
            minQuantity: formData.suggestedQty,
            // Store notes in description field
            description: formData.notes || item.description
        };
        
        // Call parent's onSave handler to update the item
        if (onSave) {
            onSave(updatedItem);
        }
        
        // Close modal
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white dark:bg-[#1a1a10] w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">edit</span>
                        </div>
                        <h2 className="text-xl font-black text-neutral-dark dark:text-white uppercase tracking-tight">Edit Reorder Data</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-10 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="bg-neutral-50 dark:bg-black/20 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 mb-6">
                        <span className="text-[10px] uppercase font-black text-neutral-400 block mb-1">Editing Item</span>
                        <span className="text-base font-bold text-neutral-dark dark:text-white uppercase">{item.name} at {item.section}</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 block mb-2">Suggested Reorder Quantity</label>
                            <input
                                type="number"
                                value={formData.suggestedQty}
                                onChange={(e) => setFormData({ ...formData, suggestedQty: parseInt(e.target.value) })}
                                className="w-full bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 block mb-2">Override Priority Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['low', 'medium', 'high'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={`py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${formData.priority === p
                                                ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20'
                                                : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 block mb-2">Adjustment Notes</label>
                            <textarea
                                rows={3}
                                placeholder="Why are you adjusting this order?"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full bg-neutral-50 dark:bg-black/30 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium text-neutral-dark dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-sm font-bold text-neutral-600 dark:text-neutral-400 transition-colors"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-3 bg-primary text-black text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Update Reorder Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
