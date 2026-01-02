'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

function Toggle({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (checked: boolean) => void }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="space-y-0.5">
                <label className="text-base font-medium text-slate-800 dark:text-slate-200 block">
                    {label}
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={clsx(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
                    checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                )}
            >
                <span
                    aria-hidden="true"
                    className={clsx(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        checked ? 'translate-x-5' : 'translate-x-0'
                    )}
                />
            </button>
        </div>
    );
}

export function NotificationsSection() {
    const [settings, setSettings] = useState({
        marketingEmails: false,
        securityAlerts: true,
        newFeatures: true,
        activityDigest: false,
        directMessages: true,
        pushNotifications: true,
    });

    const updateSetting = (key: keyof typeof settings) => (val: boolean) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">Email Notifications</h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 border border-slate-200 dark:border-slate-800">
                    <Toggle
                        label="Marketing Emails"
                        description="Receive emails about new products, features, and more."
                        checked={settings.marketingEmails}
                        onChange={updateSetting('marketingEmails')}
                    />
                    <Toggle
                        label="Security Alerts"
                        description="Get notified about important security alerts and login attempts."
                        checked={settings.securityAlerts}
                        onChange={updateSetting('securityAlerts')}
                    />
                    <Toggle
                        label="New Features"
                        description="Be the first to know about new features and updates."
                        checked={settings.newFeatures}
                        onChange={updateSetting('newFeatures')}
                    />
                </div>
            </div>

            <div>
                <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">Activity Notifications</h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 border border-slate-200 dark:border-slate-800">
                    <Toggle
                        label="Weekly Digest"
                        description="Get a weekly summary of your dashboard activity."
                        checked={settings.activityDigest}
                        onChange={updateSetting('activityDigest')}
                    />
                    <Toggle
                        label="Direct Messages"
                        description="Receive notifications when someone sends you a message."
                        checked={settings.directMessages}
                        onChange={updateSetting('directMessages')}
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end bg-white dark:bg-transparent sticky bottom-0">
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all">
                    Save Preferences
                </button>
            </div>
        </div>
    );
}
