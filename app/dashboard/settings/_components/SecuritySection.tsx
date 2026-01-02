'use client';

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
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
        </div>
    );
}

export function SecuritySection() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">Change Password</h4>
                <div className="grid grid-cols-1 gap-6 max-w-xl">
                    <div className="space-y-2">
                        <label htmlFor="currentPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
                        />
                    </div>
                    <div>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all">
                            Update Password
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">Two-Factor Authentication</h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 border border-slate-200 dark:border-slate-800">
                    <Toggle
                        label="Authenticator App"
                        description="Use an authentication app to generate one-time codes."
                        checked={false}
                        onChange={() => { }}
                    />
                    <Toggle
                        label="SMS Authentication"
                        description="Receive one-time codes via SMS."
                        checked={true}
                        onChange={() => { }}
                    />
                </div>
            </div>
        </div>
    );
}
