'use client';

import { useState } from 'react';

export function AIInsightPanel() {
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const analyticData = [
        { location: 'Downtown Hospital', item: 'Amoxicillin 500mg', stock: '120 units', burn: '45 units/d', depletion: '2.6 DAYS' },
        { location: 'Downtown Hospital', item: 'Saline Solution 1L', stock: '450 units', burn: '180 units/d', depletion: '2.5 DAYS' },
        { location: 'Downtown Hospital', item: 'Surgical Masks (Box)', stock: '12 boxes', burn: '5 boxes/d', depletion: '2.4 DAYS' }
    ];

    const handleExport = () => {
        setIsExporting(true);

        // Simulate generation time
        setTimeout(() => {
            const headers = ['Location', 'Stock Item', 'Current Stock', 'Daily Burn', 'Est. Depletion'];
            const rows = analyticData.map(d => [d.location, d.item, d.stock, d.burn, d.depletion]);

            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "ai_insight_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setIsExporting(false);
        }, 1000);
    };

    const suggestions = [
        {
            id: 1,
            title: 'Route Surplus from West side',
            description: 'Transfer 150 units of Amoxicillin from West side Medical Center (Regional Surplus).',
            benefit: 'Resolves Downtown shortage in 6h',
            impact: 'Low Cost',
            icon: 'local_shipping'
        },
        {
            id: 2,
            title: 'Accelerate Supplier Order #402',
            description: 'Request priority delivery for Saline Solution from PharmaLink Global.',
            benefit: 'Reduces depletion risk by 40%',
            impact: 'Medium Cost',
            icon: 'speed'
        },
        {
            id: 3,
            title: 'Adjust Ward Consumption',
            description: 'Implement surgical gauze conservation protocols in non-emergency units.',
            benefit: 'Extends stock by 18h',
            impact: 'Zero Cost',
            icon: 'inventory'
        }
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300">
                <div className="flex gap-4 items-start">
                    <div className="p-2.5 rounded-xl bg-primary text-black shrink-0 shadow-sm">
                        <span className="material-symbols-outlined filled">auto_awesome</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-lg leading-tight text-neutral-dark dark:text-white flex items-center gap-2">
                            AI Insight: 3 Critical Stock-outs Predicted
                            <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-black uppercase tracking-wider">High Probability</span>
                        </h3>
                        <p className="text-neutral-500 dark:text-gray-300 text-sm">
                            Predictive analysis suggests shortages within <span className="font-bold text-neutral-dark dark:text-white">48h</span> at
                            <span className="font-medium text-neutral-dark dark:text-white mx-1 underline decoration-primary/50">Downtown Hospital</span>
                            based on current consumption rates.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className={`shrink-0 h-10 px-6 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${showAnalysis
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-dark dark:text-white'
                        : 'bg-primary text-black hover:bg-[#e6e205] shadow-lg shadow-primary/20'
                        }`}
                >
                    <span>{showAnalysis ? 'Close Analysis' : 'View Analysis'}</span>
                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${showAnalysis ? 'rotate-180' : ''}`}>
                        {showAnalysis ? 'close' : 'arrow_forward'}
                    </span>
                </button>
            </div>

            {showAnalysis && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 bg-white dark:bg-[#1a190b] border border-neutral-100 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Detailed Data Metric 1 */}
                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-red-50/50 dark:bg-red-900/5 border border-red-100/50 dark:border-red-900/20 text-center">
                                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Confidence Score</span>
                                <span className="text-2xl font-black text-neutral-dark dark:text-white">94.2%</span>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full mt-1 overflow-hidden">
                                    <div className="bg-red-500 h-full w-[94%] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                </div>
                            </div>
                            {/* Detailed Data Metric 2 */}
                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-orange-50/50 dark:bg-orange-900/5 border border-orange-100/50 dark:border-orange-900/20 text-center">
                                <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Consumption Trend</span>
                                <span className="text-2xl font-black text-neutral-dark dark:text-white">+24% ↑</span>
                                <span className="text-[10px] text-neutral-500 font-medium">vs Last 7 Days Average</span>
                            </div>
                            {/* Detailed Data Metric 3 */}
                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/5 border border-blue-100/50 dark:border-blue-900/20 text-center">
                                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Regional Priority</span>
                                <span className="text-2xl font-black text-neutral-dark dark:text-white">P1 Urgent</span>
                                <span className="text-[10px] text-neutral-500 font-medium">Automatic Routing Active</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-4">
                            <h4 className="font-bold text-neutral-dark dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-primary">analytics</span>
                                Supporting Data Points
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-neutral-500 border-b border-neutral-100 dark:border-neutral-800 uppercase font-black">
                                        <tr>
                                            <th className="px-4 py-3">Location</th>
                                            <th className="px-4 py-3">Stock Item</th>
                                            <th className="px-4 py-3">Current Stock</th>
                                            <th className="px-4 py-3">Daily Burn</th>
                                            <th className="px-4 py-3">Est. Depletion</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800/50">
                                        {analyticData.map((d, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 font-medium text-neutral-dark dark:text-white">{d.location}</td>
                                                <td className="px-4 py-3">{d.item}</td>
                                                <td className={`px-4 py-3 font-bold ${d.stock.includes('units') && parseInt(d.stock) < 200 ? 'text-red-500' : 'text-orange-500'}`}>{d.stock}</td>
                                                <td className="px-4 py-3">{d.burn}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${d.depletion.includes('2.6') ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'}`}>
                                                        {d.depletion}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3">
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="h-10 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-dark dark:text-white text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className={`material-symbols-outlined text-[18px] ${isExporting ? 'animate-bounce' : ''}`}>
                                    {isExporting ? 'downloading' : 'download'}
                                </span>
                                {isExporting ? 'Exporting...' : 'Export Raw Data'}
                            </button>
                            <button
                                onClick={() => setShowSuggestions(!showSuggestions)}
                                className={`h-10 px-6 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${showSuggestions
                                    ? 'bg-primary/20 text-neutral-dark dark:text-white border border-primary/50'
                                    : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">bolt</span>
                                {showSuggestions ? 'Hide Suggestions' : 'Auto-Resolv Suggestions'}
                            </button>
                        </div>

                        {showSuggestions && (
                            <div className="mt-6 animate-in zoom-in-95 fade-in duration-300">
                                <div className="p-5 rounded-2xl bg-neutral-900 dark:bg-black text-white border border-neutral-800 shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold flex items-center gap-2 text-primary">
                                            <span className="material-symbols-outlined filled">bolt</span>
                                            AI-Generated Resolution Paths
                                        </h4>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">3 Optimal Paths Found</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {suggestions.map((s) => (
                                            <div key={s.id} className="group p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-primary/50 transition-all hover:bg-neutral-800">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                                                    </div>
                                                    <h5 className="font-bold text-sm leading-tight text-white">{s.title}</h5>
                                                </div>
                                                <p className="text-xs text-neutral-400 mb-3 line-clamp-2">{s.description}</p>
                                                <div className="flex flex-col gap-2 mt-auto">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-primary font-bold uppercase tracking-tight">{s.benefit}</span>
                                                        <span className="text-[10px] text-neutral-500 font-medium px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">{s.impact}</span>
                                                    </div>
                                                    <button className="w-full h-8 rounded-lg bg-white text-black text-[11px] font-black uppercase tracking-wider hover:bg-primary transition-colors mt-2">
                                                        Apply Path
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
