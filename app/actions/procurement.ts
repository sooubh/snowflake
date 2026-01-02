'use server';

import { snowflakeService as azureService, PurchaseOrder, StockItem  } from '@/lib/snowflakeService';

export async function fetchItemsForProcurement(itemComponentIds: string[]) {
    // specific helper to fetch multiple items by ID-Section
    // itemComponentIds are valid "id-section" strings

    // Efficiency: getGlobalItems() is okay for small datasets (100 items), but filtering is better.
    // For now, fetching global is simplest implementation of existing service.
    const allItems = await azureService.getGlobalItems();

    return allItems.filter((item: StockItem) =>
        itemComponentIds.includes(`${item.id}-${item.section}`)
    );
}

export async function createPurchaseOrder(order: any) {
    // 'any' for now to avoid strict type mismatch if Omit is tricky across boundary
    // But better to type it.
    // Ensure ID is generated here or passed? Service generates ID.
    return await azureService.createOrder(order);
}

export async function getPurchaseOrders() {
    return await azureService.getOrders();
}

export async function updatePurchaseOrder(id: string, updates: any, status: string) {
    return await azureService.updateOrder(id, updates, status);
}

export async function cancelPurchaseOrder(id: string, currentStatus: string) {
    return await azureService.updateOrder(id, { status: 'CANCELLED' }, currentStatus);
}

export async function receiveOrderItems(order: PurchaseOrder) {
    // Server-side logic to receive items
    // This transactionally updates stock
    let success = true;
    for (const item of order.items) {
        try {
            const current = await azureService.getItem(item.itemId, item.section);
            if (current) {
                await azureService.updateItem(item.itemId, {
                    quantity: current.quantity + item.requestedQuantity
                }, item.section);
            }
        } catch (e) {
            console.error(`Failed to update item ${item.itemId}`, e);
            success = false;
        }
    }

    if (success) {
        await azureService.updateOrder(order.id, { status: 'RECEIVED' }, order.status);
    }
    return success;
    return success;
}

export async function markItemsAsOrdered(itemComponentIds: string[]) {
    // Manually create a received order to 'clear' them from reorder need effectively?
    // Or closer to a 'Manual Order' that is PENDING.
    // Let's create a PENDING order with 0 quantity custom request? 
    // Actually, let's assume "Mark Ordered" means "I bought enough to fill them up" (Manual Restock) 
    // OR "I placed an order elsewhere". 
    // Let's go with: Create a PENDING order so it shows in Procurement History as generic.

    // FETCH ITEMS
    const allItems = await azureService.getGlobalItems();
    const selected = allItems.filter(item =>
        itemComponentIds.includes(`${item.id}-${item.section}`)
    );

    if (selected.length === 0) return false;

    const newOrder: any = {
        poNumber: `MANUAL-${Date.now()}`,
        dateCreated: new Date().toISOString(),
        status: 'PENDING',
        items: selected.map(item => ({
            itemId: item.id,
            name: item.name,
            currentStock: item.quantity,
            requestedQuantity: Math.max(0, (item.minQuantity || 20) * 2 - item.quantity), // Auto-calc suggested
            unit: item.unit || 'units',
            section: item.section,
            price: item.price
        })),
        createdBy: 'Manual Action',
        notes: 'Marked as ordered from Reorder Page manually.'
    };

    await azureService.createOrder(newOrder);
    return true;
}
