'use client';

import { useEffect, useState } from 'react';
import { StockInsight } from '@/services/AIService';
import { getReportInsightAction } from '@/app/actions/ai';

interface ReportAIInsightProps {
  contextData: string; // The data to analyze (can be raw JSON string or text)
  type: 'sales' | 'inventory' | 'procurement' | 'team';
}

export function ReportAIInsight({ contextData, type }: ReportAIInsightProps) {
  const [insight, setInsight] = useState<StockInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      if (!contextData) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const aiResponse = await getReportInsightAction(contextData);
        if (aiResponse) setInsight(aiResponse);
      } catch (e) {
        console.error("Failed to load insight", e);
      } finally {
        setLoading(false);
      }
    }
    // fetchInsight(); 
  }, [contextData]);

  // Placeholder render until we hook up the real action
  if (!insight && !loading) return null;

  if (loading) return <div className="animate-pulse h-20 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-6"></div>;

  return (
    <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-[#1e1e1e] dark:to-[#252525] rounded-xl border border-blue-100 dark:border-neutral-700 shadow-sm p-4 flex gap-4 items-start">
      <div className={`p-2 rounded-lg shrink-0 ${insight?.sentiment === 'critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} dark:bg-opacity-20`}>
        <span className="material-symbols-outlined">auto_awesome</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-500">AI Report Analysis</h4>
          {insight?.sentiment === 'critical' && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">ATTENTION</span>}
        </div>
        <p className="text-neutral-800 dark:text-neutral-200 font-medium leading-relaxed">
          {insight?.summary}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="material-symbols-outlined text-[16px]">lightbulb</span>
          <span>{insight?.actionableSuggestion}</span>
        </div>
      </div>
    </div>
  );
}
