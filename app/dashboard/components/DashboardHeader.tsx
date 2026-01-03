import { UserProfile } from '@/lib/auth';
import { ExportOptions } from '@/app/dashboard/components/ExportOptions';
import { FilterPopover } from '@/app/dashboard/components/FilterPopover';
import { SeedDataButton } from '@/components/SeedDataButton';
import { UserProfilePill } from './UserProfilePill';

interface DashboardHeaderProps {
  user: UserProfile;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between py-6 px-8 bg-white dark:bg-[#1f1e0b] border-b border-slate-100 dark:border-neutral-800 mb-8 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {user.section} Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <SeedDataButton />
          <FilterPopover />
          <ExportOptions />
        </div>
        <div className="pl-6 border-l border-slate-200 dark:border-neutral-800">
          <UserProfilePill user={user} />
        </div>
      </div>
    </header>
  );
}
