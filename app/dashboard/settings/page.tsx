'use client';

import { useState } from 'react';
import { SettingsSidebar } from './_components/SettingsSidebar';
import { ProfileSection } from './_components/ProfileSection';
import { NotificationsSection } from './_components/NotificationsSection';
import { AppearanceSection } from './_components/AppearanceSection';
import { DataSection } from './_components/DataSection';
import { SecuritySection } from './_components/SecuritySection';

export type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'security' | 'data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-8rem)]">
      <div className="w-full md:w-64 flex-shrink-0">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1f1e0b] rounded-xl shadow-sm border border-slate-200 dark:border-neutral-800 p-6">
        <h1 className="text-2xl font-bold mb-6 capitalize text-slate-800 dark:text-slate-100">
          {activeTab.replace('data', 'Data Management')} Settings
        </h1>
        {activeTab === 'profile' && <ProfileSection />}
        {activeTab === 'notifications' && <NotificationsSection />}
        {activeTab === 'appearance' && <AppearanceSection />}
        {activeTab === 'security' && <SecuritySection />}
        {activeTab === 'data' && <DataSection />}
      </div>
    </div>
  );
}
