import { Suspense } from 'react';
import { DashboardHeader } from './components/DashboardHeader';
import { AIInsightsBanner } from './components/AIInsightsBanner';
import { StatsGrid } from './components/StatsGrid';
import { StoreHealthOverview } from './components/StoreHealthOverview';
import { AlertsSidebar } from './components/AlertsSidebar';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { StockHeatmapTable } from './components/StockHeatmapTable';
import { snowflakeService as azureService } from '@/lib/snowflakeService';
import { getUser } from '@/lib/auth';
import { getStockStatus } from './lib/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('simulated_user_id')?.value;
  
  if (!userId) {
    redirect('/');
  }

  const user = getUser(userId);
  if (!user) redirect('/');

  // Fetch ALL items in the section at once - NO CHUNKING
  const allItems = await azureService.getAllItems(user.section);
  
  console.log(`📊 Dashboard: Loaded ${Array.isArray(allItems) ? allItems.length : 0} total items for ${user.role} in ${user.section}`);
  
  // Admin sees ALL items in section (all stores), Retailer sees only their own
  const myItems = user.role === 'admin' 
    ? (Array.isArray(allItems) ? allItems.filter(i => i.section === user.section) : [])
    : (Array.isArray(allItems) ? allItems.filter(i => i.ownerId === user.id) : []);

  console.log(`✅ Dashboard: Showing ${myItems.length} items for ${user.role}${user.role === 'admin' ? ' (ALL STORES)' : ''}`);

  const recentActivities = await azureService.getRecentActivities(user.section);

  // Calculate alerts
  const criticalItems = myItems.filter(i => {
    const status = getStockStatus(i.quantity, 0);
    return status === 'critical' || status === 'low';
  });

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col gap-6">
      
      {/* 1. Full Width AI Insights */}
      <div className="w-full">
        <AIInsightsBanner />
      </div>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-neutral-dark dark:text-white tracking-tight">Dashboard</h1>
            <p className="text-neutral-500 font-medium">
              Overview for {user.section} - Showing {myItems.length} items {user.role === 'admin' ? 'from all stores' : 'from your store'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-[#1f1e0b] px-4 py-2 rounded-full border border-transparent dark:border-neutral-800 shadow-sm flex items-center gap-3">
              <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-300">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-neutral-dark dark:text-white leading-none">{user.name}</span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="h-40 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-3xl" />}>
          <StatsGrid items={myItems} />
        </Suspense>

        {/* Heatmap & Store Overview Section */}
        <div className="flex flex-col gap-6">
          <Suspense fallback={<div className="h-96 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-3xl" />}>
            <StockHeatmapTable items={myItems} limit={10} />
          </Suspense>
          
          <Suspense fallback={<div className="h-40 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-3xl" />}>
            <StoreHealthOverview items={myItems} />
          </Suspense>
        </div>

        {/* Alerts & Activity Section */}
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1">
            <AlertsSidebar alerts={criticalItems} />
          </div>
          <div className="flex-1">
            <RecentActivityFeed activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
