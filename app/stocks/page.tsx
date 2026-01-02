import { Suspense } from 'react';
import { StockHeatmapTable } from '@/app/dashboard/components/StockHeatmapTable';
import { snowflakeService as azureService } from '@/lib/snowflakeService';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';

export default async function StocksPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('simulated_user_id')?.value;
  
  if (!userId) redirect('/');
  const user = getUser(userId);
  if (!user) redirect('/');

  const itemsResult = await azureService.getAllItems(user.section);
  const allItems = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;
  
  let myItems = [];
  if (user.role === 'admin') {
      myItems = allItems.filter(i => i.section === user.section);
  } else {
      myItems = allItems.filter(i => i.ownerId === user.id);
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-dark dark:text-white">Full Inventory</h1>
        <p className="text-neutral-500 dark:text-neutral-400">View and manage stock across all locations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <Suspense fallback={<div className="h-96 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />}>
             <StockHeatmapTable items={myItems} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
