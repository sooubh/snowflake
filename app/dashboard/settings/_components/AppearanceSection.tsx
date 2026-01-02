'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from 'next-themes';
import { useDensity } from '@/app/providers';

export function AppearanceSection() {
    const { theme, setTheme } = useTheme();
    const { density, setDensity } = useDensity();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">Theme</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setTheme('light')}
                        className={clsx(
                            'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                            theme === 'light'
                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        )}
                    >
                        <Sun className={clsx("h-8 w-8 mb-3", theme === 'light' ? 'text-primary' : 'text-neutral-500')} />
                        <span className={clsx("font-medium", theme === 'light' ? 'text-primary-dark dark:text-primary-light' : 'text-neutral-700 dark:text-neutral-300')}>Light</span>
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={clsx(
                            'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                            theme === 'dark'
                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        )}
                    >
                        <Moon className={clsx("h-8 w-8 mb-3", theme === 'dark' ? 'text-primary' : 'text-neutral-500')} />
                        <span className={clsx("font-medium", theme === 'dark' ? 'text-primary-dark dark:text-primary-light' : 'text-neutral-700 dark:text-neutral-300')}>Dark</span>
                    </button>
                    <button
                        onClick={() => setTheme('system')}
                        className={clsx(
                            'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                            theme === 'system'
                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        )}
                    >
                        <Monitor className={clsx("h-8 w-8 mb-3", theme === 'system' ? 'text-primary' : 'text-neutral-500')} />
                        <span className={clsx("font-medium", theme === 'system' ? 'text-primary-dark dark:text-primary-light' : 'text-neutral-700 dark:text-neutral-300')}>System</span>
                    </button>
                </div>
            </div>

            <div>
                <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">Content Density</h4>
                <div className="flex gap-4">
                    <label className={clsx(
                        "flex items-center gap-3 p-4 border rounded-lg cursor-pointer w-full transition-colors",
                        density === 'comfortable' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    )}>
                        <input
                            type="radio"
                            name="density"
                            value="comfortable"
                            checked={density === 'comfortable'}
                            onChange={() => setDensity('comfortable')}
                            className="w-4 h-4 text-primary focus:ring-primary border-neutral-300"
                        />
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium">Comfortable</span>
                    </label>
                    <label className={clsx(
                        "flex items-center gap-3 p-4 border rounded-lg cursor-pointer w-full transition-colors",
                        density === 'compact' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    )}>
                        <input
                            type="radio"
                            name="density"
                            value="compact"
                            checked={density === 'compact'}
                            onChange={() => setDensity('compact')}
                            className="w-4 h-4 text-primary focus:ring-primary border-neutral-300"
                        />
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium">Compact</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
