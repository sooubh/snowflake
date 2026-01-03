"use client";

import { useState, useEffect, useRef } from 'react';
import { StockItem } from '@/lib/snowflakeService';
import { getInventoryChunk } from '@/app/actions/inventory';

interface ChunkedInventoryLoaderProps {
    section: string;
    userId: string;
    role: 'admin' | 'retailer';
    children: (items: StockItem[], isLoading: boolean) => React.ReactNode;
}

export function ChunkedInventoryLoader({ section, userId, role, children }: ChunkedInventoryLoaderProps) {
    const [items, setItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [continuationToken, setContinuationToken] = useState<string | undefined>(undefined);
    const isLoadingRef = useRef(false);
    const hasInitialized = useRef(false);

    // Automatically load chunks sequentially
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            loadAllChunks();
        }
    }, []);

    // Auto-load next chunk when token changes
    useEffect(() => {
        if (continuationToken && !isLoadingRef.current) {
            loadNextChunk();
        }
    }, [continuationToken]);

    const loadAllChunks = async () => {
        // Start with first chunk
        await loadNextChunk();
    };

    const loadNextChunk = async () => {
        if (isLoadingRef.current) return;

        isLoadingRef.current = true;
        setIsLoading(true);

        try {
            console.log(`🔄 ChunkedLoader: Loading chunk for ${role} in ${section}, current total: ${items.length}`);
            const result = await getInventoryChunk(section, userId, role, 50, continuationToken);

            console.log(`📥 ChunkedLoader: Received ${result.items.length} items, token: ${result.continuationToken ? 'HAS MORE' : 'DONE'}`);

            setItems(prev => {
                const newTotal = [...prev, ...result.items];
                console.log(`📊 ChunkedLoader: Total accumulated: ${newTotal.length} items`);
                return newTotal;
            });

            if (result.continuationToken) {
                // More chunks available, set token to trigger next load
                console.log(`🔗 ChunkedLoader: More chunks available, will load next...`);
                setContinuationToken(result.continuationToken);
            } else {
                // All chunks loaded
                console.log(`✅ ChunkedLoader: All chunks loaded! Total: ${items.length + result.items.length} items`);
                setContinuationToken(undefined);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("❌ ChunkedLoader: Failed to load chunk:", error);
            setIsLoading(false);
        } finally {
            isLoadingRef.current = false;
        }
    };

    return <>{children(items, isLoading)}</>;
}
