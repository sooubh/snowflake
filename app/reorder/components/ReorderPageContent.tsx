'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReorderStats } from './ReorderStats';
import { ReorderFilters } from './ReorderFilters';
import { ReorderTable } from './ReorderTable';
import { StickyActionFooter } from './StickyActionFooter';
import { ItemDetailsModal } from './ItemDetailsModal';
import { EditItemModal } from './EditItemModal';
import { StockItem  } from '@/lib/snowflakeService';
import { markItemsAsOrdered } from '@/app/actions/procurement';

interface ReorderPageContentProps {
    initialItems: StockItem[];
}

export function ReorderPageContent({ initialItems }: ReorderPageContentProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [activeItem, setActiveItem] = useState<StockItem | null>(null);
    const [modalMode, setModalMode] = useState<'edit' | 'details' | null>(null);

    // Filter Logic Client-Side (or could be server-side, but client is smoother for filters)
    // Actually, ReorderTable does filtering. We just pass raw items.


    const router = useRouter();

    const handleMarkOrdered = async () => {
        if (selectedIds.length === 0) return;

        try {
            const success = await markItemsAsOrdered(selectedIds);
            if (success) {
                setShowFeedback(true);
                setSelectedIds([]);
                setTimeout(() => {
                    setShowFeedback(false);
                }, 3000);
            } else {
                alert("Failed to mark items as ordered. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred.");
        }
    };

    const handleSendToProcurement = () => {
        if (selectedIds.length === 0) return;
        const queryParams = new URLSearchParams();
        queryParams.set('items', selectedIds.join(','));
        router.push(`/procurement?${queryParams.toString()}`);
    };

    const handleView = (item: StockItem) => {
        setActiveItem(item);
        setModalMode('details');
    };

    const handleEdit = (item: StockItem) => {
        setActiveItem(item);
        setModalMode('edit');
    };

    const handleSaveEdit = async (updatedItem: StockItem) => {
        // In a real implementation, this would call an API to update the item
        // For now, we'll just refresh the page to show any updates
        setModalMode(null);
        setActiveItem(null);
        
        // Trigger a page refresh to reload data from server
        router.refresh();
    };

    return (
        <div className="w-full max-w-[1440px] mx-auto pb-12 px-4 md:px-6">
            {showFeedback && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-primary text-black px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 border border-black/10">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Order successfully processed for selected items
                    </div>
                </div>
            )}
            <ReorderStats items={initialItems} />
            <ReorderFilters />
            <ReorderTable
                items={initialItems}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onViewItem={handleView}
                onEditItem={handleEdit}
            />
            <StickyActionFooter
                selectedCount={selectedIds.length}
                selectedItems={initialItems.filter(item => selectedIds.includes(item.id))}
                onMarkOrdered={handleMarkOrdered}
                onSendToProcurement={handleSendToProcurement}
            />

            {activeItem && modalMode === 'details' && (
                <ItemDetailsModal item={activeItem} onClose={() => setModalMode(null)} />
            )}
            {activeItem && modalMode === 'edit' && (
                <EditItemModal item={activeItem} onClose={() => setModalMode(null)} onSave={handleSaveEdit} />
            )}
        </div>
    );
}
