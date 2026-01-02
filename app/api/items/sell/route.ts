import { NextResponse } from 'next/server';
import { snowflakeService as azureService, Transaction  } from '@/lib/snowflakeService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            items,
            section,
            transactionType = 'SALE',
            paymentMethod = 'CASH',
            customerName,
            customerContact,
            operatorId = 'System'
        } = body;

        if (!items || !Array.isArray(items) || items.length === 0 || !section) {
            return NextResponse.json({ error: 'Missing items or section' }, { status: 400 });
        }

        const processedItems: Transaction['items'] = [];
        let totalAmount = 0;
        const failedItems: string[] = [];

        // 1. Process each item (Validation & Stock Check)
        for (const cartItem of items) {
            const item = await azureService.getItem(cartItem.itemId, section);

            if (!item) {
                failedItems.push(`Item ${cartItem.itemId} not found`);
                continue;
            }

            if (item.quantity < cartItem.quantity) {
                failedItems.push(`Insufficient stock for ${item.name}. Available: ${item.quantity}`);
                continue;
            }

            // Calculate financial details
            const subtotal = cartItem.quantity * cartItem.price;
            const tax = subtotal * 0.18; // Assuming 18% GST/VAT for now (can be dynamic later)
            const itemTotal = subtotal + tax; // Just storing subtotal in transaction item, usually. Let's align with interface.

            processedItems.push({
                itemId: item.id,
                name: item.name,
                quantity: cartItem.quantity,
                unitPrice: cartItem.price,
                tax: tax,
                subtotal: subtotal
            });
            totalAmount += (subtotal + tax);
        }

        if (failedItems.length > 0) {
            return NextResponse.json({ error: 'Validation failed', details: failedItems }, { status: 400 });
        }

        // 2. Deduct Stock & Update Status
        for (const processedItem of processedItems) {
            const item = await azureService.getItem(processedItem.itemId, section);
            if (item) {
                const newQuantity = item.quantity - processedItem.quantity;
                const newStatus = newQuantity > 100 ? 'In Stock' : newQuantity > 0 ? 'Low Stock' : 'Out of Stock';

                await azureService.updateItem(processedItem.itemId, {
                    quantity: newQuantity,
                    status: newStatus
                }, section);

                // Log activity for each item sold
                await azureService.logActivity(
                    operatorId,
                    `sold ${processedItem.quantity} units`,
                    processedItem.name,
                    'update',
                    section
                );
            }
        }

        // 3. Create Transaction Record
        const transaction: Omit<Transaction, "id"> = {
            invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            date: new Date().toISOString(),
            type: transactionType,
            items: processedItems,
            totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimals
            paymentMethod,
            customerName,
            customerContact,
            section,
            performedBy: operatorId
        };

        const createdTransaction = await azureService.createTransaction(transaction);

        if (!createdTransaction) {
            // CRITICAL: In a real system, we'd need a rollback mechanism here if transaction creation fails but stock was deducted.
            // For this scope, we'll log a severe error.
            console.error("CRITICAL: Stock deducted but Transaction creation failed for", transaction);
            return NextResponse.json({ error: 'Transaction recording failed, but stock updated.' }, { status: 500 });
        }

        // 4. Log Main Activity
        await azureService.logActivity(operatorId, `processed ${transactionType}`, `Invoice #${createdTransaction.invoiceNumber}`, 'create', section);

        // 5. Return transaction data along with updated items for client-side updates
        return NextResponse.json({
            ...createdTransaction,
            updatedItems: processedItems.map(pi => pi.itemId)
        });

    } catch (error) {
        console.error("Sell error:", error);
        return NextResponse.json({ error: 'Failed to process sale' }, { status: 500 });
    }
}
