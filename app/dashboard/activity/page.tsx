import { snowflakeService as azureService } from '@/lib/snowflakeService';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import Link from 'next/link';

export default async function ActivityPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('simulated_user_id')?.value;
  
  if (!userId) {
      redirect('/');
  }

  const user = getUser(userId);
  if (!user) redirect('/');

  // Fetch all activities for the user's section
  const activities = await azureService.getRecentActivities(user.section, 100);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark dark:text-white mb-2">Activity Log</h1>
          <p className="text-neutral-500">All recent activities for {user.section} Section</p>
        </div>
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#323118] border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-[#2a2912] rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-neutral-300 mb-4">history</span>
              <p className="text-neutral-500 text-lg">No activities found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                    index % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-800/30' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'alert' ? 'bg-red-100 dark:bg-red-900/30' :
                    activity.type === 'create' ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.type === 'delete' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <span className={`material-symbols-outlined text-[20px] ${
                      activity.type === 'alert' ? 'text-red-600 dark:text-red-400' :
                      activity.type === 'create' ? 'text-green-600 dark:text-green-400' :
                      activity.type === 'delete' ? 'text-orange-600 dark:text-orange-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {activity.type === 'alert' ? 'warning' :
                       activity.type === 'create' ? 'add_circle' :
                       activity.type === 'delete' ? 'delete' :
                       'edit'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-800 dark:text-neutral-200">
                      <span className="font-bold">{activity.user}</span> {activity.action}{' '}
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">{activity.target}</span>
                    </p>
                    <p className="text-xs text-neutral-400 mt-1" suppressHydrationWarning>
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.type === 'alert' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    activity.type === 'create' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    activity.type === 'delete' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
