'use client';

import { useState } from 'react';
import { seedFreshData } from '@/app/actions/seedData';

export function SeedDataButton() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [result, setResult] = useState<{success: boolean; message: string; stats: any} | null>(null);

    const handleSeed = async () => {
        if (!confirm('⚠️ This will DELETE ALL existing inventory data and add fresh seed data. Continue?')) {
            return;
        }

        setIsSeeding(true);
        setResult(null);

        try {
            const response = await seedFreshData();
            setResult(response);
        } catch (error) {
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                stats: null
            });
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <button
                onClick={handleSeed}
                disabled={isSeeding}
                className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${
                    isSeeding 
                        ? 'bg-neutral-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-primary to-yellow-500 hover:shadow-lg hover:scale-105'
                }`}
            >
                {isSeeding ? (
                    <span className="flex items-center gap-2">
                        <span className="animate-spin">🌱</span>
                        Seeding Data...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <span>🌱</span>
                        Seed Fresh Data
                    </span>
                )}
            </button>

            {result && (
                <div className={`p-4 rounded-xl ${
                    result.success 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                    <p className={`font-bold ${result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {result.success ? '✅ Success!' : '❌ Error'}
                    </p>
                    <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-300">{result.message}</p>
                    {result.stats && (
                        <div className="mt-2 text-xs text-neutral-500">
                            <p>• PSD: {result.stats.PSD} items</p>
                            <p>• Hospital: {result.stats.Hospital} items</p>
                            <p>• NGO: {result.stats.NGO} items</p>
                        </div>
                    )}
                </div>
            )}

            <p className="text-xs text-neutral-500">
                💡 This will clear all existing data and add 30 realistic items per section (PSD, Hospital, NGO) with full metadata including expiry dates, batch numbers, and suppliers.
            </p>
        </div>
    );
}
