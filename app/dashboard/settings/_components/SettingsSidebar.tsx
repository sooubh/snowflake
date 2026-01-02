'use client';

import { User, Bell, Palette, Shield, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { SettingsTab } from '../page';

interface SettingsSidebarProps {
    activeTab: SettingsTab;
    onTabChange: (tab: SettingsTab) => void;
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
    const items = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'data', label: 'Data Management', icon: Database },
    ] as const;

    return (
        <nav className="flex flex-col space-y-1">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={clsx(
                        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors w-full text-left',
                        activeTab === item.id
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-primary/20 dark:text-primary-light'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#323118] dark:hover:text-white'
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </button>
            ))}
        </nav>
    );
}
