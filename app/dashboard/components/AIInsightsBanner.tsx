'use client';

import { useState } from 'react';
import Link from 'next/link';

export function AIInsightsBanner() {
  // Simulating a "Real" useful insight for the demo
  interface Insight {
    summary: string;
    details: string;
    action: string;
    actionLink: string;
    impact: string;
  }

  const [insight, setInsight] = useState<Insight | null>({
    summary: "Stock Optimization Opportunity",
    details: "Demand for 'Paracetamol 500mg' is projected to rise by 40% next week due to seasonal flu trends.",
    action: "Reorder Now",
    actionLink: "/reorder?item=paracetamol&quantity=500",
    impact: "High Impact"
  });

  if (!insight) return null;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#1f1e0b] rounded-3xl p-6 shadow-sm border border-transparent dark:border-neutral-800 hover:shadow-md transition-all group">
       {/* Decorative Gradient Line */}
       <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-orange-400 to-primary"></div>
       
       <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">AI Forecast</span>
                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {insight.impact}
                    </span>
                </div>
                <h3 className="text-xl font-display font-bold text-neutral-dark dark:text-white mb-1">
                     {insight.summary}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                   {insight.details}
                </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                <button 
                    onClick={() => setInsight(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    Dismiss
                </button>
                <Link 
                    href={insight.actionLink} 
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    <span>{insight.action}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
            </div>
       </div>
    </div>
  );
}
