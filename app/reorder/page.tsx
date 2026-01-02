import { Suspense } from 'react';
import { ReorderPageContent } from './components/ReorderPageContent';

import { snowflakeService as azureService } from '@/lib/snowflakeService';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';

export default async function ReorderPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('simulated_user_id')?.value;
  
  if (!userId) redirect('/');

  const user = getUser(userId);
  if (!user) redirect('/');

  // Fetch Items Scoped to User
  const itemsResult = await azureService.getAllItems(user.section);
  const allItems = Array.isArray(itemsResult) ? itemsResult : itemsResult.items;
  
  let myItems = [];
  if (user.role === 'admin') {
      myItems = allItems.filter(i => i.section === user.section);
  } else {
      myItems = allItems.filter(i => i.ownerId === user.id);
  }

  return (
    <div className="relative min-h-screen">
      <Suspense fallback={
        <div className="w-full max-w-[1440px] mx-auto pb-12 px-4 md:px-6 animate-pulse">
            <div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-8" />
            <div className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-6" />
            <div className="h-96 bg-neutral-100 dark:bg-neutral-800 rounded-3xl" />
        </div>
      }>
        <ReorderPageContent initialItems={myItems} />
      </Suspense>
    </div>
  );
}
