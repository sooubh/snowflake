'use client';

import { Activity  } from '@/lib/snowflakeService';
import Link from "next/link";

interface RecentActivityFeedProps {
  activities: Activity[];
}

export function RecentActivityFeed({ activities = [] }: RecentActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-[#2a2912] rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-neutral-dark dark:text-white">Recent Activity</h3>
        <Link href="/dashboard/activity" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">View All</Link>
      </div>
      
      <div className="relative border-l-2 border-neutral-100 dark:border-neutral-800 ml-2 space-y-6 pl-4">
        {activities.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">No recent activity.</p>
        ) : activities.map((activity) => (
          <div key={activity.id} className="relative">
            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-[#2a2912] ${
                activity.type === 'alert' ? 'bg-red-500' :
                activity.type === 'create' ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-medium text-neutral-600 dark:text-neutral-400">{activity.target}</span>
            </p>
            <span className="text-xs text-neutral-400" suppressHydrationWarning>{new Date(activity.time).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
