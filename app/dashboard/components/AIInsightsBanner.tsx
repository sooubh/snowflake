'use client';

import { useState, useEffect } from 'react';
import { getDashboardInsightAction, performAIAction } from '@/app/actions/ai';
import { useRouter } from 'next/navigation';
import { StockInsight } from '@/services/AIService';
import Link from 'next/link';

export function AIInsightsBanner() {
    const router = useRouter();
    const [insight, setInsight] = useState<StockInsight | null>(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);

    useEffect(() => {
        async function loadInsight() {
            try {
                const data = await getDashboardInsightAction();
                if (data) setInsight(data);
            } catch (e) {
                console.error("Failed to load insight", e);
            } finally {
                setLoading(false);
            }
        }
        loadInsight();
    }, []);

    const handleAction = async () => {
        if (!insight?.suggestedToolAction) return;

        setExecuting(true);
        try {
            const result = await performAIAction(insight.suggestedToolAction);

            if (result.success) {
                alert(result.message); // Simple feedback
                if (result.redirectPath) {
                    router.push(result.redirectPath);
                } else {
                    // If it was a data update (like PO creation), refresh the page to show latest data
                    router.refresh();
                    window.location.reload();
                }
            } else {
                alert(`Action Failed: ${result.message}`);
            }
        } catch (e) {
            alert("Something went wrong executing the action.");
        } finally {
            setExecuting(false);
        }
    };

    if (loading) return null; // Or a skeleton
    if (!insight) return null;

    // Determine Impact Color
    const impactColor = insight.sentiment === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
        insight.sentiment === 'warning' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

    return (
        <div className="relative overflow-hidden bg-white dark:bg-[#1f1e0b] rounded-3xl p-6 shadow-sm border border-transparent dark:border-neutral-800 hover:shadow-md transition-all group">
            {/* Decorative Gradient Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${insight.sentiment === 'critical' ? 'from-red-500 to-orange-500' : 'from-primary via-blue-400 to-primary'}`}></div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 ${insight.sentiment === 'critical' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">AI Forecast</span>
                        <span className={`${impactColor} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide`}>
                            {insight.sentiment}
                        </span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-neutral-dark dark:text-white mb-1">
                        {insight.summary}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                        {/* If we have an actionable suggestion text, show it, otherwise show summary details if we had them */}
                        {insight.actionableSuggestion}
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button
                        onClick={() => setInsight(null)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Dismiss
                    </button>

                    {insight.suggestedToolAction && (
                        <button
                            onClick={handleAction}
                            disabled={executing}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {executing ? (
                                <>
                                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Perform Action</span>
                                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
