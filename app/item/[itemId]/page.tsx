import { ItemProfileCard } from '@/app/item/components/ItemProfileCard';
import { StockChartVisual } from '@/app/item/components/StockChartVisual';
import { RiskAssessmentCard } from '@/app/item/components/RiskAssessmentCard';
import { snowflakeService as azureService } from '@/lib/snowflakeService';
import { notFound } from 'next/navigation';
import { ItemHeaderActions } from '../components/ItemHeaderActions';

type Props = {
    params: Promise<{ itemId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ItemPage({ params, searchParams }: Props) {
  const { itemId } = await params;
  const resolvedSearchParams = await searchParams;
  const section = typeof resolvedSearchParams.section === 'string' ? resolvedSearchParams.section : undefined;

  if (!section) {
      // Handle missing section gracefully, maybe redirect or show error?
      // For now, let's try to find it or just error.
      // Since our new URL structure REQUIRES section, we can assume it's there or 404.
      return <div className="p-10 text-center">Missing Section Parameter</div>;
  }

  const item = await azureService.getItem(itemId, section);

  if (!item) {
      notFound();
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
      <main className="flex-1 px-6 md:px-10 py-8 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <a className="text-neutral-500 hover:text-primary transition-colors font-medium" href="/stocks">Inventory</a>
              <span className="text-neutral-500 font-medium">/</span>
              <a className="text-neutral-500 hover:text-primary transition-colors font-medium" href="#">{item.category}</a>
              <span className="text-neutral-500 font-medium">/</span>
              <span className="text-neutral-dark dark:text-white font-medium">{item.name}</span>
            </div>
            <h1 className="text-neutral-dark dark:text-white text-3xl font-bold leading-tight tracking-tight">{item.name}</h1>
          </div>
          <div className="flex gap-3">
            <ItemHeaderActions />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Item Profile */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <ItemProfileCard item={item} />

            {/* Quick Stats Mini */}
            <div className="bg-white dark:bg-[#1a190b] rounded-xl p-5 shadow-sm border border-neutral-100 dark:border-neutral-700">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-neutral-dark dark:text-white">
                <span className="material-symbols-outlined text-primary">verified</span>
                Quality Check
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Batch #{item.batchNumber || 'N/A'}</span>
                  <span className="text-green-600 font-medium">Passed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Temp Control</span>
                  <span className="text-green-600 font-medium">Stable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel: Stock Trend Chart */}
          <div className="lg:col-span-6 flex flex-col h-full gap-6">
            <div className="bg-white dark:bg-[#1a190b] rounded-xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 flex-1 flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-dark dark:text-white">Consumption Forecast</h2>
                  <p className="text-neutral-500 text-sm">Historical usage vs. predicted depletion</p>
                </div>
                <div className="flex bg-background-light dark:bg-[#23220f] p-1 rounded-full border border-neutral-100 dark:border-neutral-700">
                  <button className="px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-[#1a190b] shadow-sm text-neutral-dark dark:text-white">1W</button>
                  <button className="px-3 py-1 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-dark dark:hover:text-white transition-colors">1M</button>
                  <button className="px-3 py-1 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-dark dark:hover:text-white transition-colors">3M</button>
                  <button className="px-3 py-1 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-dark dark:hover:text-white transition-colors">6M</button>
                </div>
              </div>

              <StockChartVisual />

              <div className="flex gap-6 mt-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
                  <span className="text-xs font-medium text-neutral-500">Historical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-primary border-b-2 border-dotted border-white/20"></div>
                  <span className="text-xs font-medium text-neutral-500">Predicted Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/50"></div>
                  <span className="text-xs font-medium text-neutral-500">Confidence Range</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Risk Explanation & AI Insight */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <RiskAssessmentCard />
          </div>
        </div>
      </main>
    </div>
  );
}
